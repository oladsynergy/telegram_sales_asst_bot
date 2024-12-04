import { bot } from './bot.js';
import { config } from './config.js';
import { conversationManager } from './utils/conversationManager.js';
import { MessageForwarder } from './utils/messageForwarder.js';
import { createWelcomeMessage, createSalesNotification } from './utils/messageHandler.js';

// Debug logging
console.log('Bot initialized with config:', {
  salesId: config.salesId,
  adminId: config.adminId
});

// Start command handler
bot.onText(/\/start/, async (msg) => {
  const userId = msg.from.id.toString();
  const userInfo = {
    userId,
    firstName: msg.from.first_name || 'User',
    username: msg.from.username || 'Unknown'
  };

  try {
    if (conversationManager.isInConversation(userId)) {
      await bot.sendMessage(userId, "You already have an active conversation!");
      return;
    }

    // Start conversation and send welcome message
    conversationManager.startConversation(userId, userInfo);
    await bot.sendMessage(userId, createWelcomeMessage(userInfo.firstName));

    // Notify staff members
    const notification = createSalesNotification(userInfo);
    await Promise.all([
      bot.sendMessage(config.salesId, notification),
      bot.sendMessage(config.adminId, notification)
    ]).catch(error => {
      console.error('Error sending staff notifications:', error);
    });

  } catch (error) {
    console.error('Error in /start command:', error);
    await bot.sendMessage(userId, "Sorry, there was an error starting the conversation. Please try again later.");
  }
});

// Message handler
bot.on('message', async (msg) => {
  if (msg.text === '/start') return;

  const userId = msg.from.id.toString();
  
  try {
    // Handle staff messages (sales and admin)
    if ([config.salesId, config.adminId].includes(userId)) {
      const targetUserId = MessageForwarder.extractUserIdFromReply(msg);
      if (targetUserId) {
        await MessageForwarder.forwardFromStaff(msg, targetUserId);
      }
    }
    // Handle user messages
    else if (conversationManager.isInConversation(userId)) {
      await MessageForwarder.forwardFromUser(msg, userId);
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

process.on('SIGINT', () => {
  bot.stopPolling();
  process.exit();
});