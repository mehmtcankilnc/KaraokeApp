import { Music } from "../types/types";

export type AppStackParamList = {
  Home: undefined;
  Success: { vocalUri: string; mixedUri: string };
  Music: { music: Music };
};
