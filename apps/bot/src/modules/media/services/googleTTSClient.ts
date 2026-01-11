import ky from 'ky';
import { debugLog, logError } from '../../../core/logger/logger.js';

/**
 * Text-to-Speech using Google Translate API (Fallback)
 * This is often referred to as "Google Standard" in bot contexts.
 */
export async function googleTTS(text: string, lang = 'vi'): Promise<Buffer> {
  try {
    debugLog('GOOGLE_TTS', `Generating TTS for: "${text.substring(0, 50)}..."`);
    
    // Google Translate TTS URL
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text,
    )}&tl=${lang}&client=tw-ob`;

    const response = await ky.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 15000,
    });

    if (!response.ok) {
      throw new Error(`Google TTS failed with status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    debugLog('GOOGLE_TTS', `Successfully generated audio (${buffer.length} bytes)`);
    return buffer;
  } catch (error) {
    logError('googleTTS', error);
    throw error;
  }
}
