import { FFmpegInput, Music } from "../types/types";

export type AppStackParamList = {
  Home: undefined;
  Success: { vocalUri: string; mixedUri: string; ffmpegInput: FFmpegInput };
  Music: { music: Music };
};
