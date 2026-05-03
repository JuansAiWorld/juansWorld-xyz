import Foundation
import Combine

@MainActor
class TimerManager: ObservableObject {
    @Published var state: TimerState = .idle
    @Published var currentStep: TimerStep?
    @Published var nextStep: TimerStep?
    @Published var timeRemaining: TimeInterval = 0
    @Published var overallProgress: Double = 0
    @Published var stepProgress: Double = 0
    
    private var timer: Timer?
    private var routine: Routine?
    private var currentStepIndex = 0
    private var currentGroupIndex = 0
    private var currentLoopIndex = 0
    private var totalElapsed: TimeInterval = 0
    private var totalDuration: TimeInterval = 0
    
    private var flattenedSteps: [Step] = []
    private var stepStartTimes: [TimeInterval] = []
    
    // Computed properties to ensure progress values are always valid
    var safeStepProgress: Double {
        return stepProgress.isNaN || stepProgress.isInfinite ? 0 : max(0, min(1, stepProgress))
    }
    
    var safeOverallProgress: Double {
        return overallProgress.isNaN || overallProgress.isInfinite ? 0 : max(0, min(1, overallProgress))
    }
    
    // MARK: - Public Methods
    
    func startRoutine(_ routine: Routine) {
        self.routine = routine
        self.totalDuration = max(0, routine.totalDuration) // Ensure totalDuration is never negative
        self.flattenedSteps = flattenRoutine(routine)
        self.stepStartTimes = calculateStepStartTimes()
        
        // Check if we have valid steps before proceeding
        guard !flattenedSteps.isEmpty else {
            print("TimerManager: No valid steps found in routine")
            return
        }
        
        // Validate that all steps have positive durations
        let invalidSteps = flattenedSteps.filter { $0.duration <= 0 }
        guard invalidSteps.isEmpty else {
            print("TimerManager: Found steps with invalid durations: \(invalidSteps)")
            return
        }
        
        resetToBeginning()
        
        // Initialize the first step before starting the timer
        updateCurrentStep()
        startTimer()
    }
    
    func stopRoutine() {
        stopTimer()
        resetToBeginning()
    }
    
    func togglePlayPause() {
        switch state {
        case .running:
            pauseTimer()
        case .paused:
            resumeTimer()
        default:
            break
        }
    }
    
    func skipForward() {
        moveToNextStep()
    }
    
    func skipBackward() {
        moveToPreviousStep()
    }
    
    func resetRoutine() {
        resetToBeginning()
    }
    
    // MARK: - Private Timer Methods
    
    private func startTimer() {
        state = .running
        timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.updateTimer()
            }
        }
    }
    
    private func stopTimer() {
        timer?.invalidate()
        timer = nil
        state = .idle
    }
    
    private func pauseTimer() {
        timer?.invalidate()
        timer = nil
        state = .paused
    }
    
    private func resumeTimer() {
        startTimer()
    }
    
    private func updateTimer() {
        guard let currentStep = currentStep else { return }
        guard currentStep.step.duration > 0 else { return }
        
        timeRemaining -= 0.1
        totalElapsed += 0.1
        
        // Ensure timeRemaining doesn't go below 0
        if timeRemaining < 0 {
            timeRemaining = 0
        }
        
        // Update step progress with safety checks
        let stepElapsed = currentStep.step.duration - timeRemaining
        if currentStep.step.duration > 0 && stepElapsed >= 0 {
            stepProgress = max(0, min(1, stepElapsed / currentStep.step.duration))
        } else {
            stepProgress = 0
        }
        
        // Update overall progress with safety checks
        if totalDuration > 0 && totalElapsed >= 0 {
            overallProgress = max(0, min(1, totalElapsed / totalDuration))
        } else {
            overallProgress = 0
        }
        
        // Check if current step is complete
        if timeRemaining <= 0 {
            moveToNextStep()
        }
    }
    
    // MARK: - Step Navigation
    
    private func moveToNextStep() {
        currentStepIndex += 1
        
        if currentStepIndex >= flattenedSteps.count {
            // Routine completed
            completeRoutine()
        } else {
            // Move to next step
            updateCurrentStep()
        }
    }
    
    private func moveToPreviousStep() {
        currentStepIndex = max(0, currentStepIndex - 1)
        updateCurrentStep()
    }
    
    private func updateCurrentStep() {
        guard currentStepIndex < flattenedSteps.count else { return }
        
        let step = flattenedSteps[currentStepIndex]
        timeRemaining = max(0, step.duration) // Ensure timeRemaining is never negative
        
        // Update current step
        currentStep = TimerStep(
            step: step,
            remainingTime: timeRemaining,
            isActive: true,
            stepIndex: currentStepIndex,
            totalSteps: flattenedSteps.count
        )
        
        // Update next step
        if currentStepIndex + 1 < flattenedSteps.count {
            let nextStep = flattenedSteps[currentStepIndex + 1]
            self.nextStep = TimerStep(
                step: nextStep,
                remainingTime: max(0, nextStep.duration), // Ensure remainingTime is never negative
                isActive: false,
                stepIndex: currentStepIndex + 1,
                totalSteps: flattenedSteps.count
            )
        } else {
            self.nextStep = nil
        }
        
        // Reset step progress
        stepProgress = 0
        overallProgress = 0
    }
    
    private func resetToBeginning() {
        currentStepIndex = 0
        currentGroupIndex = 0
        currentLoopIndex = 0
        totalElapsed = 0
        timeRemaining = 0
        overallProgress = 0
        stepProgress = 0
        currentStep = nil
        nextStep = nil
        state = .idle
    }
    
    private func completeRoutine() {
        stopTimer()
        state = .completed
        currentStep = nil
        nextStep = nil
        overallProgress = 1.0
        
        // Record the completed routine for stats tracking
        if let routine = routine {
            // We'll inject the RoutineManager dependency later
            NotificationCenter.default.post(
                name: NSNotification.Name("RoutineCompleted"),
                object: nil,
                userInfo: [
                    "routine": routine,
                    "totalDuration": totalDuration
                ]
            )
        }
        stepProgress = 1.0
    }
    
    // MARK: - Helper Methods
    
    private func flattenRoutine(_ routine: Routine) -> [Step] {
        var steps: [Step] = []
        
        for item in routine.steps {
            switch item {
            case .step(let step):
                if step.duration > 0 {
                    steps.append(step)
                }
            case .group(let group):
                for _ in 0..<group.loopCount {
                    for step in group.steps {
                        if step.duration > 0 {
                            steps.append(step)
                        }
                    }
                }
            }
        }
        
        return steps
    }
    
    private func calculateStepStartTimes() -> [TimeInterval] {
        var startTimes: [TimeInterval] = []
        var currentTime: TimeInterval = 0
        
        for step in flattenedSteps {
            startTimes.append(currentTime)
            currentTime += step.duration
        }
        
        return startTimes
    }
    
    // MARK: - Computed Properties
    
    var isRunning: Bool {
        state == .running
    }
    
    var isPaused: Bool {
        state == .paused
    }
    
    var isCompleted: Bool {
        state == .completed
    }
    
    var currentStepName: String? {
        currentStep?.step.name
    }
    
    var nextStepName: String? {
        nextStep?.step.name
    }
    
    var currentStepColor: StepColor? {
        currentStep?.step.color
    }
}
