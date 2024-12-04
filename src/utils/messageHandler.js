export const createWelcomeMessage = (username) => {
  return `👋 Welcome ${username}!\n\nYou are now connected with our sales team. Your messages will be delivered instantly to our sales representative and admin.\n\nFeel free to ask any questions!`;
};

export const createSalesNotification = (userInfo) => {
  return `🔔 New User Connected!\n\nUser Details:\nName: ${userInfo.firstName}\nUsername: @${userInfo.username}\nID: ${userInfo.userId}\n\n📝 Reply to this message to communicate with the user.`;
};