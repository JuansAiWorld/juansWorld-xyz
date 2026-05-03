import Foundation
import SwiftUI

// MARK: - Core Models

struct Routine: Identifiable, Codable {
    let id: UUID
    var name: String
    var steps: [RoutineItem]
    var totalDuration: TimeInterval {
        steps.reduce(0) { $0 + $1.duration }
    }
    
    init(name: String, steps: [RoutineItem] = []) {
        self.id = UUID()
        self.name = name
        self.steps = steps
    }
    
    init(id: UUID, name: String, steps: [RoutineItem] = []) {
        self.id = id
        self.name = name
        self.steps = steps
    }
}

enum RoutineItem: Identifiable, Codable {
    case step(Step)
    case group(Group)
    
    var id: UUID {
        switch self {
        case .step(let step):
            return step.id
        case .group(let group):
            return group.id
        }
    }
    
    var duration: TimeInterval {
        switch self {
        case .step(let step):
            return step.duration
        case .group(let group):
            return group.totalDuration
        }
    }
    
    var displayName: String {
        switch self {
        case .step(let step):
            return step.name
        case .group(let group):
            return group.name
        }
    }
}

struct Step: Identifiable, Codable, Equatable {
    let id: UUID
    var name: String
    var duration: TimeInterval
    var color: StepColor
    
    init(name: String, duration: TimeInterval, color: StepColor = .blue) {
        self.id = UUID()
        self.name = name
        self.duration = duration
        self.color = color
    }
    
    init(id: UUID, name: String, duration: TimeInterval, color: StepColor = .blue) {
        self.id = id
        self.name = name
        self.duration = duration
        self.color = color
    }
}

struct Group: Identifiable, Codable, Equatable {
    let id: UUID
    var name: String
    var steps: [Step]
    var loopCount: Int
    var color: StepColor
    
    var totalDuration: TimeInterval {
        steps.reduce(0) { $0 + $1.duration } * TimeInterval(loopCount)
    }
    
    init(name: String, steps: [Step] = [], loopCount: Int = 1, color: StepColor = .purple) {
        self.id = UUID()
        self.name = name
        self.steps = steps
        self.loopCount = loopCount
        self.color = color
    }
    
    init(id: UUID, name: String, steps: [Step] = [], loopCount: Int = 1, color: StepColor = .purple) {
        self.id = id
        self.name = name
        self.steps = steps
        self.loopCount = loopCount
        self.color = color
    }
}

// MARK: - Enums

enum StepColor: String, CaseIterable, Codable {
    case red, orange, yellow, green, blue, purple, pink, gray, black
    
    var color: Color {
        switch self {
        case .red: return .red
        case .orange: return .orange
        case .yellow: return .yellow
        case .green: return .green
        case .blue: return .blue
        case .purple: return .purple
        case .pink: return .pink
        case .gray: return .gray
        case .black: return .black
        }
    }
    
    var displayName: String {
        rawValue.capitalized
    }
}

enum TimerState {
    case idle
    case running
    case paused
    case completed
}

// MARK: - Stats Models

struct CompletedRoutine: Identifiable, Codable {
    let id: UUID
    let routineName: String
    let totalDuration: TimeInterval
    let completedAt: Date
    
    init(routineName: String, totalDuration: TimeInterval, completedAt: Date) {
        self.id = UUID()
        self.routineName = routineName
        self.totalDuration = totalDuration
        self.completedAt = completedAt
    }
}

// MARK: - Timer Models

struct TimerStep: Equatable {
    let step: Step
    let remainingTime: TimeInterval
    let isActive: Bool
    let stepIndex: Int
    let totalSteps: Int
}

struct TimerProgress {
    let currentStep: TimerStep?
    let nextStep: TimerStep?
    let overallProgress: Double
    let stepProgress: Double
    let totalElapsed: TimeInterval
    let totalRemaining: TimeInterval
}
