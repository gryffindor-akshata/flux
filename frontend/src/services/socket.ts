import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect() {
    if (this.socket?.connected) {
      return
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3002'
    
    this.socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.reconnectAttempts++
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error)
    })

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after', this.maxReconnectAttempts, 'attempts')
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  joinUserRoom(userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-user-room', userId)
    }
  }

  onIntentCreated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('intent-created', callback)
    }
  }

  onIntentAutoApproved(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('intent-auto-approved', callback)
    }
  }

  onIntentApproved(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('intent-approved', callback)
    }
  }

  onIntentRejected(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('intent-rejected', callback)
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners()
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export const socketService = new SocketService()
