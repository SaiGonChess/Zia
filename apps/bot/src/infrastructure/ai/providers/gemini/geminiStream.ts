/**
 * Gemini Stream - Xử lý streaming responses
 */
import type { Content } from '@google/genai';
import { CONFIG } from '../../../../core/config/config.js';
import {
  debugLog,
  logAIHistory,
  logAIResponse,
  logError,
  logSystemPrompt,
} from '../../../../core/logger/logger.js';
import { fixStuckTags } from '../../../../shared/utils/tagFixer.js';
import { checkInputTokens } from '../../../../shared/utils/tokenCounter.js';
import {
  buildMessageParts,
  deleteChatSession,
  getChatSession,
  isRetryableError,
  sleep,
} from './geminiChat.js';
import { keyManager, type MediaPart } from './geminiConfig.js';
import { isPermissionDeniedError, isRateLimitError } from './keyManager.js';
import { getSystemPrompt } from './prompts.js';

export interface StreamCallbacks {
  onReaction?: (reaction: string) => Promise<void>;
  onSticker?: (keyword: string) => Promise<void>;
  onMessage?: (text: string, quoteIndex?: number) => Promise<void>;
  onCard?: (userId?: string) => Promise<void>;
  onUndo?: (index: number | 'all' | { start: number; end: number }) => Promise<void>;
  onImage?: (url: string, caption?: string) => Promise<void>;
  onComplete?: () => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
  signal?: AbortSignal;
}

interface ParserState {
  buffer: string;
  sentReactions: Set<string>;
  sentStickers: Set<string>;
  sentMessages: Set<string>;
  sentCards: Set<string>;
  sentUndos: Set<string>;
  sentImages: Set<string>;
  // Track sent message texts để tránh gửi tin nhắn trùng lặp hoặc là prefix của tin đã gửi
  sentMessageTexts: string[];
}

/**
 * Kiểm tra xem tin nhắn mới có nên được gửi không
 * Trả về false nếu:
 * - Tin nhắn đã được gửi trước đó (exact match)
 * - Tin nhắn là prefix của tin đã gửi (streaming partial)
 * - Tin nhắn là extension của tin đã gửi (cần skip vì đã gửi phần đầu)
 */
function shouldSendMessage(newText: string, sentTexts: string[]): boolean {
  const normalizedNew = newText.trim().toLowerCase();
  
  for (const sent of sentTexts) {
    const normalizedSent = sent.trim().toLowerCase();
    
    // Exact match - đã gửi rồi
    if (normalizedNew === normalizedSent) {
      return false;
    }
    
    // New text là prefix của tin đã gửi - không gửi vì đã gửi bản đầy đủ hơn
    if (normalizedSent.startsWith(normalizedNew)) {
      return false;
    }
    
    // New text là extension của tin đã gửi - không gửi vì đã gửi phần đầu
    // Chỉ skip nếu overlap > 80% để tránh false positive
    if (normalizedNew.startsWith(normalizedSent)) {
      const overlapRatio = normalizedSent.length / normalizedNew.length;
      if (overlapRatio > 0.8) {
        return false;
      }
    }
  }
  
  return true;
}

// Base Zalo reactions
const ZALO_REACTIONS = new Set(['heart', 'haha', 'wow', 'sad', 'angry', 'like']);

