class GroupManager {
  constructor() {
    this.groups = new Map();
  }

  addGroup(userId, groupId) {
    this.groups.set(userId, groupId);
  }

  getGroup(userId) {
    return this.groups.get(userId);
  }

  hasGroup(userId) {
    return this.groups.has(userId);
  }
}

export const groupManager = new GroupManager();