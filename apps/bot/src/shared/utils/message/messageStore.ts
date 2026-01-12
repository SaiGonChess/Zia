/**
 * Lưu trữ tin nhắn đã gửi để có thể thu hồi
 * Sử dụng SQLite database thay vì in-memory Map
 */
import { debugLog } from '../../../core/logger/logger.js';
import { sentMessagesRepository } from '../../../infrastructure/database/index.js';

interface SentMessage {
  msgId: string;
  cliMsgId: string;
  content: string;
  threadId: string;
  timestamp: number;
}

import { CONFIG } from '../../../core/config/config.js';

// In-memory cache để truy xuất nhanh theo index
const messageCache = new Map<string, SentMessage[]>();
// Index Map để tra cứu nhanh theo msgId - O(1) lookup
const msgIdIndex = new Map<string, SentMessage>();
const getMaxCachePerThread = () => CONFIG.messageStore?.maxCachePerThread ?? 20;

/**
 * Lưu tin nhắn đã gửi (vào cả DB và cache)
 */
export function saveSentMessage(
  threadId: string,
  msgId: string,
  cliMsgId: string,
  content: string,
): number {
  const msg: SentMessage = {
    msgId,
    cliMsgId,
    content,
    threadId,
    timestamp: Date.now(),
  };

  // Lưu vào cache
  if (!messageCache.has(threadId)) {
    messageCache.set(threadId, []);
  }
  const cache = messageCache.get(threadId)!;
  
  // Nếu cache đầy, xóa tin cũ nhất khỏi index trước
  if (cache.length >= getMaxCachePerThread()) {
    const oldest = cache.shift();
    if (oldest) {
      msgIdIndex.delete(String(oldest.msgId));
    }
  }
  
  cache.push(msg);
  
  // Lưu vào msgId index để tra cứu nhanh O(1)
  if (msgId && msgId.trim() !== '') {
    msgIdIndex.set(String(msgId), msg);
  }

  // Lưu vào database (async, không block)
  // CHỈ lưu khi có msgId hợp lệ để tránh lỗi UNIQUE constraint
  if (msgId && msgId.trim() !== '') {
    sentMessagesRepository
      .saveMessage({ msgId, cliMsgId, threadId, content })
      .catch((err) => debugLog('MSG_STORE', `DB save error: ${err}`));
  } else {
    debugLog('MSG_STORE', `Skipped DB save: empty msgId for thread=${threadId}`);
  }

  debugLog('MSG_STORE', `Saved: thread=${threadId}, msgId=${msgId}, index=${cache.length - 1}`);

  return cache.length - 1;
}

/**
 * Lấy tin nhắn theo index (0 = cũ nhất, -1 = mới nhất)
 */
export function getSentMessage(threadId: string, index: number): SentMessage | null {
  const cache = messageCache.get(threadId);
  if (!cache || cache.length === 0) {
    debugLog('MSG_STORE', `getSentMessage: thread=${threadId} has no messages`);
    return null;
  }

  const actualIndex = index < 0 ? cache.length + index : index;

  if (actualIndex < 0 || actualIndex >= cache.length) {
    debugLog('MSG_STORE', `getSentMessage: index ${index} out of range [0, ${cache.length - 1}]`);
    return null;
  }

  const msg = cache[actualIndex];
  debugLog('MSG_STORE', `getSentMessage: found msgId=${msg.msgId}`);
  return msg;
}

/**
 * Lấy tin nhắn mới nhất của thread (async, từ DB)
 */
export async function getLastSentMessage(threadId: string): Promise<SentMessage | null> {
  // Thử cache trước
  const cache = messageCache.get(threadId);
  if (cache && cache.length > 0) {
    return cache[cache.length - 1];
  }

  // Fallback to DB
  const dbMsg = await sentMessagesRepository.getLastMessage(threadId);
  if (dbMsg) {
    return {
      msgId: dbMsg.msgId,
      cliMsgId: dbMsg.cliMsgId || '',
      content: dbMsg.content || '',
      threadId: dbMsg.threadId,
      timestamp: dbMsg.timestamp.getTime(),
    };
  }

  return null;
}

/**
 * Xóa tin nhắn khỏi store sau khi thu hồi
 */
export function removeSentMessage(threadId: string, msgId: string): void {
  // Xóa khỏi index
  msgIdIndex.delete(String(msgId));
  
  // Xóa khỏi cache
  const cache = messageCache.get(threadId);
  if (cache) {
    const index = cache.findIndex((m) => m.msgId === msgId);
    if (index !== -1) {
      cache.splice(index, 1);
    }
  }

  // Xóa khỏi DB (async)
  sentMessagesRepository
    .deleteMessage(msgId)
    .catch((err) => debugLog('MSG_STORE', `DB delete error: ${err}`));

  debugLog('MSG_STORE', `removeSentMessage: removed msgId=${msgId}`);
}