// Map emoji/text to base Zalo reaction
const EMOJI_TO_REACTION: Record<string, string> = {
  // Heart variants -> heart
  '❤️': 'heart', '❤': 'heart', '💖': 'heart', '💕': 'heart', '💗': 'heart',
  '💓': 'heart', '💘': 'heart', '💝': 'heart', '💞': 'heart', '🥰': 'heart',
  '😍': 'heart', '🤗': 'heart', '💔': 'heart',
  
  // Like/thumbs up variants -> like
  '👍': 'like', '👍🏻': 'like', '👍🏼': 'like', '👍🏽': 'like', '👍🏾': 'like', '👍🏿': 'like',
  '👏': 'like', '🙌': 'like', '🫡': 'like', '✨': 'like', '🎉': 'like', '🥳': 'like',
  '🤩': 'like', '😎': 'like', '🔥': 'like', '💯': 'like',
  
  // Thumbs down -> angry
  '👎': 'angry',
  
  // Haha/funny variants -> haha
  '😂': 'haha', '🤣': 'haha', '😆': 'haha', '😁': 'haha', '😄': 'haha',
  '🤭': 'haha', '😜': 'haha', '😝': 'haha', '🤪': 'haha', '🙃': 'haha',
  '🤤': 'haha', '🥲': 'haha',
  
  // Wow/surprised variants -> wow
  '😮': 'wow', '😯': 'wow', '😲': 'wow', '🤯': 'wow', '😱': 'wow',
  '😳': 'wow', '🫣': 'wow', '🫠': 'wow', '🧐': 'wow', '🤓': 'wow',
  '😦': 'wow', '😧': 'wow', '😨': 'wow',
  
  // Sad variants -> sad
  '😢': 'sad', '😭': 'sad', '🥺': 'sad', '😿': 'sad', '💧': 'sad',
  '😰': 'sad', '😥': 'sad', '😓': 'sad', '😞': 'sad', '😔': 'sad',
  
  // Angry variants -> angry
  '😡': 'angry', '😠': 'angry', '🤬': 'angry', '💢': 'angry', '👿': 'angry',
  '😤': 'angry', '🙄': 'angry',
  
  // Neutral/thinking -> like (default to positive)
  '🤔': 'like', '🤨': 'like', '🥸': 'like', '🤡': 'like',
  '😶': 'like', '😐': 'like', '😑': 'like', '😬': 'like',
  '🤫': 'like', '🤥': 'like',
};

// Combined valid reactions
const VALID_REACTIONS = new Set([
  ...ZALO_REACTIONS,
  ...Object.keys(EMOJI_TO_REACTION),
]);

/**
 * Normalize reaction: convert emoji/variant to base Zalo reaction
 */
function normalizeReaction(reaction: string): string | null {
  const lower = reaction.toLowerCase();
  
  if (ZALO_REACTIONS.has(lower)) {
    return lower;
  }
  
  if (EMOJI_TO_REACTION[reaction]) {
    return EMOJI_TO_REACTION[reaction];
  }
  
  return null;
}

// Regex patterns để strip tags - hỗ trợ cả emoji
const TAG_PATTERNS = [
  /\[reaction:(\d+:)?[^\]]+\]/gi, // Hỗ trợ emoji
  /\[sticker:\w+\]/gi,
  /\[quote:-?\d+\][\s\S]*?\[\/quote\]/gi,
  /\[msg\][\s\S]*?\[\/msg\]/gi,
  /\[undo:(?:-?\d+:-?\d+|-?\d+|all)\]/gi,
  /\[card(?::\d+)?\]/gi,
  /\[tool:\w+(?:\s+[^\]]*?)?\](?:\s*\{[\s\S]*?\}\s*\[\/tool\])?/gi,
  /\[image:https?:\/\/[^\]]+\][\s\S]*?\[\/image\]/gi,
];

function getPlainText(buffer: string): string {
  return TAG_PATTERNS.reduce((text, pattern) => text.replace(pattern, ''), buffer).trim();
}

// Inline tag patterns để strip khỏi text content - hỗ trợ emoji
const INLINE_TAG_PATTERNS = [
  /\[reaction:(\d+:)?[^\]]+\]/gi, // Hỗ trợ emoji
  /\[sticker:\w+\]/gi,
  /\[undo:(?:-?\d+:-?\d+|-?\d+|all)\]/gi,
  /\[card(?::\d+)?\]/gi,
];

function cleanInlineTags(text: string): string {
  return INLINE_TAG_PATTERNS.reduce((t, pattern) => t.replace(pattern, ''), text).trim();
}

/**
 * Xử lý các inline tags bên trong text block ([msg] hoặc [quote])
 * Extract và gửi sticker, reaction, link, card, undo trước khi gửi text
 * 
 * ⚠️ QUAN TRỌNG: Undo được xử lý TRƯỚC các tags khác để đảm bảo
 * tin nhắn cũ được thu hồi trước khi gửi tin mới
 */
