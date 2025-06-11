import React from "react";

interface SongLinePart {
  lyrics: string;
  chords?: string;
}
type SongContent = SongLinePart[][];

interface SongDisplayProps {
  title: string;
  artist: string;
  content: SongContent;
  instrument: string | null;
}

const SongDisplay: React.FC<SongDisplayProps> = ({
  title,
  artist,
  content,
  instrument,
}) => {
  const isSinger = instrument === "Vocals";

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl font-mono text-xl sm:text-2xl leading-relaxed">
      <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-orange-400">
        {title}
      </h2>
      <p className="text-gray-400 mb-8 text-xl sm:text-2xl">by {artist}</p>

      <div className="space-y-8">
        {content.map((line, lineIndex) => (
          <div key={lineIndex} className="grid grid-cols-1">
            {!isSinger && (
              <div className="flex items-end">
                {line.map((part, partIndex) => (
                  <span
                    key={partIndex}
                    className="font-bold text-orange-400 w-full min-w-[3ch] pr-4"
                  >
                    {part.chords || "\u00A0"}{" "}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-start">
              {line.map((part, partIndex) => (
                <span
                  key={partIndex}
                  className="text-gray-200 w-full min-w-[3ch] pr-4"
                >
                  {part.lyrics}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongDisplay;
