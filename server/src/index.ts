import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';

dotenv.config();

connectDB();

const app: Express = express();
const PORT = process.env.PORT || 5001;

app.use(cors()); 
app.use(express.json()); 

app.get('/', (req: Request, res: Response) => {
    res.send('Server is running...');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));