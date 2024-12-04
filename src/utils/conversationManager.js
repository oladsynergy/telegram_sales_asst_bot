class ConversationManager {
  constructor() {
    this.conversations = new Map();
    this.userStatus = new Map();
  }

  startConversation(userId, userInfo) {
    const stringUserId = userId.toString();
    this.conversations.set(stringUserId, {
      userId: stringUserId,
      userInfo,
      startTime: new Date(),
      isActive: true
    });
    this.userStatus.set(stringUserId, 'active');
    console.log(`Conversation started for user ${stringUserId}`);
  }

  isInConversation(userId) {
    const stringUserId = userId.toString();
    const status = this.userStatus.get(stringUserId) === 'active';
    console.log(`Checking conversation status for ${stringUserId}: ${status}`);
    return status;
  }

  getConversationInfo(userId) {
    const stringUserId = userId.toString();
    return this.conversations.get(stringUserId);
  }

  endConversation(userId) {
    const stringUserId = userId.toString();
    this.userStatus.set(stringUserId, 'inactive');
    const conversation = this.conversations.get(stringUserId);
    if (conversation) {
      conversation.isActive = false;
    }
    console.log(`Conversation ended for user ${stringUserId}`);
  }
}

export const conversationManager = new ConversationManager();