export type Music = {
  id: number;
  title: string;
  songPath: string;
  lyrics: Lyric[];
};

export type Lyric = {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
};

export type DeviceType = "speaker" | "bluetooth" | "wired" | "default";

export type FFmpegInput = {
  recorderUri: string;
  songPath: string;
  latencyMs: number;
  vocalVolume: string;
  playedDuration: number;
  outputUri: string;
};
