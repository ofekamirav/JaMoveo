import  io  from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

export const socket = io(API_URL, {
  autoConnect: true, 
  transports: ["websocket"],
});

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});