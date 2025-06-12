export enum Instrument {
  Drums = "Drums",
  Guitar = "Guitar",
  Bass = "Bass",
  Saxophone = "Saxophone",
  Keyboards = "Keyboards",
  Vocals = "Vocals"
}

const instrumentIcons = {
  Drums: "🥁",
  Guitar: "🎸",
  Bass: "🎸",
  Saxophone: "🎷",
  Keyboards: "🎹",
  Vocals: "🎤"
};

export const getInstrumentIcon = (instrument: Instrument) => instrumentIcons[instrument];