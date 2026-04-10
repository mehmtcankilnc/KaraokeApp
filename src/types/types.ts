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
