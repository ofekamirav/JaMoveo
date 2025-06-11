import express from 'express';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../controllers/auth_controller';
import { Request, Response } from 'express';

const router = express.Router();

const songsListPath = path.join(process.cwd(), 'data', 'songs.json');
const songsList = JSON.parse(fs.readFileSync(songsListPath, 'utf8'));


router.get('/', (req, res) => {
    res.json(songsList);
});

router.get('/search', authMiddleware, (req: Request, res: Response) => {
    const query = (req.query.q as string || '').toLowerCase();
    
    if (!query) {
        res.json([]);
        return; 
    }

    const filtered = songsList.filter((song: any) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );

    res.json(filtered);
});

router.get('/:id', authMiddleware, (req, res) => {
    const song = songsList.find((s: any) => s.id === req.params.id);

    if (!song) {
        res.status(404).json({ message: 'Song not found' });
        return; 
    }

    const relativePath = song.filePath.startsWith('/') ? song.filePath.substring(1) : song.filePath;
    const fullPath = path.join(process.cwd(), relativePath);  
    console.log(`Attempting to read song file from: ${fullPath}`); 

    
    fs.readFile(fullPath, 'utf8', (err, data) => {
        if (err) {
            console.error('File Read Error:', err);
            res.status(500).json({ message: 'Failed to read song file' });
            return; 
        }
        
        res.json({ ...song, content: JSON.parse(data) });
    });
});

export default router;