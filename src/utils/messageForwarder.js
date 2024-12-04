import { bot } from '../bot.js';
import { config } from '../config.js';

export class MessageForwarder {
  static async forwardFromUser(msg, userId) {
    const messageText = `From User ${msg.from.first_name} (ID: ${userId}):\n${msg.text}`;
    
    await Promise.all([
      bot.sendMessage(config.salesId, messageText),
      bot.sendMessage(config.adminId, messageText)
    ]);
  }

  static async forwardFromStaff(msg, targetUserId) {
    const sender = msg.from.id.toString() === config.salesId ? 'Sales' : 'Admin';
    const messageText = `${sender}: ${msg.text}`;
    
    // Send to user
    await bot.sendMessage(targetUserId, messageText);
    
    // Forward to other staff member
    const otherStaffId = msg.from.id.toString() === config.salesId ? config.adminId : config.salesId;
    await bot.sendMessage(otherStaffId, `${sender} to User: ${msg.text}`);
  }

  static extractUserIdFromReply(msg) {
    if (!msg.reply_to_message?.text) return null;
    const match = msg.reply_to_message.text.match(/ID: (\d+)/);
    return match ? match[1] : null;
  }
}