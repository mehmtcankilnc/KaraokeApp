import { requireNativeView } from 'expo';
import * as React from 'react';

import { AudioDeviceViewProps } from './AudioDevice.types';

const NativeView: React.ComponentType<AudioDeviceViewProps> =
  requireNativeView('AudioDevice');

export default function AudioDeviceView(props: AudioDeviceViewProps) {
  return <NativeView {...props} />;
}