async function processInlineTags(
  rawText: string,
  state: ParserState,
  callbacks: StreamCallbacks,
): Promise<void> {
  // Fix stuck tags trước khi parse
  const text = fixStuckTags(rawText);

  // ⚠️ Extract undos TRƯỚC - hỗ trợ [undo:-1], [undo:-1:-3], [undo:all]
  // Phải xử lý undo trước để thu hồi tin nhắn cũ trước khi gửi tin mới
  for (const match of text.matchAll(/\[undo:(all|(-?\d+)(?::(-?\d+))?)\]/gi)) {
    const fullMatch = match[1];
    const key = `undo:${fullMatch}`;
    
    if (!state.sentUndos.has(key) && callbacks.onUndo) {
      state.sentUndos.add(key);
      
      if (fullMatch === 'all') {
        await callbacks.onUndo('all');
      } else if (match[3] !== undefined) {
        // Range: [undo:-1:-3]
        const start = parseInt(match[2], 10);
        const end = parseInt(match[3], 10);
        await callbacks.onUndo({ start, end });
      } else {
        // Single: [undo:-1]
        const index = parseInt(match[2], 10);
        await callbacks.onUndo(index);
      }
    }
  }

  // Extract stickers
  for (const match of text.matchAll(/\[sticker:(\w+)\]/gi)) {
    const keyword = match[1];
    const key = `sticker:${keyword}`;
    if (!state.sentStickers.has(key) && callbacks.onSticker) {
      state.sentStickers.add(key);
      await callbacks.onSticker(keyword);
    }
  }

  // Extract reactions (không có index vì đang trong msg block) - hỗ trợ emoji
  for (const match of text.matchAll(/\[reaction:(\d+:)?([^\]]+)\]/gi)) {
    const indexPart = match[1];
    const rawReaction = match[2].trim();
    const normalizedReaction = normalizeReaction(rawReaction);
    
    if (!normalizedReaction) continue;
    
    const key = indexPart ? `reaction:${indexPart}${normalizedReaction}` : `reaction:${normalizedReaction}`;
    if (!state.sentReactions.has(key) && callbacks.onReaction) {
      state.sentReactions.add(key);
      await callbacks.onReaction(
        indexPart ? `${indexPart.replace(':', '')}:${normalizedReaction}` : normalizedReaction,
      );
    }
  }

  // Extract cards
  for (const match of text.matchAll(/\[card(?::(\d+))?\]/gi)) {
    const userId = match[1] || '';
    const key = `card:${userId}`;
    if (!state.sentCards.has(key) && callbacks.onCard) {
      state.sentCards.add(key);
      await callbacks.onCard(userId || undefined);
    }
  }
}

