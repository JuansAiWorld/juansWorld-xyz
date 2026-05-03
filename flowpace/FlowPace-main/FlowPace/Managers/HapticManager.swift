import Foundation
import CoreHaptics
import UIKit

@MainActor
class HapticManager: ObservableObject {
    private var engine: CHHapticEngine?
    private var isHapticsEnabled = true
    
    @Published var isHapticsSupported = false
    
    init() {
        checkHapticSupport()
        setupHapticEngine()
    }
    
    // MARK: - Haptic Support Check
    
    private func checkHapticSupport() {
        if CHHapticEngine.capabilitiesForHardware().supportsHaptics {
            isHapticsSupported = true
        } else {
            isHapticsSupported = false
        }
    }
    
    // MARK: - Haptic Engine Setup
    
    private func setupHapticEngine() {
        guard isHapticsSupported else { return }
        
        do {
            engine = try CHHapticEngine()
            try engine?.start()
            
            engine?.resetHandler = { [weak self] in
                self?.restartHapticEngine()
            }
            
            engine?.stoppedHandler = { reason in
                print("Haptic engine stopped: \(reason)")
            }
            
        } catch {
            print("Failed to create haptic engine: \(error)")
            // For iOS 26 simulator issues, disable custom haptics but keep system haptics
            if error.localizedDescription.contains("hapticpatternlibrary.plist") {
                print("iOS 26 simulator haptic library issue detected - using system haptics only")
                isHapticsSupported = false
            }
        }
    }
    
    private func restartHapticEngine() {
        do {
            try engine?.start()
        } catch {
            print("Failed to restart haptic engine: \(error)")
        }
    }
    
    // MARK: - Haptic Feedback Methods
    
    func playStartHaptic() {
        guard isHapticsEnabled && isHapticsSupported else { return }
        
        // Use system haptics for start
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()
    }
    
    func playPauseHaptic() {
        guard isHapticsEnabled && isHapticsSupported else { return }
        
        // Use system haptics for pause
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()
    }
    
    func playStepChangeHaptic() {
        guard isHapticsEnabled && isHapticsSupported else { return }
        
        // Use system haptics for step change
        let impactFeedback = UIImpactFeedbackGenerator(style: .rigid)
        impactFeedback.impactOccurred()
    }
    
    func playCompletionHaptic() {
        guard isHapticsEnabled && isHapticsSupported else { return }
        
        // Use system haptics for completion
        let notificationFeedback = UINotificationFeedbackGenerator()
        notificationFeedback.notificationOccurred(.success)
    }
    
    func playCountdownHaptic() {
        guard isHapticsEnabled && isHapticsSupported else { return }
        
        // Use system haptics for countdown
        let impactFeedback = UIImpactFeedbackGenerator(style: .soft)
        impactFeedback.impactOccurred()
    }
    
    func playErrorHaptic() {
        guard isHapticsEnabled && isHapticsSupported else { return }
        
        // Use system haptics for errors
        let notificationFeedback = UINotificationFeedbackGenerator()
        notificationFeedback.notificationOccurred(.error)
    }
    
    // MARK: - Custom Haptic Patterns
    
    func playCustomHaptic(intensity: Float, sharpness: Float) {
        guard isHapticsEnabled && isHapticsSupported,
              let engine = engine else { return }
        
        let intensityParameter = CHHapticEventParameter(parameterID: .hapticIntensity, value: intensity)
        let sharpnessParameter = CHHapticEventParameter(parameterID: .hapticSharpness, value: sharpness)
        
        let event = CHHapticEvent(eventType: .hapticTransient, parameters: [intensityParameter, sharpnessParameter], relativeTime: 0)
        
        do {
            let pattern = try CHHapticPattern(events: [event], parameters: [])
            let player = try engine.makePlayer(with: pattern)
            try player.start(atTime: 0)
        } catch {
            print("Failed to play custom haptic: \(error)")
        }
    }
    
    func playRoutineStartHaptic() {
        guard isHapticsEnabled && isHapticsSupported else { return }
        
        // Play a sequence of haptics for routine start
        let impactFeedback = UIImpactFeedbackGenerator(style: .heavy)
        impactFeedback.prepare()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            impactFeedback.impactOccurred()
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            impactFeedback.impactOccurred()
        }
    }
    
    func playStepTransitionHaptic() {
        guard isHapticsEnabled && isHapticsSupported else { return }
        
        // Play a light haptic for step transitions
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()
    }
    
    // MARK: - Settings Management
    
    func toggleHaptics() {
        isHapticsEnabled.toggle()
        UserDefaults.standard.set(isHapticsEnabled, forKey: "isHapticsEnabled")
    }
    
    func enableHaptics() {
        isHapticsEnabled = true
        UserDefaults.standard.set(true, forKey: "isHapticsEnabled")
    }
    
    func disableHaptics() {
        isHapticsEnabled = false
        UserDefaults.standard.set(false, forKey: "isHapticsEnabled")
    }
    
    // MARK: - Cleanup
    
    func stopHapticEngine() {
        engine?.stop()
    }
    
    deinit {
        // Don't call stopHapticEngine in deinit as it can cause retain cycles
        // The haptic engine will be stopped automatically when the object is deallocated
    }
}
