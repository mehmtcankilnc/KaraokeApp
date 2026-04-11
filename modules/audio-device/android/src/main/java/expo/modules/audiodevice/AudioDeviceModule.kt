package expo.modules.audiodevice

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL
import android.content.Context
import android.media.AudioDeviceInfo
import android.media.AudioManager

class AudioDeviceModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AudioDevice")

    AsyncFunction("getCurrentDeviceType") { ->
      val audioManager = appContext.reactContext?.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
        ?: return@AsyncFunction "default"

      val devices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS)

      val isBluetoothConnected = devices.any {
        it.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP ||
        it.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO ||
        it.type == AudioDeviceInfo.TYPE_BLE_HEADSET ||
        it.type == AudioDeviceInfo.TYPE_BLE_SPEAKER
      }

      if (isBluetoothConnected) {
        return@AsyncFunction "bluetooth"
      }

      val isWiredConnected = devices.any {
        it.type == AudioDeviceInfo.TYPE_WIRED_HEADPHONES ||
        it.type == AudioDeviceInfo.TYPE_WIRED_HEADSET ||
        it.type == AudioDeviceInfo.TYPE_USB_HEADSET
      }

      if (isWiredConnected) {
        return@AsyncFunction "wired"
      }

      return@AsyncFunction "speaker"
    }
  }
}
