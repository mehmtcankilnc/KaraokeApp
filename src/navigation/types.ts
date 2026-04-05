import { Music } from "../data/musics";

type MusicScreenProps = {
  music: Music;
};

export type AppStackParamList = {
  Home: undefined;
  Music: MusicScreenProps;
};