/**
 * Clear tin nhắn cũ - giờ được xử lý bởi database service cleanup job
 */
export function cleanupOldMessages(): void {
  // Cache cleanup
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  let totalRemoved = 0;

  for (const [threadId, messages] of messageCache) {
    const beforeCount = messages.length;
    const filtered = messages.filter((m) => {
      if (m.timestamp <= oneHourAgo) {
        // Xóa khỏi index khi cleanup
        msgIdIndex.delete(String(m.msgId));
        return false;
      }
      return true;
    });
    totalRemoved += beforeCount - filtered.length;

    if (filtered.length === 0) {
      messageCache.delete(threadId);
    } else {
      messageCache.set(threadId, filtered);
    }
  }

  if (totalRemoved > 0) {
    debugLog('MSG_STORE', `Cache cleanup: removed ${totalRemoved} old messages, index size: ${msgIdIndex.size}`);
  }
}

// Cleanup cache theo interval từ config (DB cleanup được xử lý bởi database.service)
const cleanupIntervalMs = CONFIG.messageStore?.cleanupIntervalMs ?? 1800000;
setInterval(cleanupOldMessages, cleanupIntervalMs);

/**
 * Kiểm tra xem msgId có phải tin nhắn của bot không
 */
export async function isBotMessage(msgId: string): Promise<boolean> {
  const msgIdStr = String(msgId);
  
  // Check index trước - O(1) lookup
  if (msgIdIndex.has(msgIdStr)) {
    return true;
  }

  // Fallback to DB
  const dbMsg = await sentMessagesRepository.getByMsgId(msgIdStr);
  return dbMsg !== null;
}

/**
 * Lấy tin nhắn của bot theo msgId (để biết nội dung tin nhắn bị react)
 */
export async function getBotMessageByMsgId(msgId: string): Promise<SentMessage | null> {
  const msgIdStr = String(msgId);

  // Check index trước - O(1) lookup
  const indexed = msgIdIndex.get(msgIdStr);
  if (indexed) {
    debugLog('MSG_STORE', `getBotMessageByMsgId: found in index msgId=${msgIdStr}`);
    return indexed;
  }

  // Fallback to DB
  const dbMsg = await sentMessagesRepository.getByMsgId(msgIdStr);
  if (dbMsg) {
    debugLog('MSG_STORE', `getBotMessageByMsgId: found in DB msgId=${msgIdStr}`);
    const result: SentMessage = {
      msgId: dbMsg.msgId,
      cliMsgId: dbMsg.cliMsgId || '',
      content: dbMsg.content || '',
      threadId: dbMsg.threadId,
      timestamp: dbMsg.timestamp.getTime(),
    };
    // Cache vào index để lần sau tra cứu nhanh hơn
    msgIdIndex.set(msgIdStr, result);
    return result;
  }

  debugLog('MSG_STORE', `getBotMessageByMsgId: NOT found msgId=${msgIdStr}`);
  return null;
}

/**
 * Lấy tin nhắn gần nhất của bot trong thread (trong vòng 5 phút)
 * Dùng cho trường hợp reaction event trả về msgId khác với msgId đã lưu
 */
export async function getLastBotMessageInThread(threadId: string): Promise<SentMessage | null> {
  const recentWindowMs = CONFIG.messageStore?.recentMessageWindowMs ?? 300000;
  const recentTime = Date.now() - recentWindowMs;

  // Check cache trước
  const cache = messageCache.get(threadId);
  if (cache && cache.length > 0) {
    // Lấy tin nhắn gần nhất trong vòng 5 phút
    for (let i = cache.length - 1; i >= 0; i--) {
      if (cache[i].timestamp > recentTime) {
        debugLog('MSG_STORE', `getLastBotMessageInThread: found in cache msgId=${cache[i].msgId}`);
        return cache[i];
      }
    }
  }

  // Fallback to DB
  const dbMsg = await sentMessagesRepository.getLastMessage(threadId);
  if (dbMsg && dbMsg.timestamp.getTime() > recentTime) {
    debugLog('MSG_STORE', `getLastBotMessageInThread: found in DB msgId=${dbMsg.msgId}`);
    return {
      msgId: dbMsg.msgId,
      cliMsgId: dbMsg.cliMsgId || '',
      content: dbMsg.content || '',
      threadId: dbMsg.threadId,
      timestamp: dbMsg.timestamp.getTime(),
    };
  }

  debugLog(
    'MSG_STORE',
    `getLastBotMessageInThread: NOT found recent message in thread=${threadId}`,
  );
  return null;
}
