export const createWelcomeMessage = (username) => {
  return `👋 Welcome ${username}!\n\nThank you for reaching out. You are now connected with our sales team. Your message will be delivered to our sales representative and admin who will assist you shortly.\n\nFeel free to ask any questions!`;
};

export const createSalesNotification = (userInfo) => {
  return `🔔 New conversation started!\n\nUser Details:\nName: ${userInfo.firstName}\nUsername: ${userInfo.username || 'Not provided'}\nID: ${userInfo.userId}`;
};

export const createForwardNotice = (fromId, toId) => {
  return `Message forwarded from ${fromId} to ${toId}`;
};