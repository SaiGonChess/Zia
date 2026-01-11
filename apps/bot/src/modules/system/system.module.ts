/**
 * System Module - Core utility tools
 */
import { BaseModule, type ITool, type ModuleMetadata } from '../../core/index.js';
import {
  blockUserTool,
  listBlockedUsersTool,
  qrCodeTool,
  unblockUserTool,
  urlShortenerTool,
} from './tools/index.js';

export class SystemModule extends BaseModule {
  readonly metadata: ModuleMetadata = {
    name: 'system',
    description: 'Hệ thống (Quản lý user, QR code, Rút gọn link)',
    version: '1.2.0',
  };

  private _tools: ITool[] = [
    qrCodeTool,
    urlShortenerTool,
    blockUserTool,
    unblockUserTool,
    listBlockedUsersTool,
  ];

  get tools(): ITool[] {
    return this._tools;
  }

  async onLoad(): Promise<void> {
    console.log(`[System] 🔧 Loading ${this._tools.length} utility tools`);
  }
}

export const systemModule = new SystemModule();
export * from './tools/index.js';
