import { FFmpegKit, FFmpegSession } from "@wokcito/ffmpeg-kit-react-native";
import { FFmpegInput } from "../types/types";

export async function executeFFmpeg(
  input: FFmpegInput,
): Promise<FFmpegSession> {
  const command = `-i "${input.recorderUri}" -i "${input.songPath}" -filter_complex "[0:a]atrim=start=${input.latencyMs / 1000},asetpts=PTS-STARTPTS,volume=${input.vocalVolume}[vocal];[1:a]volume=0.05[bg];[vocal][bg]amix=inputs=2:duration=longest[mixout];[mixout]volume=1.5" -t ${input.playedDuration} "${input.outputUri}"`;
  const session = await FFmpegKit.execute(command);
  return session;
}
