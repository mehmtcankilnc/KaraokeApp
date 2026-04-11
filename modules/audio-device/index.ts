import { requireNativeModule } from "expo";

const AudioDevice = requireNativeModule("AudioDevice");

export async function getCurrentDeviceType(): Promise<
  "bluetooth" | "wired" | "speaker" | "default"
> {
  return await AudioDevice.getCurrentDeviceType();
}
