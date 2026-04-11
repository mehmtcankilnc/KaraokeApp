import ExpoModulesCore
import AVFoundation

public class AudioDeviceModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AudioDevice")

    AsyncFunction("getCurrentDeviceType") { () -> String in
      let session = AVAudioSession.sharedInstance()
      
      guard let output = session.currentRoute.outputs.first else {
        return "default"
      }
      
      switch output.portType {
      case .bluetoothA2DP, .bluetoothHFP, .bluetoothLE:
        return "bluetooth"
      case .headphones, .headsetMic, .usbAudio:
        return "wired"
      case .builtInSpeaker:
        return "speaker"
      default:
        return "default"
      }
    }
  }
}
