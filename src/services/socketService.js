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
    return new Promise((resolve, reject) => {
      if (this.socket && this.isConnected) {
        resolve();
        return;
      }

      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
      }

      // Use the same URL as chat-demo for consistency
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://campor-aa1452bb8116.herokuapp.com';
      
      console.log('🔌 Connecting to socket server:', socketUrl);
      
      this.socket = io(socketUrl, {
        auth: {
          token: token || localStorage.getItem('campor_token')
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
        console.log('🔌 Socket URL:', socketUrl);
        console.log('🔑 Auth token:', token ? 'Present' : 'Missing');
        this.isConnected = true;
        // Emit user_online event when connected
        this.emit('user_online');
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      // Add reconnection logic
      this.socket.on('reconnect', () => {
        console.log('🔄 Socket reconnected');
        this.isConnected = true;
        this.emit('user_online');
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('❌ Socket reconnection error:', error);
      });
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
    if (this.socket && this.isConnected && this.socket.connected) {
      console.log('📤 Emitting socket event:', event, data);
      this.socket.emit(event, data);
    } else {
      console.log('❌ Cannot emit event - socket not connected:', event, data);
      console.log('Socket status:', {
        socket: !!this.socket,
        isConnected: this.isConnected,
        socketConnected: this.socket?.connected
      });
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

  // Get connection status
  get connected() {
    return this.isConnected && this.socket?.connected === true;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Manual reconnect
  async reconnect(token) {
    console.log('🔄 Attempting to reconnect socket...');
    this.disconnect();
    return this.connect(token);
  }
}

export const socketService = new SocketService();
export default socketService;