async function processStreamChunk(state: ParserState, callbacks: StreamCallbacks): Promise<void> {
  if (callbacks.signal?.aborted) throw new Error('Aborted');

  // Fix stuck tags trước khi parse
  const buffer = fixStuckTags(state.buffer);

  // Parse top-level [reaction:xxx] hoặc [reaction:INDEX:xxx] - hỗ trợ emoji
  for (const match of buffer.matchAll(/\[reaction:(\d+:)?([^\]]+)\]/gi)) {
    const indexPart = match[1];
    const rawReaction = match[2].trim();
    const normalizedReaction = normalizeReaction(rawReaction);
    
    if (!normalizedReaction) continue;
    
    const key = indexPart ? `reaction:${indexPart}${normalizedReaction}` : `reaction:${normalizedReaction}`;
    if (!state.sentReactions.has(key) && callbacks.onReaction) {
      state.sentReactions.add(key);
      await callbacks.onReaction(
        indexPart ? `${indexPart.replace(':', '')}:${normalizedReaction}` : normalizedReaction,
      );
    }
  }

  // Parse top-level [sticker:xxx]
  for (const match of buffer.matchAll(/\[sticker:(\w+)\]/gi)) {
    const keyword = match[1];
    const key = `sticker:${keyword}`;
    if (!state.sentStickers.has(key) && callbacks.onSticker) {
      state.sentStickers.add(key);
      await callbacks.onSticker(keyword);
    }
  }

  // ⚠️ QUAN TRỌNG: Parse [undo:...] TRƯỚC [msg] và [quote]
  // Lý do: Khi AI muốn undo tin nhắn cũ rồi gửi tin mới, undo phải được thực thi trước
  // Nếu không, tin nhắn mới sẽ được lưu vào store trước, và undo sẽ undo nhầm tin mới
  // Ví dụ: [undo:-1] [msg]Sorry![/msg] → phải undo tin cũ trước, rồi mới gửi "Sorry!"
  for (const match of buffer.matchAll(/\[undo:(all|(-?\d+)(?::(-?\d+))?)\]/gi)) {
    const fullMatch = match[1];
    const key = `undo:${fullMatch}`;
    
    if (!state.sentUndos.has(key) && callbacks.onUndo) {
      state.sentUndos.add(key);
      
      if (fullMatch === 'all') {
        await callbacks.onUndo('all');
      } else if (match[3] !== undefined) {
        // Range: [undo:-1:-3]
        const start = parseInt(match[2], 10);
        const end = parseInt(match[3], 10);
        await callbacks.onUndo({ start, end });
      } else {
        // Single: [undo:-1]
        const index = parseInt(match[2], 10);
        await callbacks.onUndo(index);
      }
    }
  }

  // Parse [quote:index]...[/quote] - xử lý quote reply
  // CHỈ parse quote tags ở TOP-LEVEL (không nằm trong [msg]...[/msg])
  // AI viết: [quote:0]Câu trả lời[/quote] - nội dung BÊN TRONG quote là câu trả lời
  
  // Tạo buffer không chứa [msg]...[/msg] để chỉ parse quote ở top-level
  const bufferWithoutMsg = buffer.replace(/\[msg\][\s\S]*?\[\/msg\]/gi, '');
  
  const quoteRegex = /\[quote:(-?\d+)\]([\s\S]*?)\[\/quote\]/gi;
  let quoteMatch;
  while ((quoteMatch = quoteRegex.exec(bufferWithoutMsg)) !== null) {
    const quoteIndex = parseInt(quoteMatch[1], 10);
    const insideQuote = quoteMatch[2].trim();

    // Nội dung BÊN TRONG quote tag là câu trả lời
    if (!insideQuote) {
      continue;
    }

    const rawText = insideQuote;
    const key = `quote:${quoteIndex}:${rawText}`;

    if (rawText && !state.sentMessages.has(key)) {
      await processInlineTags(rawText, state, callbacks);
      const cleanText = cleanInlineTags(rawText);
      
      // Kiểm tra xem tin nhắn có nên được gửi không (tránh trùng lặp)
      if (cleanText && callbacks.onMessage && shouldSendMessage(cleanText, state.sentMessageTexts)) {
        state.sentMessages.add(key);
        state.sentMessageTexts.push(cleanText);
        await callbacks.onMessage(cleanText, quoteIndex);
      }
    }
  }

  // Parse [msg]...[/msg]
  // Strip các [quote:X]...[/quote] tags bên trong vì chúng không nên được gửi như text thuần
  for (const match of buffer.matchAll(/\[msg\]([\s\S]*?)\[\/msg\]/gi)) {
    let rawText = match[1].trim();
    
    // Strip [quote:X]...[/quote] tags bên trong [msg] - AI đôi khi viết quote tags trong msg
    // Ví dụ: [msg]Đây là tin [quote:0]nội dung[/quote] và tiếp tục[/msg]
    // → Chỉ giữ lại: "Đây là tin  và tiếp tục"
    rawText = rawText.replace(/\[quote:-?\d+\][\s\S]*?\[\/quote\]/gi, '').trim();
    
    const key = `msg:${rawText}`;
    if (rawText && !state.sentMessages.has(key)) {
      await processInlineTags(rawText, state, callbacks);
      const cleanText = cleanInlineTags(rawText);
      
      // Kiểm tra xem tin nhắn có nên được gửi không (tránh trùng lặp)
      if (cleanText && callbacks.onMessage && shouldSendMessage(cleanText, state.sentMessageTexts)) {
        state.sentMessages.add(key);
        state.sentMessageTexts.push(cleanText);
        await callbacks.onMessage(cleanText);
      }
    }
  }

  // Parse top-level [card:userId] hoặc [card]
  for (const match of buffer.matchAll(/\[card(?::(\d+))?\]/gi)) {
    const userId = match[1] || '';
    const key = `card:${userId}`;
    if (!state.sentCards.has(key) && callbacks.onCard) {
      state.sentCards.add(key);
      await callbacks.onCard(userId || undefined);
    }
  }

  // Parse top-level [image:url]caption[/image]
  for (const match of buffer.matchAll(/\[image:(https?:\/\/[^\]]+)\]([\s\S]*?)\[\/image\]/gi)) {
    const url = match[1];
    const caption = match[2].trim();
    const key = `image:${url}`;
    if (!state.sentImages.has(key) && callbacks.onImage) {
      state.sentImages.add(key);
      await callbacks.onImage(url, caption || undefined);
    }
  }
}

