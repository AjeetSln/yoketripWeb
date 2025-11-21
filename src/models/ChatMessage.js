class ChatMessage {
  constructor({ id, senderId, receiverId, content, createdAt, isRead = false }) {
    this.id = id || '';
    this.senderId = senderId || '';
    this.receiverId = receiverId || '';
    this.content = content || '';
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.isRead = isRead;
  }

  static fromJson(json) {
    return new ChatMessage({
      id: json._id || json.id || '',
      senderId: json.senderId?._id || json.senderId || '',
      receiverId: json.receiverId || '',
      content: json.content || '',
      createdAt: json.createdAt,
      isRead: json.isRead || false,
    });
  }
}

export default ChatMessage;