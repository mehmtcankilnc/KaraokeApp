import { NativeModule, requireNativeModule } from 'expo';

import { AudioDeviceModuleEvents } from './AudioDevice.types';

declare class AudioDeviceModule extends NativeModule<AudioDeviceModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<AudioDeviceModule>('AudioDevice');
