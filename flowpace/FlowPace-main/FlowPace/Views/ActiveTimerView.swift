import SwiftUI

struct ActiveTimerView: View {
    let routine: Routine
    @StateObject private var timerManager = TimerManager()
    @EnvironmentObject var audioManager: AudioManager
    @EnvironmentObject var storeKitManager: StoreKitManager
    @StateObject private var hapticManager = HapticManager()
    @EnvironmentObject var backgroundColorManager: BackgroundColorManager
    @Environment(\.dismiss) private var dismiss
    
    // Voice cue state to avoid repeated announcements per second/step
    @State private var lastAnnouncedSecond: Int? = nil
    @State private var didAnnounceStepComplete: Bool = false
    @State private var currentStepDuration: TimeInterval = 0
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Dynamic gradient background based on current step color
                LinearGradient(
                    gradient: Gradient(colors: stepBackgroundColors),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                // Animate background only when the step identity changes to avoid jarring effects
                .animation(.easeInOut(duration: 0.5), value: timerManager.currentStep?.step.id)
                
                VStack(spacing: 0) {
                    Spacer()
                    
                    // Show completion screen when timer is completed
                    if timerManager.state == .completed {
                        ZStack {
                            // Animated background with user's selected color
                            backgroundColorManager.backgroundGradient
                            .ignoresSafeArea()
                            .animation(.easeInOut(duration: 3.0).repeatForever(autoreverses: true), value: timerManager.state)
                            

                            
                            // Main content
                            VStack(spacing: 0) {
                                Spacer()
                                
                                // Central celebration content
                                VStack(spacing: 30) {
                                    // Main celebration icon with liquid glass animation
                                    ZStack {
                                        // Outer liquid glass ring
                                        Circle()
                                            .frame(width: 140, height: 140)
                                            .background(
                                                Circle()
                                                    .fill(.ultraThinMaterial)
                                                    .opacity(0.3)
                                                    .overlay(
                                                        Circle()
                                                            .stroke(
                                                                LinearGradient(
                                                                    colors: [
                                                                        Color.white.opacity(0.3),
                                                                        Color.white.opacity(0.1)
                                                                    ],
                                                                    startPoint: .topLeading,
                                                                    endPoint: .bottomTrailing
                                                                ),
                                                                lineWidth: 2
                                                            )
                                                    )
                                            )
                                            .scaleEffect(1.0)
                                            .animation(.easeInOut(duration: 2.0).repeatForever(autoreverses: true), value: timerManager.state)
                                        
                                        // Inner celebration icon
                                        Image(systemName: "trophy.fill")
                                            .font(.system(size: 80, weight: .light))
                                            .foregroundColor(.white)
                                            .shadow(color: .black.opacity(0.3), radius: 10, x: 0, y: 5)
                                    }
                                    
                                    // Celebration text
                                    VStack(spacing: 16) {
                                        Text("AMAZING!")
                                            .font(.system(size: 42, weight: .black, design: .rounded))
                                            .foregroundColor(.white)
                                            .shadow(color: .black.opacity(0.3), radius: 5, x: 0, y: 2)
                                        
                                        Text("You've completed")
                                            .font(.title2)
                                            .foregroundColor(.white.opacity(0.9))
                                        
                                        Text(routine.name)
                                            .font(.system(size: 36, weight: .bold, design: .rounded))
                                            .foregroundColor(.white)
                                            .shadow(color: .black.opacity(0.3), radius: 3, x: 0, y: 1)
                                            .multilineTextAlignment(.center)
                                            .padding(.horizontal)
                                    }
                                    
                                    // Quick stats in a liquid glass card
                                    VStack(spacing: 20) {
                                        HStack(spacing: 25) {
                                            // Steps completed
                                            VStack(spacing: 8) {
                                                Text("\(routine.steps.count)")
                                                    .font(.system(size: 32, weight: .bold, design: .rounded))
                                                    .foregroundColor(.white)
                                                Text("Steps")
                                                    .font(.caption)
                                                    .foregroundColor(.white.opacity(0.8))
                                                    .fontWeight(.medium)
                                            }
                                            .frame(maxWidth: .infinity)
                                            .padding(.vertical, 16)
                                            .background(
                                                RoundedRectangle(cornerRadius: 16)
                                                    .fill(.ultraThinMaterial)
                                                    .opacity(0.3)
                                                    .overlay(
                                                        RoundedRectangle(cornerRadius: 16)
                                                            .stroke(
                                                                LinearGradient(
                                                                    colors: [
                                                                        Color.white.opacity(0.3),
                                                                        Color.white.opacity(0.1)
                                                                    ],
                                                                    startPoint: .topLeading,
                                                                    endPoint: .bottomTrailing
                                                                ),
                                                                lineWidth: 1
                                                            )
                                                    )
                                            )
                                            
                                            // Duration
                                            VStack(spacing: 8) {
                                                Text(formatTime(routine.totalDuration))
                                                    .font(.system(size: 32, weight: .bold, design: .rounded))
                                                    .foregroundColor(.white)
                                                Text("Duration")
                                                    .font(.caption)
                                                    .foregroundColor(.white.opacity(0.8))
                                                    .fontWeight(.medium)
                                            }
                                            .frame(maxWidth: .infinity)
                                            .padding(.vertical, 16)
                                            .background(
                                                RoundedRectangle(cornerRadius: 16)
                                                    .fill(.ultraThinMaterial)
                                                    .opacity(0.3)
                                                    .overlay(
                                                        RoundedRectangle(cornerRadius: 16)
                                                            .stroke(
                                                                LinearGradient(
                                                                    colors: [
                                                                        Color.white.opacity(0.3),
                                                                        Color.white.opacity(0.1)
                                                                    ],
                                                                    startPoint: .topLeading,
                                                                    endPoint: .bottomTrailing
                                                                ),
                                                                lineWidth: 1
                                                            )
                                                    )
                                            )
                                        }
                                    }
                                }
                                
                                Spacer()
                                
                                    // Action buttons in a liquid glass container
                                    VStack(spacing: 16) {
                                        // Post-workout conversion prompt for free users
                                        if !storeKitManager.isPro {
                                            VStack(spacing: 8) {
                                                Text("🎯 Enjoyed your workout?")
                                                    .font(.headline)
                                                    .foregroundColor(.white)
                                                
                                                Text("Unlock voice cues and unlimited routines with Pro!")
                                                    .font(.subheadline)
                                                    .foregroundColor(.white.opacity(0.9))
                                                    .multilineTextAlignment(.center)
                                                
                                                Button("Upgrade to Pro") {
                                                    // Navigate to settings for upgrade
                                                    dismiss()
                                                }
                                                .font(.subheadline)
                                                .fontWeight(.semibold)
                                                .foregroundColor(.blue)
                                                .padding(.horizontal, 20)
                                                .padding(.vertical, 8)
                                                .background(
                                                    Capsule()
                                                        .fill(.ultraThinMaterial)
                                                        .opacity(0.6)
                                                )
                                            }
                                            .padding(.vertical, 12)
                                            .padding(.horizontal, 16)
                                            .background(
                                                RoundedRectangle(cornerRadius: 16)
                                                    .fill(.ultraThinMaterial)
                                                    .opacity(0.3)
                                                    .overlay(
                                                        RoundedRectangle(cornerRadius: 16)
                                                            .stroke(
                                                                LinearGradient(
                                                                    colors: [
                                                                        Color.blue.opacity(0.3),
                                                                        Color.purple.opacity(0.3)
                                                                    ],
                                                                    startPoint: .topLeading,
                                                                    endPoint: .bottomTrailing
                                                                ),
                                                                lineWidth: 1
                                                            )
                                                    )
                                            )
                                        }
                                        
                                        // Primary action - Restart
                                    Button(action: {
                                        timerManager.resetRoutine()
                                        timerManager.startRoutine(routine)
                                    }) {
                                        HStack(spacing: 12) {
                                            Image(systemName: "arrow.clockwise")
                                                .font(.title2)
                                            Text("Do It Again!")
                                                .font(.title2)
                                                .fontWeight(.bold)
                                        }
                                        .foregroundColor(.blue)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 18)
                                        .background(
                                            RoundedRectangle(cornerRadius: 20)
                                                .fill(.ultraThinMaterial)
                                                .opacity(0.6)
                                                .overlay(
                                                    RoundedRectangle(cornerRadius: 20)
                                                        .stroke(
                                                            LinearGradient(
                                                                colors: [
                                                                    Color.white.opacity(0.3),
                                                                    Color.white.opacity(0.1)
                                                                ],
                                                                startPoint: .topLeading,
                                                                endPoint: .bottomTrailing
                                                            ),
                                                            lineWidth: 1
                                                        )
                                                )
                                        )
                                        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
                                    }
                                    
                                    // Secondary actions row
                                    HStack(spacing: 12) {
                                        // Edit button
                                        Button(action: {
                                            // TODO: Navigate to routine editor
                                            dismiss()
                                        }) {
                                            HStack(spacing: 8) {
                                                Image(systemName: "pencil")
                                                Text("Edit")
                                            }
                                            .font(.headline)
                                            .foregroundColor(.white)
                                            .frame(maxWidth: .infinity)
                                            .padding(.vertical, 14)
                                            .background(
                                                RoundedRectangle(cornerRadius: 16)
                                                    .fill(Color.white.opacity(0.2))
                                                    .overlay(
                                                        RoundedRectangle(cornerRadius: 16)
                                                            .stroke(Color.white.opacity(0.3), lineWidth: 1)
                                                    )
                                            )
                                        }
                                        
                                        // Share button
                                        Button(action: {
                                            // TODO: Share achievement
                                        }) {
                                            HStack(spacing: 8) {
                                                Image(systemName: "square.and.arrow.up")
                                                Text("Share")
                                            }
                                            .font(.headline)
                                            .foregroundColor(.white)
                                            .frame(maxWidth: .infinity)
                                            .padding(.vertical, 14)
                                            .background(
                                                RoundedRectangle(cornerRadius: 16)
                                                    .fill(Color.white.opacity(0.2))
                                                    .overlay(
                                                        RoundedRectangle(cornerRadius: 16)
                                                            .stroke(Color.white.opacity(0.3), lineWidth: 1)
                                                    )
                                            )
                                        }
                                    }
                                    
                                    // Home button
                                    Button(action: { dismiss() }) {
                                        HStack(spacing: 8) {
                                            Image(systemName: "house.fill")
                                            Text("Back to Home")
                                        }
                                        .font(.headline)
                                        .foregroundColor(.white.opacity(0.8))
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 14)
                                        .background(
                                            RoundedRectangle(cornerRadius: 16)
                                                .fill(Color.white.opacity(0.1))
                                                .overlay(
                                                    RoundedRectangle(cornerRadius: 16)
                                                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                                                )
                                        )
                                    }
                                }
                                .padding(.horizontal, 24)
                                .padding(.bottom, 80)
                            }
                        }
                    } else {
                        // Main timer display with consistent layout
                        VStack(spacing: 0) {
                            // Fixed top section - Current step name
                            VStack(spacing: 12) {
                                if let currentStep = timerManager.currentStep {
                                    Text("CURRENT STEP")
                                        .font(.system(size: 14, weight: .semibold, design: .rounded))
                                        .foregroundColor(.white.opacity(0.7))
                                        .tracking(1.5)
                                    
                                    Text(currentStep.step.name.uppercased())
                                        .font(.system(size: 32, weight: .bold, design: .rounded))
                                        .foregroundColor(.white)
                                        .multilineTextAlignment(.center)
                                        .lineLimit(2)
                                        .minimumScaleFactor(0.8)
                                        .shadow(color: .black.opacity(0.2), radius: 3, x: 0, y: 2)
                                }
                            }
                            .frame(height: 100) // Fixed height to maintain consistency
                            .padding(.horizontal, 24)
                            .padding(.top, 40)
                        
                            // Fixed middle section - Timer countdown
                            ZStack {
                                // Outer glow ring
                                Circle()
                                    .fill(Color.white.opacity(0.1))
                                    .frame(width: 320, height: 320)
                                
                                // Circular progress background
                                Circle()
                                    .stroke(Color.white.opacity(0.2), lineWidth: 12)
                                    .frame(width: 280, height: 280)
                                
                                // Circular progress
                                if timerManager.currentStep != nil {
                                    Circle()
                                        .trim(from: 0, to: timerManager.safeStepProgress)
                                        .stroke(
                                            LinearGradient(
                                                gradient: Gradient(colors: [Color.white, Color.white.opacity(0.8)]),
                                                startPoint: .topLeading,
                                                endPoint: .bottomTrailing
                                            ),
                                            style: StrokeStyle(lineWidth: 12, lineCap: .round)
                                        )
                                        .frame(width: 280, height: 280)
                                        .rotationEffect(.degrees(-90))
                                        // Reset the ring identity when the step changes so it doesn't animate backwards from 1 -> 0
                                        .id(timerManager.currentStep?.step.id)
                                        // Smooth per-tick progress within a step
                                        .animation(.linear(duration: 0.25), value: timerManager.safeStepProgress)
                                        .shadow(color: .white.opacity(0.3), radius: 10, x: 0, y: 0)
                                }
                                
                                // Time remaining with enhanced styling
                                VStack(spacing: 12) {
                                    Text(formatTime(timerManager.timeRemaining))
                                        .font(.system(size: 76, weight: .black, design: .rounded))
                                        .foregroundColor(.white)
                                        .monospacedDigit()
                                        .shadow(color: .black.opacity(0.3), radius: 5, x: 0, y: 3)
                                    
                                    Text("REMAINING")
                                        .font(.system(size: 16, weight: .semibold, design: .rounded))
                                        .foregroundColor(.white.opacity(0.8))
                                        .tracking(1.0)
                                }
                            }
                            .padding(.horizontal, 20)
                            .padding(.vertical, 40)
                            
                            // Add more spacing before next step box
                            Spacer()
                                .frame(height: 20)
                            
                            // Fixed bottom section - Next step (with consistent height)
                            VStack(spacing: 8) {
                                if let nextStep = timerManager.nextStep {
                                    Text("NEXT STEP")
                                        .font(.system(size: 12, weight: .semibold, design: .rounded))
                                        .foregroundColor(.white.opacity(0.7))
                                        .tracking(1.0)
                                    
                                    Text(nextStep.step.name.uppercased())
                                        .font(.system(size: 16, weight: .bold, design: .rounded))
                                        .foregroundColor(.white)
                                        .multilineTextAlignment(.center)
                                        .lineLimit(2)
                                        .minimumScaleFactor(0.8)
                                } else {
                                    // Invisible placeholder to maintain consistent spacing
                                    Text("NEXT STEP")
                                        .font(.system(size: 12, weight: .semibold, design: .rounded))
                                        .foregroundColor(.clear)
                                        .tracking(1.0)
                                    
                                    Text("PLACEHOLDER")
                                        .font(.system(size: 16, weight: .bold, design: .rounded))
                                        .foregroundColor(.clear)
                                        .multilineTextAlignment(.center)
                                        .lineLimit(2)
                                        .minimumScaleFactor(0.8)
                                }
                            }
                            .frame(height: 70) // Reduced height for better spacing
                            .padding(.vertical, 16)
                            .padding(.horizontal, 20)
                            .background(
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(timerManager.nextStep != nil ? Color.white.opacity(0.15) : Color.clear)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 16)
                                            .stroke(timerManager.nextStep != nil ? Color.white.opacity(0.3) : Color.clear, lineWidth: 1)
                                    )
                            )
                            .shadow(color: timerManager.nextStep != nil ? .black.opacity(0.1) : .clear, radius: 6, x: 0, y: 3)
                        }
                    }
                    
                    Spacer()
                        .frame(height: 30)
                    
                    // Control buttons with enhanced styling
                    HStack(spacing: 32) {
                        // Skip backward
                        Button(action: timerManager.skipBackward) {
                            ZStack {
                                Circle()
                                    .fill(Color.white.opacity(0.15))
                                    .frame(width: 60, height: 60)
                                
                                Image(systemName: "backward.fill")
                                    .font(.title2)
                                    .foregroundColor(.white)
                            }
                        }
                        .disabled(timerManager.state == .idle)
                        .opacity(timerManager.state == .idle ? 0.5 : 1.0)
                        
                        // Play/Pause
                        Button(action: timerManager.togglePlayPause) {
                            ZStack {
                                Circle()
                                    .fill(
                                        LinearGradient(
                                            gradient: Gradient(colors: [Color.white.opacity(0.3), Color.white.opacity(0.2)]),
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .frame(width: 80, height: 80)
                                    .shadow(color: .black.opacity(0.2), radius: 10, x: 0, y: 5)
                                
                                Image(systemName: timerManager.state == .running ? "pause.fill" : "play.fill")
                                    .font(.system(size: 36, weight: .bold))
                                    .foregroundColor(.white)
                            }
                        }
                        .disabled(timerManager.state == .completed)
                        
                        // Skip forward
                        Button(action: timerManager.skipForward) {
                            ZStack {
                                Circle()
                                    .fill(Color.white.opacity(0.15))
                                    .frame(width: 60, height: 60)
                                
                                Image(systemName: "forward.fill")
                                    .font(.title2)
                                    .foregroundColor(.white)
                            }
                        }
                        .disabled(timerManager.state == .completed)
                        .opacity(timerManager.state == .completed ? 0.5 : 1.0)
                    }
                    .padding(.bottom, 40)
                }
            }
        }
        .onAppear {
            timerManager.startRoutine(routine)
            audioManager.prepareAudio()
        }
        .onDisappear {
            timerManager.stopRoutine()
        }
        .onChange(of: timerManager.state) { _, newState in
            handleTimerStateChange(newState)
        }
        .onChange(of: timerManager.currentStep) { _, step in
            if let step = step {
                handleStepChange(step)
            }
        }
        .onChange(of: timerManager.timeRemaining) { _, timeRemaining in
            handleCountdown(timeRemaining)
        }
    }
    
    private var stepBackgroundColors: [Color] {
        guard let currentStep = timerManager.currentStep else {
            // Use the user's selected background color when no step is active
            return backgroundColorManager.defaultStepBackgroundColors
        }
        
        // Use the BackgroundColorManager to get professional gradients for step colors
        return backgroundColorManager.stepBackgroundColors(for: currentStep.step.color)
    }
    
    private func backgroundColor(for color: StepColor) -> Color {
        color.color.opacity(0.9)
    }
    
    private func formatTime(_ time: TimeInterval) -> String {
        let minutes = Int(time) / 60
        let seconds = Int(time) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }
    
    private func handleTimerStateChange(_ state: TimerState) {
        switch state {
        case .running:
            hapticManager.playStartHaptic()
        case .paused:
            hapticManager.playPauseHaptic()
        case .completed:
            hapticManager.playCompletionHaptic()
            audioManager.playCompletionSound()
            audioManager.speakProductivityRoutineComplete()
        default:
            break
        }
    }
    
    private func handleStepChange(_ step: TimerStep) {
        hapticManager.playStepChangeHaptic()
        audioManager.playStepChangeSound()
        
        // Voice cue for step change
        audioManager.speakStepName(step.step.name)
        
        // Reset voice cue state for the new step
        lastAnnouncedSecond = nil
        didAnnounceStepComplete = false
        currentStepDuration = step.step.duration
    }
    
    private func handleCountdown(_ timeRemaining: TimeInterval) {
        let seconds = Int(ceil(timeRemaining))
        
        // Adaptive countdown for short steps:
        // - For steps 4-5s: announce "2...1" (2 and 1)
        // - For steps 3s or less: only announce "1" 
        // - For steps 6s+: announce standard 3,2,1
        if seconds > 0 {
            if currentStepDuration <= 3 {
                // Very short steps: only announce "1"
                if seconds == 1 && lastAnnouncedSecond != seconds {
                    lastAnnouncedSecond = seconds
                    audioManager.speakCountdown(seconds)
                }
            } else if currentStepDuration <= 5 {
                // Short steps: announce "2...1"
                if (seconds == 2 || seconds == 1) && lastAnnouncedSecond != seconds {
                    lastAnnouncedSecond = seconds
                    audioManager.speakCountdown(seconds)
                }
            } else {
                // Normal steps: announce "3,2,1"
                if seconds <= 3 && lastAnnouncedSecond != seconds {
                    lastAnnouncedSecond = seconds
                    audioManager.speakCountdown(seconds)
                }
            }
        }
        
        // Announce step completion when time reaches 0
        if timeRemaining <= 0 && timerManager.isRunning {
            if !didAnnounceStepComplete {
                didAnnounceStepComplete = true
                audioManager.speakStepComplete()
            }
        }
    }
}

#Preview {
    ActiveTimerView(routine: Routine(name: "Sample Routine", steps: [
        .step(Step(name: "Work", duration: 30, color: .blue)),
        .step(Step(name: "Rest", duration: 10, color: .green))
    ]))
    .environmentObject(StoreKitManager())
    .environmentObject(AudioManager())
    .environmentObject(BackgroundColorManager())
}
