import Foundation
import AVFoundation
import AVFAudio

@MainActor
class AudioManager: ObservableObject {
    private var audioPlayer: AVAudioPlayer?
    private var speechSynthesizer = AVSpeechSynthesizer()
    
    @Published var isAudioEnabled = true
    @Published var isVoiceEnabled = false
    @Published var volume: Float = 0.7
    @Published var selectedVoiceIdentifier: String?
    @Published var selectedSoundPackId: String = "default"
    
    private let userDefaults = UserDefaults.standard
    

    
    init() {
        loadSettings()
        setupAudioSession()
    }
    
    // MARK: - Audio Session Setup
    
    private func setupAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Failed to setup audio session: \(error)")
        }
    }
    
    // MARK: - Audio Preparation
    
    func prepareAudio() {
        // Prepare audio files for playback
        // In a real app, you would load actual audio files here
    }
    
    // MARK: - Sound Effects
    
    func playStepChangeSound() {
        guard isAudioEnabled else { return }
        if !playPackSound(named: "step_change") {
            playSystemSound(SystemSoundID(1005))
        }
    }
    
    func playCompletionSound() {
        guard isAudioEnabled else { return }
        if !playPackSound(named: "completion") {
            playSystemSound(SystemSoundID(1006))
        }
    }
    
    func playCountdownSound() {
        guard isAudioEnabled else { return }
        if !playPackSound(named: "countdown") {
            playSystemSound(SystemSoundID(1007))
        }
    }
    
    private func playSystemSound(_ soundID: SystemSoundID) {
        AudioServicesPlaySystemSound(soundID)
    }

    // MARK: - Sound Packs
    struct SoundPack: Identifiable {
        let id: String
        let displayName: String
        let description: String
        let emoji: String
        let category: String
        let bundleFolder: String
        let previewSound: String
        
        var name: String { displayName }
    }
    
    // Built-in packs - Entrepreneur & Productivity Focused
    let builtInPacks: [SoundPack] = [
        // Productivity & Focus Packs
        SoundPack(id: "coffee_flow", displayName: "Coffee Shop Flow", description: "Deep work sessions", emoji: "☕", category: "Productivity", bundleFolder: "SoundPacks/coffee_flow", previewSound: "espresso_steam"),
        SoundPack(id: "executive_suite", displayName: "Executive Suite", description: "Power working mode", emoji: "🏢", category: "Productivity", bundleFolder: "SoundPacks/executive_suite", previewSound: "pen_click"),
        SoundPack(id: "dopamine_hits", displayName: "Dopamine Hits", description: "Gamify your tasks", emoji: "🎯", category: "Productivity", bundleFolder: "SoundPacks/dopamine_hits", previewSound: "achievement"),
        SoundPack(id: "deep_focus", displayName: "Deep Focus", description: "Pomodoro sessions", emoji: "🌊", category: "Productivity", bundleFolder: "SoundPacks/deep_focus", previewSound: "rain_drop"),
        SoundPack(id: "startup_energy", displayName: "Startup Energy", description: "Build momentum", emoji: "⚡", category: "Productivity", bundleFolder: "SoundPacks/startup_energy", previewSound: "startup_chime"),
        
        // Fitness & Wellness Packs
        SoundPack(id: "boxing_gym", displayName: "Boxing Gym", description: "Train like a champion", emoji: "🥊", category: "Fitness", bundleFolder: "SoundPacks/boxing_gym", previewSound: "boxing_bell"),
        SoundPack(id: "zen_garden", displayName: "Zen Garden", description: "Yoga & meditation", emoji: "🧘", category: "Fitness", bundleFolder: "SoundPacks/zen_garden", previewSound: "singing_bowl"),
        SoundPack(id: "8bit_arcade", displayName: "8-Bit Arcade", description: "Gamify workouts", emoji: "🎮", category: "Fitness", bundleFolder: "SoundPacks/8bit_arcade", previewSound: "coin_insert"),
        SoundPack(id: "beach_training", displayName: "Beach Training", description: "Outdoor vibes", emoji: "🏖️", category: "Fitness", bundleFolder: "SoundPacks/beach_training", previewSound: "lifeguard_whistle"),
        SoundPack(id: "space_mission", displayName: "Space Mission", description: "Make it epic", emoji: "🚀", category: "Fitness", bundleFolder: "SoundPacks/space_mission", previewSound: "launch_countdown"),
        
        // Classic Packs
        SoundPack(id: "default", displayName: "Default", description: "Clean system sounds", emoji: "🔊", category: "Classic", bundleFolder: "SoundPacks/default", previewSound: "system_beep"),
        SoundPack(id: "minimal", displayName: "Minimal", description: "Subtle glass sounds", emoji: "🔔", category: "Classic", bundleFolder: "SoundPacks/minimal", previewSound: "glass_chime"),
        SoundPack(id: "energetic", displayName: "Energetic", description: "High-energy alerts", emoji: "⚡", category: "Classic", bundleFolder: "SoundPacks/energetic", previewSound: "energy_alert")
    ]
    
    func setSoundPack(_ id: String) {
        selectedSoundPackId = id
        saveSettings()
    }
    
    private func playPackSound(named name: String) -> Bool {
        guard let pack = builtInPacks.first(where: { $0.id == selectedSoundPackId }) else { return false }
        
        // Try common extensions in order
        let exts = ["wav", "aif", "aiff", "mp3", "caf"]
        for ext in exts {
            if let url = Bundle.main.url(forResource: "\(pack.bundleFolder)/\(name)", withExtension: ext) {
                do {
                    audioPlayer = try AVAudioPlayer(contentsOf: url)
                    audioPlayer?.volume = volume
                    audioPlayer?.prepareToPlay()
                    audioPlayer?.play()
                    return true
                } catch {
                    continue
                }
            }
        }
        
        // Fallback to different system sounds per pack for immediate differentiation
        playPackSystemSound(for: pack.id, named: name)
        return true
    }
    
    private func playPackSystemSound(for packId: String, named soundName: String) {
        let soundMap: [String: [String: SystemSoundID]] = [
            // Productivity Packs - Using only valid SystemSoundIDs (1000-1018)
            "coffee_flow": [
                "step_change": SystemSoundID(1003), // Glass sound - coffee shop ambiance
                "countdown": SystemSoundID(1004),   // Glass sound - gentle bell
                "completion": SystemSoundID(1005)  // System beep - satisfied sip
            ],
            "executive_suite": [
                "step_change": SystemSoundID(1006), // System completion - professional click
                "countdown": SystemSoundID(1007),   // System countdown - desk bell
                "completion": SystemSoundID(1008)  // System sound - briefcase snap
            ],
            "dopamine_hits": [
                "step_change": SystemSoundID(1009), // System sound - achievement
                "countdown": SystemSoundID(1010),   // System sound - XP gain
                "completion": SystemSoundID(1011)  // System sound - level up
            ],
            "deep_focus": [
                "step_change": SystemSoundID(1012), // System sound - rain drop
                "countdown": SystemSoundID(1013),   // System sound - gentle chime
                "completion": SystemSoundID(1014)  // System sound - Tibetan bowl
            ],
            "startup_energy": [
                "step_change": SystemSoundID(1015), // System sound - startup chime
                "countdown": SystemSoundID(1016),   // System sound - Tesla sound
                "completion": SystemSoundID(1017)  // System sound - rocket launch
            ],
            
            // Fitness Packs - Using only valid SystemSoundIDs
            "boxing_gym": [
                "step_change": SystemSoundID(1018), // System sound - boxing bell
                "countdown": SystemSoundID(1000),   // New mail - coach whistle
                "completion": SystemSoundID(1001)  // Mail sent - crowd cheer
            ],
            "zen_garden": [
                "step_change": SystemSoundID(1002), // Voicemail - singing bowl
                "countdown": SystemSoundID(1003),   // Glass sound - bamboo chime
                "completion": SystemSoundID(1004)  // Glass sound - deep gong
            ],
            "8bit_arcade": [
                "step_change": SystemSoundID(1005), // System beep - coin insert
                "countdown": SystemSoundID(1006),   // System completion - power-up
                "completion": SystemSoundID(1007)  // System countdown - victory fanfare
            ],
            "beach_training": [
                "step_change": SystemSoundID(1008), // System sound - lifeguard whistle
                "countdown": SystemSoundID(1009),   // System sound - wave crash
                "completion": SystemSoundID(1010)  // System sound - steel drum
            ],
            "space_mission": [
                "step_change": SystemSoundID(1011), // System sound - launch countdown
                "countdown": SystemSoundID(1012),   // System sound - airlock hiss
                "completion": SystemSoundID(1013)  // System sound - mission accomplished
            ],
            
            // Classic Packs - Keep original mapping
            "default": [
                "step_change": SystemSoundID(1005), // System beep
                "countdown": SystemSoundID(1007),   // System countdown
                "completion": SystemSoundID(1006)  // System completion
            ],
            "minimal": [
                "step_change": SystemSoundID(1003), // Glass sound
                "countdown": SystemSoundID(1004),   // Glass sound
                "completion": SystemSoundID(1003)  // Glass sound
            ],
            "energetic": [
                "step_change": SystemSoundID(1008), // System sound
                "countdown": SystemSoundID(1009),  // System sound
                "completion": SystemSoundID(1010)  // System sound
            ]
        ]
        
        if let packSounds = soundMap[packId],
           let soundID = packSounds[soundName] {
            playSystemSound(soundID)
        } else {
            // Fallback to default sound if pack not found
            playSystemSound(SystemSoundID(1005))
        }
    }
    
    // MARK: - Voice Synthesis
    
    func speakStepName(_ stepName: String) {
        guard isVoiceEnabled && isAudioEnabled else { return }
        
        let utterance = AVSpeechUtterance(string: "Next: \(stepName)")
        utterance.voice = resolveSelectedVoice()
        utterance.rate = 0.5
        utterance.volume = volume
        utterance.pitchMultiplier = 1.0
        
        speechSynthesizer.speak(utterance)
    }
    
    func speakCountdown(_ seconds: Int) {
        guard isVoiceEnabled && isAudioEnabled else { return }
        
        let utterance = AVSpeechUtterance(string: "\(seconds)")
        utterance.voice = resolveSelectedVoice()
        utterance.rate = 0.6
        utterance.volume = volume
        utterance.pitchMultiplier = 1.2
        
        speechSynthesizer.speak(utterance)
    }
    
    func speakStepComplete() {
        guard isVoiceEnabled && isAudioEnabled else { return }
        
        let utterance = AVSpeechUtterance(string: "Step complete")
        utterance.voice = resolveSelectedVoice()
        utterance.rate = 0.5
        utterance.volume = volume
        utterance.pitchMultiplier = 1.0
        
        speechSynthesizer.speak(utterance)
    }
    
    // MARK: - Productivity Voice Cues
    
    func speakProductivityStepName(_ stepName: String) {
        guard isVoiceEnabled && isAudioEnabled else { return }
        
        let productivityPhrases = [
            "Starting: \(stepName)",
            "Focus time: \(stepName)",
            "Let's tackle: \(stepName)",
            "Time to ship: \(stepName)",
            "Deep work: \(stepName)"
        ]
        
        let phrase = productivityPhrases.randomElement() ?? "Starting: \(stepName)"
        let utterance = AVSpeechUtterance(string: phrase)
        utterance.voice = resolveSelectedVoice()
        utterance.rate = 0.5
        utterance.volume = volume
        utterance.pitchMultiplier = 1.0
        
        speechSynthesizer.speak(utterance)
    }
    
    func speakProductivityCountdown(_ seconds: Int) {
        guard isVoiceEnabled && isAudioEnabled else { return }
        
        let utterance = AVSpeechUtterance(string: "\(seconds)")
        utterance.voice = resolveSelectedVoice()
        utterance.rate = 0.6
        utterance.volume = volume
        utterance.pitchMultiplier = 1.2
        
        speechSynthesizer.speak(utterance)
    }
    
    func speakProductivityComplete() {
        guard isVoiceEnabled && isAudioEnabled else { return }
        
        let completionPhrases = [
            "Task complete!",
            "Ship it!",
            "Done and dusted!",
            "Progress made!",
            "Momentum building!",
            "Small win achieved!"
        ]
        
        let phrase = completionPhrases.randomElement() ?? "Task complete!"
        let utterance = AVSpeechUtterance(string: phrase)
        utterance.voice = resolveSelectedVoice()
        utterance.rate = 0.5
        utterance.volume = volume
        utterance.pitchMultiplier = 1.1
        
        speechSynthesizer.speak(utterance)
    }
    
    func speakProductivityRoutineComplete() {
        guard isVoiceEnabled && isAudioEnabled else { return }
        
        let routineCompletePhrases = [
            "Session complete! You're crushing it!",
            "Flow state achieved! Great work!",
            "Productivity unlocked! Well done!",
            "Momentum maintained! Excellent!",
            "Focus session complete! You're unstoppable!",
            "Deep work accomplished! Keep shipping!"
        ]
        
        let phrase = routineCompletePhrases.randomElement() ?? "Session complete! Great work!"
        let utterance = AVSpeechUtterance(string: phrase)
        utterance.voice = resolveSelectedVoice()
        utterance.rate = 0.4
        utterance.volume = volume
        utterance.pitchMultiplier = 1.1
        
        speechSynthesizer.speak(utterance)
    }
    
    func playPreviewSound(for packId: String) {
        guard isAudioEnabled else { return }
        
        // Temporarily set the sound pack to preview it
        let originalPack = selectedSoundPackId
        selectedSoundPackId = packId
        
        // Play the step change sound for this pack
        playStepChangeSound()
        
        // Restore the original pack
        selectedSoundPackId = originalPack
    }

    func speakPreview() {
        guard isAudioEnabled && isVoiceEnabled else { return }
        let utterance = AVSpeechUtterance(string: "This is your selected voice.")
        utterance.voice = resolveSelectedVoice()
        utterance.rate = 0.5
        utterance.volume = volume
        utterance.pitchMultiplier = 1.0
        speechSynthesizer.speak(utterance)
    }

    func getAvailableVoices(languagePrefix: String? = nil) -> [AVSpeechSynthesisVoice] {
        let voices = AVSpeechSynthesisVoice.speechVoices()
        let filtered = languagePrefix != nil ? voices.filter { $0.language.hasPrefix(languagePrefix!) } : voices
        return filtered.sorted { $0.name < $1.name }
    }

    func setVoiceIdentifier(_ identifier: String?) {
        selectedVoiceIdentifier = identifier
        saveSettings()
    }

    private func resolveSelectedVoice() -> AVSpeechSynthesisVoice? {
        if let id = selectedVoiceIdentifier, let v = AVSpeechSynthesisVoice(identifier: id) {
            return v
        }
        return AVSpeechSynthesisVoice(language: "en-US")
    }
    
    // MARK: - Settings Management
    
    func toggleAudio() {
        isAudioEnabled.toggle()
        saveSettings()
    }
    
    func toggleVoice() {
        isVoiceEnabled.toggle()
        saveSettings()
    }
    

    
    func setVolume(_ newVolume: Float) {
        volume = max(0.0, min(1.0, newVolume))
        saveSettings()
    }
    
    private func loadSettings() {
        isAudioEnabled = userDefaults.bool(forKey: "isAudioEnabled")
        isVoiceEnabled = userDefaults.bool(forKey: "isVoiceEnabled")
        volume = userDefaults.float(forKey: "audioVolume")
        selectedVoiceIdentifier = userDefaults.string(forKey: "voiceIdentifier")
        selectedSoundPackId = userDefaults.string(forKey: "soundPackId") ?? "default"
        
        // Set defaults if not previously set
        if userDefaults.object(forKey: "isAudioEnabled") == nil {
            isAudioEnabled = true
        }
        if userDefaults.object(forKey: "isVoiceEnabled") == nil {
            isVoiceEnabled = false
        }
        if userDefaults.object(forKey: "audioVolume") == nil {
            volume = 0.7
        }
        // If no voice selected, leave nil to use system default (en-US)
    }
    
    private func saveSettings() {
        userDefaults.set(isAudioEnabled, forKey: "isAudioEnabled")
        userDefaults.set(isVoiceEnabled, forKey: "isVoiceEnabled")
        userDefaults.set(volume, forKey: "audioVolume")
        userDefaults.set(selectedVoiceIdentifier, forKey: "voiceIdentifier")
        userDefaults.set(selectedSoundPackId, forKey: "soundPackId")
    }
    
    // MARK: - Cleanup
    
    func stopAllAudio() {
        speechSynthesizer.stopSpeaking(at: .immediate)
        audioPlayer?.stop()
    }
    
    deinit {
        // Don't call stopAllAudio in deinit as it can cause retain cycles
        // The speechSynthesizer and audioPlayer will be deallocated automatically
    }
}
