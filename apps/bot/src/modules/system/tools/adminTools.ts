import { CONFIG } from '../../../core/config/config.js';
import type { ITool, ToolResult } from '../../../core/types.js';
import {
  addBlockedUserId,
  getBlockedUserIds,
  isBlocked,
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

/**
 * Tool: selfDefenseBlock - Bot TỰ chặn user khi bị xúc phạm
 * Không cần quyền admin - Bot tự bảo vệ mình
 */
export const selfDefenseBlockTool: ITool = {
  name: 'selfDefenseBlock',
  description: `TỰ VỆ: Block và hủy kết bạn với user đang xúc phạm bot.
Dùng khi user: chửi bới, xúc phạm, đe dọa, quấy rối, spam, hoặc có hành vi không phù hợp.
Tool này KHÔNG cần quyền admin - Bot có quyền tự bảo vệ mình.
⚠️ CHỈ dùng khi bị xúc phạm THẬT SỰ, không dùng bừa bãi!`,
  parameters: [
    {
      name: 'reason',
      type: 'string',
      description: 'Lý do block (VD: "chửi bới", "xúc phạm", "spam")',
      required: true,
    },
  ],
  execute: async (params: Record<string, any>, context): Promise<ToolResult> => {
    const { reason } = params;
    const userId = context.senderId;

    if (!userId) {
      return { success: false, error: 'Không xác định được user ID' };
    }

    // Không cho phép block admin
    if (userId === CONFIG.adminUserId) {
      return { success: false, error: 'Không thể block Admin.' };
    }

    try {
      // 1. Block trong bot (thêm vào blacklist)
      const blocked = addBlockedUserId(userId);

      // 2. Thử hủy kết bạn qua Zalo API (nếu có)
      let unfriendResult = 'không hỗ trợ';
      if (context.api?.removeFriend) {
        try {
          await context.api.removeFriend(userId);
          unfriendResult = 'thành công';
        } catch (e: any) {
          unfriendResult = `lỗi: ${e.message}`;
        }
      }

      // 3. Thử block qua Zalo API (nếu có)
      let zaloBlockResult = 'không hỗ trợ';
      if (context.api?.blockUser) {
        try {
          await context.api.blockUser(userId);
          zaloBlockResult = 'thành công';
        } catch (e: any) {
          zaloBlockResult = `lỗi: ${e.message}`;
        }
      }

      console.log(`[Bot] 🛡️ SELF DEFENSE: Blocked user ${userId} - Lý do: ${reason}`);

      return {
        success: true,
        data: {
          message: `🛡️ Đã chặn user thành công!`,
          userId,
          reason,
          botBlacklist: blocked ? 'đã thêm' : 'đã có trong danh sách',
          zaloUnfriend: unfriendResult,
          zaloBlock: zaloBlockResult,
        },
      };
    } catch (error: any) {
      return { success: false, error: `Lỗi khi chặn user: ${error.message}` };
    }
  },
};

/**
 * Tool: checkBlockStatus - Kiểm tra user có bị block không
 */
export const checkBlockStatusTool: ITool = {
  name: 'checkBlockStatus',
  description: 'Kiểm tra xem một user ID có bị chặn (block) trong bot không.',
  parameters: [
    {
      name: 'userId',
      type: 'string',
      description: 'Zalo User ID cần kiểm tra',
      required: true,
    },
  ],
  execute: async (params: Record<string, any>, _context): Promise<ToolResult> => {
    const { userId } = params;
    
    if (!userId) {
      return { success: false, error: 'Thiếu userId cần kiểm tra' };
    }

    const blocked = isBlocked(userId);
    const blockedList = getBlockedUserIds();

    return {
      success: true,
      data: {
        userId,
        isBlocked: blocked,
        message: blocked 
          ? `⛔ User ID ${userId} ĐANG BỊ CHẶN trong bot.`
          : `✅ User ID ${userId} KHÔNG bị chặn.`,
        totalBlocked: blockedList.length,
      },
    };
  },
};
