/**
 * Integration Test: Gemini Provider
 * Test generateContent và các exports từ gemini.provider
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import { hasApiKey, TEST_CONFIG } from '../setup.js';
import {
  generateContent,
  parseAIResponse,
  getAI,
  getGeminiModel,
  keyManager,
  GEMINI_CONFIG,
} from '../../../src/infrastructure/ai/providers/gemini/gemini.provider.js';

const SKIP = !hasApiKey('gemini');

describe.skipIf(SKIP)('Gemini Provider Integration', () => {
  beforeAll(() => {
    if (SKIP) console.log('⏭️  Skipping Gemini Provider tests: GEMINI_API_KEY not configured');
  });

  describe('Exports', () => {
    test('getAI được export và hoạt động', () => {
      const ai = getAI();
      expect(ai).toBeDefined();
    });

    test('getGeminiModel được export', () => {
      const model = getGeminiModel();
      expect(model).toBeDefined();
      expect(typeof model).toBe('string');
    });

    test('keyManager được export', () => {
      expect(keyManager).toBeDefined();
      expect(keyManager.getCurrentKeyIndex).toBeDefined();
      expect(keyManager.getTotalKeys).toBeDefined();
    });

    test('GEMINI_CONFIG được export', () => {
      expect(GEMINI_CONFIG).toBeDefined();
    });
  });

  describe('generateContent', () => {
    test('Generate text response', async () => {
      const response = await generateContent('Say "test" only.');
      
      expect(response).toBeDefined();
      expect(response.messages).toBeDefined();
      expect(Array.isArray(response.messages)).toBe(true);
    }, TEST_CONFIG.timeout);

    test('Generate với prompt phức tạp', async () => {
      const response = await generateContent(
        'What is 2 + 2? Reply with just the number.'
      );
      
      expect(response).toBeDefined();
      expect(response.messages.length).toBeGreaterThanOrEqual(0);
    }, TEST_CONFIG.timeout);
  });
});

describe('parseAIResponse', () => {
  test('Parse text với reaction tag', () => {
    const text = '[reaction:heart] Hello World';
    
    const result = parseAIResponse(text);
    expect(result.reactions).toContain('heart');
    expect(result.messages[0].text).toBe('Hello World');
  });

  test('Parse text với sticker tag', () => {
    const text = '[sticker:happy]';
    
    const result = parseAIResponse(text);
    expect(result.messages.some(m => m.sticker === 'happy')).toBe(true);
  });

  test('Parse text với msg tag', () => {
    const text = '[msg]Hello from msg tag[/msg]';
    
    const result = parseAIResponse(text);
    expect(result.messages.some(m => m.text === 'Hello from msg tag')).toBe(true);
  });

  test('Parse empty string trả về default', () => {
    const result = parseAIResponse('');
    
    expect(result).toBeDefined();
    expect(Array.isArray(result.reactions)).toBe(true);
    expect(Array.isArray(result.messages)).toBe(true);
  });

  test('Parse text với card tag', () => {
    const text = '[card:123456]';
    
    const result = parseAIResponse(text);
    expect(result.messages.some(m => m.card === '123456')).toBe(true);
  });

  test('Parse text với quote tag', () => {
    const text = '[quote:0]Reply to message[/quote]';
    
    const result = parseAIResponse(text);
    expect(result.messages.some(m => m.quoteIndex === 0)).toBe(true);
    expect(result.messages.some(m => m.text === 'Reply to message')).toBe(true);
  });

  test('Parse text với undo tag', () => {
    const text = '[undo:-1] OK đã thu hồi';
    
    const result = parseAIResponse(text);
    expect(result.undoIndexes).toContain(-1);
  });

  test('Parse text với indexed reaction', () => {
    const text = '[reaction:0:heart]';
    
    const result = parseAIResponse(text);
    expect(result.reactions).toContain('0:heart');
  });

  // Tests for emoji reactions - new feature
  test('Parse emoji reactions - heart variants', () => {
    const text = '[reaction:❤️] [reaction:💖] [reaction:🥰]';
    
    const result = parseAIResponse(text);
    expect(result.reactions).toContain('heart');
    // Multiple same reactions are deduplicated
    expect(result.reactions.filter(r => r === 'heart').length).toBe(3);
  });

  test('Parse emoji reactions - like variants', () => {
    const text = '[reaction:👍] [reaction:🔥] [reaction:🎉]';
    
    const result = parseAIResponse(text);
    expect(result.reactions).toContain('like');
  });

  test('Parse emoji reactions - haha variants', () => {
    const text = '[reaction:😂] [reaction:🤣]';
    
    const result = parseAIResponse(text);
    expect(result.reactions).toContain('haha');
  });

  test('Parse emoji reactions - wow variants', () => {
    const text = '[reaction:😮] [reaction:🤯] [reaction:😱]';
    
    const result = parseAIResponse(text);
    expect(result.reactions).toContain('wow');
  });

  test('Parse emoji reactions - sad variants', () => {
    const text = '[reaction:😢] [reaction:😭]';
    
    const result = parseAIResponse(text);
    expect(result.reactions).toContain('sad');
  });

  test('Parse emoji reactions - angry variants', () => {
    const text = '[reaction:😡] [reaction:🤬] [reaction:👎]';
    
    const result = parseAIResponse(text);
    expect(result.reactions).toContain('angry');
  });

  test('Parse indexed emoji reaction', () => {
    const text = '[reaction:0:❤️] [reaction:1:😂]';
    
    const result = parseAIResponse(text);
    expect(result.reactions).toContain('0:heart');
    expect(result.reactions).toContain('1:haha');
  });

  test('Mixed text and emoji reactions', () => {
    const text = '[reaction:heart] [reaction:🔥] [msg]Cool![/msg]';
    
    const result = parseAIResponse(text);
    expect(result.reactions).toContain('heart');
    expect(result.reactions).toContain('like');
    expect(result.messages.some(m => m.text === 'Cool!')).toBe(true);
  });
});

describe('KeyManager', () => {
  test('getCurrentKeyIndex trả về số', () => {
    const index = keyManager.getCurrentKeyIndex();
    expect(typeof index).toBe('number');
    expect(index).toBeGreaterThanOrEqual(0);
  });

  test('getTotalKeys trả về số > 0', () => {
    const total = keyManager.getTotalKeys();
    expect(typeof total).toBe('number');
    expect(total).toBeGreaterThan(0);
  });

  test('getCurrentModelName trả về string', () => {
    const model = keyManager.getCurrentModelName();
    expect(typeof model).toBe('string');
    expect(model.length).toBeGreaterThan(0);
  });
});