/**
 * Generate content với streaming
 */
export async function generateContentStream(
  prompt: string,
  callbacks: StreamCallbacks,
  media?: MediaPart[],
  threadId?: string,
  history?: Content[],
): Promise<string> {
  const state: ParserState = {
    buffer: '',
    sentReactions: new Set(),
    sentStickers: new Set(),
    sentMessages: new Set(),
    sentCards: new Set(),
    sentUndos: new Set(),
    sentImages: new Set(),
    sentMessageTexts: [],
  };

  debugLog(
    'STREAM',
    `Starting stream: prompt="${prompt.substring(0, 100)}...", media=${
      media?.length || 0
    }, thread=${threadId || 'none'}`,
  );

  // Build parts trước để đếm token chính xác (bao gồm cả media)
  const parts = await buildMessageParts(prompt, media);

  // Kiểm tra token đầu vào (prompt + media) trước khi gọi AI
  const inputContent: Content = { role: 'user', parts };
  const tokenCheck = await checkInputTokens([inputContent], CONFIG.maxInputTokens);

  if (!tokenCheck.allowed) {
    console.log(
      `[Gemini] ⚠️ Token limit exceeded: ${tokenCheck.totalTokens}/${tokenCheck.maxTokens}`,
    );
    debugLog('STREAM', `Token limit exceeded: ${tokenCheck.totalTokens}/${tokenCheck.maxTokens}`);

    // Gửi thông báo lỗi cho user
    if (callbacks.onMessage) {
      await callbacks.onMessage(tokenCheck.message || 'Token limit exceeded');
    }
    await callbacks.onComplete?.();
    return tokenCheck.message || 'Token limit exceeded';
  }

  let hasPartialResponse = false;
  let lastError: any = null;

  const sessionId = threadId || `temp_${Date.now()}`;

  let overloadRetries = 0; // Đếm số lần retry cho overload (503)
  const MAX_OVERLOAD_RETRIES = CONFIG.retry.maxRetries;

  // Main loop - chạy cho đến khi thành công hoặc hết key/retry
  while (true) {
    // Reset state cho mỗi lần thử
    state.buffer = '';
    state.sentReactions.clear();
    state.sentStickers.clear();
    state.sentMessages.clear();
    state.sentCards.clear();
    state.sentUndos.clear();
    state.sentImages.clear();
    state.sentMessageTexts = [];
    hasPartialResponse = false;

    try {
      deleteChatSession(sessionId);
      const chat = getChatSession(sessionId, history);

      // Log system prompt
      logSystemPrompt(sessionId, getSystemPrompt(CONFIG.useCharacter));

      if (history && history.length > 0) {
        logAIHistory(sessionId, history);
      }

      const response = await chat.sendMessageStream({ message: parts });

      for await (const chunk of response) {
        if (callbacks.signal?.aborted) {
          debugLog('STREAM', 'Aborted');
          hasPartialResponse = state.buffer.length > 0;
          throw new Error('Aborted');
        }

        if (chunk.text) {
          state.buffer += chunk.text;
          await processStreamChunk(state, callbacks);
          if (state.sentMessages.size > 0 || state.sentReactions.size > 0) {
            hasPartialResponse = true;
          }
        }
      }

      if (overloadRetries > 0) {
        console.log(`[Gemini] ✅ Thành công sau ${overloadRetries} lần retry overload`);
      }

      logAIResponse(`[STREAM] ${prompt.substring(0, 50)}`, state.buffer);

      // Xử lý content nằm ngoài tags (tables, code blocks, plain text)
      const plainText = getPlainText(state.buffer);
      if (plainText && callbacks.onMessage) {
        const hasTableOrCode = /(\|[^\n]+\|\n\|[-:\s|]+\|)|(```\w*\n[\s\S]*?```)/.test(plainText);
        // Kiểm tra xem tin nhắn có nên được gửi không (tránh trùng lặp)
        if ((state.sentMessages.size === 0 || hasTableOrCode) && shouldSendMessage(plainText, state.sentMessageTexts)) {
          state.sentMessageTexts.push(plainText);
          await callbacks.onMessage(plainText);
        }
      }

      if (!threadId) deleteChatSession(sessionId);

      await callbacks.onComplete?.();
      return state.buffer;
    } catch (error: any) {
      lastError = error;

      if (error.message === 'Aborted' || callbacks.signal?.aborted) {
        debugLog('STREAM', `Stream aborted, hasPartialResponse=${hasPartialResponse}`);
        if (hasPartialResponse && callbacks.onComplete) {
          debugLog('STREAM', 'Calling onComplete for partial response');
          await callbacks.onComplete();
        }
        return state.buffer;
      }

      // Xử lý lỗi 403 (permission denied) - key không hợp lệ, đổi key và gọi ngay
      if (isPermissionDeniedError(error)) {
        const rotated = keyManager.handlePermissionDeniedError();
        if (rotated) {
          console.log(
            `[Gemini] ⚠️ Lỗi 403: Permission denied, đổi sang key #${keyManager.getCurrentKeyIndex()}/${keyManager.getTotalKeys()} và gọi ngay`,
          );
          debugLog(
            'STREAM',
            `Permission denied, rotated to key #${keyManager.getCurrentKeyIndex()}, calling immediately`,
          );
          continue; // Gọi ngay với key mới, không delay
        }
        // Không còn key khả dụng
        console.log('[Gemini] ❌ Tất cả keys đều bị permission denied hoặc rate limit');
        break;
      }

      // Xử lý lỗi 429 (rate limit) - đổi key/model và gọi ngay, KHÔNG delay
      if (isRateLimitError(error)) {
        const rotated = keyManager.handleRateLimitError();
        if (rotated) {
          console.log(
            `[Gemini] ⚠️ Lỗi 429: Rate limit, đổi sang key #${keyManager.getCurrentKeyIndex()}/${keyManager.getTotalKeys()} (${keyManager.getCurrentModelName()}) và gọi ngay`,
          );
          debugLog(
            'STREAM',
            `Rate limit, rotated to key #${keyManager.getCurrentKeyIndex()}, model=${keyManager.getCurrentModelName()}, calling immediately`,
          );
          continue; // Gọi ngay với key/model mới, không delay
        }
        // Không còn key/model khả dụng
        console.log('[Gemini] ❌ Tất cả keys và models đều bị rate limit/block');
        break;
      }

      // Xử lý lỗi 503 (overload) - retry với delay, KHÔNG đổi key
      if (isRetryableError(error) && overloadRetries < MAX_OVERLOAD_RETRIES) {
        overloadRetries++;
        const delayMs = CONFIG.retry.baseDelayMs * 2 ** (overloadRetries - 1);
        console.log(
          `[Gemini] ⚠️ Lỗi ${error.status || error.code}: Model overloaded, retry ${overloadRetries}/${MAX_OVERLOAD_RETRIES} sau ${delayMs}ms...`,
        );
        debugLog('STREAM', `Overload error, retry ${overloadRetries}, delay=${delayMs}ms`);
        await sleep(delayMs);
        continue;
      }

      // Lỗi khác hoặc hết retry
      break;
    }
  }

  logError('generateContentStream', lastError);
  await callbacks.onError?.(lastError);

  if (threadId) deleteChatSession(threadId);

  return state.buffer;
}
