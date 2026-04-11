import * as React from 'react';

import { AudioDeviceViewProps } from './AudioDevice.types';

export default function AudioDeviceView(props: AudioDeviceViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
