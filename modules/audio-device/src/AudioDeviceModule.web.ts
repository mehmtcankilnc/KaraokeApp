import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './AudioDevice.types';

type AudioDeviceModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class AudioDeviceModule extends NativeModule<AudioDeviceModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(AudioDeviceModule, 'AudioDeviceModule');
