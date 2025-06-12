import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './config/db';
import http from 'http';
import { Server } from 'socket.io';
import { setupSocket } from './sockets/socket';
import authRoutes from './routes/auth_routes';
import songsRoutes from './routes/songs_routes';
import rehearsalRoutes from "./routes/rehearsal_routes";

dotenv.config();

connectDB();

const app: Express = express();
const server = http.createServer(app); 
const PORT = process.env.PORT || 5001;

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST', 'PATCH'],
        credentials: true,
    },
});

app.set('io', io);
setupSocket(io);

app.use(cors()); 
app.use(express.json()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.use('/auth', authRoutes);
app.use('/songs', songsRoutes); 
app.use("/rehearsals", rehearsalRoutes);


app.get('/', (req: Request, res: Response) => {
    res.send('Server is running...');
});

server.listen(PORT, () => {
  console.log(`Server with Socket.IO running on port ${PORT}`);
});