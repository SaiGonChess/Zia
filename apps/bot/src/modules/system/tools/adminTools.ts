import { CONFIG } from '../../../core/config/config.js';
import type { ITool, ToolResult } from '../../../core/types.js';
import {
  addBlockedUserId,
  getBlockedUserIds,
  removeBlockedUserId,
} from '../../gateway/guards/user.filter.js';

/**
 * Tool: blockUser - Chặn user ID
 */
export const blockUserTool: ITool = {
  name: 'blockUser',
  description: 'Chặn một người dùng không cho phép sử dụng bot (Blacklist). Chỉ Admin mới dùng được.',
  parameters: [
    {
      name: 'userId',
      type: 'string',
      description: 'Zalo User ID cần chặn',
      required: true,
    },
  ],
  execute: async (params: Record<string, any>, context): Promise<ToolResult> => {
    // Kiểm tra quyền admin
    if (context.senderId !== CONFIG.adminUserId) {
      return { success: false, error: 'Chỉ Admin mới có quyền sử dụng tool này.' };
    }

    const { userId } = params;
    const success = addBlockedUserId(userId);

    return {
      success: true,
      data: success
        ? `✅ Đã chặn user ID: ${userId}`
        : `ℹ️ User ID ${userId} đã có trong danh sách chặn.`,
    };
  },
};

/**
 * Tool: unblockUser - Bỏ chặn user ID
 */
export const unblockUserTool: ITool = {
  name: 'unblockUser',
  description: 'Bỏ chặn một người dùng. Chỉ Admin mới dùng được.',
  parameters: [
    {
      name: 'userId',
      type: 'string',
      description: 'Zalo User ID cần bỏ chặn',
      required: true,
    },
  ],
  execute: async (params: Record<string, any>, context): Promise<ToolResult> => {
    // Kiểm tra quyền admin
    if (context.senderId !== CONFIG.adminUserId) {
      return { success: false, error: 'Chỉ Admin mới có quyền sử dụng tool này.' };
    }

    const { userId } = params;
    const success = removeBlockedUserId(userId);

    return {
      success: true,
      data: success
        ? `✅ Đã bỏ chặn user ID: ${userId}`
        : `ℹ️ User ID ${userId} không nằm trong danh sách chặn.`,
    };
  },
};

/**
 * Tool: listBlockedUsers - Xem danh sách bị chặn
 */
export const listBlockedUsersTool: ITool = {
  name: 'listBlockedUsers',
  description: 'Xem danh sách các user ID đang bị chặn. Chỉ Admin mới dùng được.',
  parameters: [],
  execute: async (_params, context): Promise<ToolResult> => {
    // Kiểm tra quyền admin
    if (context.senderId !== CONFIG.adminUserId) {
      return { success: false, error: 'Chỉ Admin mới có quyền sử dụng tool này.' };
    }

    const blockedIds = getBlockedUserIds();

    if (blockedIds.length === 0) {
      return { success: true, data: 'Danh sách chặn hiện đang trống.' };
    }

    return {
      success: true,
      data: `Danh sách user IDs bị chặn:\n- ${blockedIds.join('\n- ')}`,
    };
  },
};
