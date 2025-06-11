import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './config/db';
import authRoutes from './routes/auth_routes';
import songsRoutes from './routes/songs_routes';
dotenv.config();

connectDB();

const app: Express = express();
const PORT = process.env.PORT || 5001;

app.use(cors()); 
app.use(express.json()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.use('/auth', authRoutes);
app.use('/songs', songsRoutes); 


app.get('/', (req: Request, res: Response) => {
    res.send('Server is running...');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));