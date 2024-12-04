import TelegramBot from 'node-telegram-bot-api';
import { config } from './config.js';
import { conversationManager } from './utils/conversationManager.js';
import { createWelcomeMessage, createSalesNotification } from './utils/messageHandler.js';

const bot = new TelegramBot(config.botToken, { polling: true });

// Start command handler
bot.onText(/\/start/, async (msg) => {
  const userId = msg.from.id;
  const userInfo = {
    userId: userId,
    firstName: msg.from.first_name,
    username: msg.from.username,
    languageCode: msg.from.language_code
  };

  try {
    // Check if user is already in a conversation
    if (conversationManager.isInConversation(userId)) {
      return bot.sendMessage(userId, "You already have an active conversation!");
    }

    // Start new conversation
    conversationManager.startConversation(userId, userInfo);

    // Send welcome message to user
    await bot.sendMessage(userId, createWelcomeMessage(userInfo.firstName));

    // Notify sales and admin
    const notification = createSalesNotification(userInfo);
    await bot.sendMessage(config.salesId, notification);
    await bot.sendMessage(config.adminId, notification);

  } catch (error) {
    console.error('Error starting conversation:', error);
    await bot.sendMessage(userId, "Sorry, there was an error starting the conversation. Please try again later.");
  }
});

// Handle all messages
bot.on('message', async (msg) => {
  if (msg.text === '/start') return; // Skip /start commands as they're handled above

  const userId = msg.from.id;
  const messageText = msg.text || 'Media message';
  const messageId = msg.message_id;

  try {
    // Forward messages based on sender
    if (userId.toString() === config.salesId) {
      // Sales rep sending message - forward to user and admin
      const conversation = conversationManager.getConversationInfo(msg.reply_to_message?.text);
      if (conversation) {
        await bot.copyMessage(conversation.userId, msg.chat.id, messageId);
        await bot.copyMessage(config.adminId, msg.chat.id, messageId);
      }
    } else if (userId.toString() === config.adminId) {
      // Admin sending message - forward to user and sales
      const conversation = conversationManager.getConversationInfo(msg.reply_to_message?.text);
      if (conversation) {
        await bot.copyMessage(conversation.userId, msg.chat.id, messageId);
        await bot.copyMessage(config.salesId, msg.chat.id, messageId);
      }
    } else {
      // User sending message - forward to sales and admin
      if (conversationManager.isInConversation(userId)) {
        await bot.copyMessage(config.salesId, msg.chat.id, messageId);
        await bot.copyMessage(config.adminId, msg.chat.id, messageId);
      } else {
        await bot.sendMessage(userId, "Please start a conversation first by clicking /start");
      }
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