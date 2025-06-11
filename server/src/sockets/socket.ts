// socket.ts
import { Server } from "socket.io";

export function setupSocket(io: Server) {
  io.on('connection', (socket) => {
    socket.on('join-session', (sessionId) => {
      socket.join(sessionId);
    });

    socket.on('change-song', ({ sessionId, songId }) => {
      io.to(sessionId).emit('song-changed', songId);
    });

    socket.on('disconnect', () => {
      // Optional: handle disconnects
    });
  });
}
