import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.token = null;
  }

  connect(token) {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.token = token;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    this.socket = io(API_URL, {
      auth: {
        token: token
      },
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
    });

    // Order update listeners
    this.socket.on('order_updated', (data) => {
      console.log('Order updated:', data);
      // Dispatch to Redux store or handle as needed
      if (window.orderUpdateCallback) {
        window.orderUpdateCallback(data);
      }
    });

    this.socket.on('new_order', (data) => {
      console.log('New order received:', data);
      if (window.newOrderCallback) {
        window.newOrderCallback(data);
      }
      toast.success(`New order #${data.orderId} received!`, {
        duration: 5000
      });
    });

    this.socket.on('payment_updated', (data) => {
      console.log('Payment updated:', data);
      if (window.paymentUpdateCallback) {
        window.paymentUpdateCallback(data);
      }
      
      if (data.paymentStatus === 'PAID') {
        toast.success('Payment completed successfully!');
      } else if (data.paymentStatus === 'FAILED') {
        toast.error('Payment failed. Please try again.');
      }
    });

    this.socket.on('profile_updated', (data) => {
      console.log('Profile updated:', data);
      if (window.profileUpdateCallback) {
        window.profileUpdateCallback(data);
      }
      toast.success('Profile updated successfully!');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join order-specific room for real-time updates
  joinOrder(orderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_order', orderId);
    }
  }

  // Leave order-specific room
  leaveOrder(orderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_order', orderId);
    }
  }

  // Set callbacks for different events
  onOrderUpdate(callback) {
    window.orderUpdateCallback = callback;
  }

  onNewOrder(callback) {
    window.newOrderCallback = callback;
  }

  onPaymentUpdate(callback) {
    window.paymentUpdateCallback = callback;
  }

  onProfileUpdate(callback) {
    window.profileUpdateCallback = callback;
  }

  // Remove callbacks
  removeCallbacks() {
    window.orderUpdateCallback = null;
    window.newOrderCallback = null;
    window.paymentUpdateCallback = null;
    window.profileUpdateCallback = null;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Export singleton instance
export default new WebSocketService();