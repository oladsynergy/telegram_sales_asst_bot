class ConversationManager {
  constructor() {
    this.conversations = new Map();
    this.userStatus = new Map();
  }

  startConversation(userId, userInfo) {
    this.conversations.set(userId, {
      userId,
      userInfo,
      startTime: new Date(),
      isActive: true
    });
    this.userStatus.set(userId, 'active');
  }

  isInConversation(userId) {
    return this.userStatus.get(userId) === 'active';
  }

  getConversationInfo(userId) {
    return this.conversations.get(userId);
  }

  endConversation(userId) {
    this.userStatus.set(userId, 'inactive');
    const conversation = this.conversations.get(userId);
    if (conversation) {
      conversation.isActive = false;
    }
  }
}

export const conversationManager = new ConversationManager();