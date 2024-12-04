import TelegramBot from 'node-telegram-bot-api';
import { config } from './config.js';
import { conversationManager } from './utils/conversationManager.js';
import { createWelcomeMessage, createSalesNotification } from './utils/messageHandler.js';

// Initialize bot with polling
const bot = new TelegramBot(config.botToken, { polling: true });

// Debug logging for config values
console.log('Sales ID:', config.salesId);
console.log('Admin ID:', config.adminId);

// Start command handler
bot.onText(/\/start/, async (msg) => {
  const userId = msg.from.id;
  const userInfo = {
    userId: userId,
    firstName: msg.from.first_name || 'User',
    username: msg.from.username || 'Unknown',
    languageCode: msg.from.language_code
  };

  try {
    // Check if user is already in a conversation
    if (conversationManager.isInConversation(userId)) {
      await bot.sendMessage(userId, "You already have an active conversation!");
      return;
    }

    // Start new conversation
    conversationManager.startConversation(userId, userInfo);

    // Send welcome message to user
    await bot.sendMessage(userId, createWelcomeMessage(userInfo.firstName));

    // Create notification message
    const notification = createSalesNotification(userInfo);

    // Send notifications with error handling
    try {
      await bot.sendMessage(config.salesId, notification);
      console.log('Notification sent to sales');
    } catch (error) {
      console.error('Error sending notification to sales:', error);
    }

    try {
      await bot.sendMessage(config.adminId, notification);
      console.log('Notification sent to admin');
    } catch (error) {
      console.error('Error sending notification to admin:', error);
    }

  } catch (error) {
    console.error('Error in /start command:', error);
    await bot.sendMessage(userId, "Sorry, there was an error starting the conversation. Please try again later.");
  }
});

// Handle all messages
bot.on('message', async (msg) => {
  if (msg.text === '/start') return;

  const userId = msg.from.id.toString();
  const messageId = msg.message_id;

  try {
    // Handle messages from sales representative
    if (userId === config.salesId) {
      if (msg.reply_to_message) {
        const text = msg.reply_to_message.text;
        const userIdMatch = text.match(/ID: (\d+)/);
        if (userIdMatch) {
          const targetUserId = userIdMatch[1];
          await bot.copyMessage(targetUserId, msg.chat.id, messageId);
          await bot.copyMessage(config.adminId, msg.chat.id, messageId);
          console.log('Message forwarded from sales to user and admin');
        }
      }
    }
    // Handle messages from admin
    else if (userId === config.adminId) {
      if (msg.reply_to_message) {
        const text = msg.reply_to_message.text;
        const userIdMatch = text.match(/ID: (\d+)/);
        if (userIdMatch) {
          const targetUserId = userIdMatch[1];
          await bot.copyMessage(targetUserId, msg.chat.id, messageId);
          await bot.copyMessage(config.salesId, msg.chat.id, messageId);
          console.log('Message forwarded from admin to user and sales');
        }
      }
    }
    // Handle messages from users
    else if (conversationManager.isInConversation(userId)) {
      await bot.copyMessage(config.salesId, msg.chat.id, messageId);
      await bot.copyMessage(config.adminId, msg.chat.id, messageId);
      console.log('Message forwarded from user to sales and admin');
    } else {
      await bot.sendMessage(userId, "Please start a conversation first by clicking /start");
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await bot.sendMessage(userId, "Sorry, there was an error processing your message. Please try again.");
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Keep the process alive
process.on('SIGINT', () => {
  bot.stopPolling();
  process.exit();
});

console.log('Bot is running...');