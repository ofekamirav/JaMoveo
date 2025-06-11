import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Word {
  lyrics: string;
  chords?: string;
}
type Line = Word[];
type SongData = Line[];

const SongViewer: React.FC = () => {
  const { songId } = useParams<{ songId: string }>();
  const [songData, setSongData] = useState<SongData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!songId) return;

    const fetchSongData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const dbResponse = await fetch("/data/songs.json");
        const songsDb = await dbResponse.json();
        const songInfo = songsDb.find((song: any) => song.id === songId);

        if (!songInfo) {
          throw new Error("Song not found in database.");
        }

        const songResponse = await fetch(songInfo.filePath);
        if (!songResponse.ok) {
          throw new Error("Failed to load song data.");
        }
        const data: SongData = await songResponse.json();
        setSongData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongData();
  }, [songId]);

  if (isLoading) {
    return <div className="text-center mt-20">Loading song...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">Error: {error}</div>;
  }

  if (!songData) {
    return <div className="text-center mt-20">No song data available.</div>;
  }

  return (
    <div className="p-4 sm:p-8 font-mono max-w-4xl mx-auto">
      {songData.map((line, lineIndex) => (
        <div key={lineIndex} className="flex flex-wrap items-end mb-6">
          {line.map((word, wordIndex) => (
            <div key={wordIndex} className="flex flex-col items-center mr-2">
              <span className="text-orange-600 font-bold text-sm h-5">
                {word.chords || ""}
              </span>
              <span className="text-lg text-gray-800">{word.lyrics}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SongViewer;
