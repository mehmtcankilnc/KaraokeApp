export type Music = {
  id: number;
  title: string;
  songPath: string;
  lyrics: [];
};

export const musics: Music[] = [
  {
    id: 1,
    title: "Serdar Ortaç - Poşet",
    songPath: require("../assets/songs/serdar-ortac-poset.mp3"),
    lyrics: require("../assets/lyrics/serdar-ortac-poset.json"),
  },
];
