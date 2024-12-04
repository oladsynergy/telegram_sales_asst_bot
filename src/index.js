import TelegramBot from 'node-telegram-bot-api';
import { config } from './config.js';
import { groupManager } from './utils/groupManager.js';
import { createWelcomeMessage, createNotificationMessage } from './utils/messageHandler.js';

const bot = new TelegramBot(config.botToken, { polling: true });

// Start command handler
bot.onText(/\/start/, async (msg) => {
  const userId = msg.from.id;
  const username = msg.from.username || msg.from.first_name;

  // Check if user already has a group
  if (groupManager.hasGroup(userId)) {
    return bot.sendMessage(userId, "You already have an active conversation!");
  }

  try {
    // Create a new group
    const group = await bot.createNewGroup(`Sales Chat - ${username}`, [
      userId.toString(),
      config.salesId,
      config.adminId
    ]);

    // Store the group information
    groupManager.addGroup(userId, group.id);

    // Send welcome messages
    await bot.sendMessage(group.id, createWelcomeMessage(username));
    
    // Notify sales and admin
    const notification = createNotificationMessage(username);
    await bot.sendMessage(config.salesId, notification);
    await bot.sendMessage(config.adminId, notification);

  } catch (error) {
    console.error('Error creating group:', error);
    await bot.sendMessage(userId, "Sorry, there was an error creating the conversation. Please try again later.");
  }
});

// Handle messages in groups
bot.on('message', async (msg) => {
  if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
    // Handle group messages if needed
    console.log(`Message in group ${msg.chat.id} from ${msg.from.id}: ${msg.text}`);
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