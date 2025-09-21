// Socket.IO service for real-time chat functionality
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
  }

  // Initialize socket connection
  connect(token) {
    if (this.socket && this.isConnected) {
      return;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
    }

    // Validate that VITE_SOCKET_URL is set
    if (!import.meta.env.VITE_SOCKET_URL) {
      console.error('❌ VITE_SOCKET_URL environment variable is not set!');
      console.error('Please set VITE_SOCKET_URL in your environment variables.');
    }
    
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    
    this.socket = io(socketUrl, {
      auth: {
        token: token || localStorage.getItem('campor_token')
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      // Emit user_online event when connected
      this.emit('user_online');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Emit an event to the server
  emit(event, data) {
    if (this.socket && this.isConnected) {
      console.log('📤 Emitting socket event:', event, data);
      this.socket.emit(event, data);
    } else {
      console.log('❌ Cannot emit event - socket not connected:', event, data);
    }
  }

  // Listen to an event from the server
  on(event, callback) {
    if (this.socket) {
      console.log('👂 Setting up socket listener for:', event);
      this.socket.on(event, callback);
      
      // Store the listener for cleanup
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }
      this.eventListeners.get(event).push(callback);
    } else {
      console.log('❌ Cannot set up listener - socket not available:', event);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from our tracking
      if (this.eventListeners.has(event)) {
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  // Join a chat room
  joinChat(chatId) {
    this.emit('join_chat', chatId);
  }

  // Leave a chat room
  leaveChat(chatId) {
    this.emit('leave_chat', chatId);
  }

  // Start typing indicator
  startTyping(receiverId) {
    this.emit('typing_start', { receiverId });
  }

  // Stop typing indicator
  stopTyping(receiverId) {
    this.emit('typing_stop', { receiverId });
  }

  // Clean up all listeners
  cleanup() {
    if (this.socket) {
      this.eventListeners.forEach((listeners, event) => {
        listeners.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
      this.eventListeners.clear();
    }
  }
}

export const socketService = new SocketService();
export default socketService;
