import { Server } from "socket.io";

export function setupSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join-session', (sessionId) => {
      if (sessionId) {
        socket.join(sessionId);
        console.log(`Socket ${socket.id} joined session room: ${sessionId}`);
      }
    });

    socket.on('leave-session', (sessionId) => {
      if (sessionId) {
        socket.leave(sessionId);
        console.log(`Socket ${socket.id} left session room: ${sessionId}`);
      }
    });

     socket.on('toggle-scroll', (data: { sessionId: string; shouldScroll: boolean }) => {
      if (data.sessionId) {
        socket.to(data.sessionId).emit('scroll-state-changed', { shouldScroll: data.shouldScroll });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}