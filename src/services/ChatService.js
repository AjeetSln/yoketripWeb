import io from 'socket.io-client';

const ChatService = {
  socket: null,
  messageCallback: null,
  isManuallyDisconnected: false,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  initialReconnectDelay: 1000,
  maxReconnectDelay: 30000,
  messageStream: null,

  async connect(onMessage) {
    if (this.socket?.connected) return;
    await this.disconnectIfNeeded();
    this.initializeConnection(onMessage);
    
    // Initialize BroadcastChannel
    if (!this.messageStream || this.messageStream.closed) {
      try {
        this.messageStream = new BroadcastChannel('chat_messages');
      } catch (error) {
        console.error('Failed to initialize BroadcastChannel:', error);
        return;
      }
    }
    
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token available');

    this.socket = io('https://yoketrip.in', {
      transports: ['websocket'],
      path: '/socket.io',
      query: { token },
      forceNew: true,
    });

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      if (!this.isManuallyDisconnected) this.scheduleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.scheduleReconnect();
    });

    this.socket.on('new_message', (data) => {
      const message = typeof data === 'string' ? JSON.parse(data) : data;
      this.messageCallback?.({ type: 'new_message', message });
      if (this.messageStream && !this.messageStream.closed) {
        try {
          this.messageStream.postMessage({ type: 'new_message', message });
        } catch (error) {
          console.error('Failed to post message to BroadcastChannel:', error);
        }
      }
    });

    this.socket.on('typing', (data) => {
      this.messageCallback?.({ type: 'typing', ...data });
      if (this.messageStream && !this.messageStream.closed) {
        try {
          this.messageStream.postMessage({ type: 'typing', ...data });
        } catch (error) {
          console.error('Failed to post typing to BroadcastChannel:', error);
        }
      }
    });

    this.socket.on('presence', (data) => {
      this.messageCallback?.({ type: 'presence', ...data });
      if (this.messageStream && !this.messageStream.closed) {
        try {
          this.messageStream.postMessage({ type: 'presence', ...data });
        } catch (error) {
          console.error('Failed to post presence to BroadcastChannel:', error);
        }
      }
    });

    this.socket.on('presence_update', (data) => {
      this.messageCallback?.({ type: 'presence_update', ...data });
      if (this.messageStream && !this.messageStream.closed) {
        try {
          this.messageStream.postMessage({ type: 'presence_update', ...data });
        } catch (error) {
          console.error('Failed to post presence_update to BroadcastChannel:', error);
        }
      }
    });

    this.socket.connect();
  },

  async disconnectIfNeeded() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.messageStream && !this.messageStream.closed) {
      try {
        this.messageStream.close();
      } catch (error) {
        console.error('Error closing BroadcastChannel:', error);
      }
      this.messageStream = null;
    }
  },

  initializeConnection(onMessage) {
    this.messageCallback = onMessage;
    this.isManuallyDisconnected = false;
    this.reconnectAttempts = 0;
  },

  scheduleReconnect() {
    if (this.isManuallyDisconnected || this.reconnectAttempts >= this.maxReconnectAttempts) return;
    const delay = Math.min(
      this.initialReconnectDelay * Math.pow(2, Math.min(this.reconnectAttempts, 5)),
      this.maxReconnectDelay
    );
    setTimeout(() => {
      this.reconnectAttempts++;
      if (this.messageCallback) this.connect(this.messageCallback);
    }, delay);
  },

  sendMessage(receiverId, content) {
    if (!this.socket?.connected) return;
    this.socket.emit('send_message', { receiverId, content });
  },

  sendTyping(receiverId, isTyping) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing', { receiverId, isTyping });
  },

  disconnect() {
    this.isManuallyDisconnected = true;
    if (this.messageStream && !this.messageStream.closed) {
      try {
        this.messageStream.close();
      } catch (error) {
        console.error('Error closing BroadcastChannel:', error);
      }
      this.messageStream = null;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.messageCallback = null;
  },
};

export default ChatService;