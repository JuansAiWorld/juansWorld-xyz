import Foundation
import SwiftUI

@MainActor
class RoutineManager: ObservableObject {
    @Published var routines: [Routine] = []
    @Published var completedRoutines: [CompletedRoutine] = []
    
    private let userDefaults = UserDefaults.standard
    private let routinesKey = "savedRoutines"
    private let completedRoutinesKey = "completedRoutines"
    
    // Reference to StoreKitManager to check premium status
    weak var storeKitManager: StoreKitManager?
    
    // Reference to CloudKitManager for Pro sync feature
    weak var cloudKitManager: CloudKitManager?
    
    // Free version limit
    private let freeRoutineLimit = 3
    
    init() {
        loadRoutines()
        loadCompletedRoutines()
        setupNotificationObserver()
    }
    
    private func setupNotificationObserver() {
        NotificationCenter.default.addObserver(
            forName: NSNotification.Name("RoutineCompleted"),
            object: nil,
            queue: .main
        ) { [weak self] notification in
            guard let self = self,
                  let userInfo = notification.userInfo,
                  let routine = userInfo["routine"] as? Routine,
                  let totalDuration = userInfo["totalDuration"] as? TimeInterval else { return }
            
            Task { @MainActor in
                self.recordCompletedRoutine(routine, totalDuration: totalDuration)
            }
        }
    }
    
    // MARK: - CRUD Operations
    
    func addRoutine(_ routine: Routine) {
        // Check if user can add more routines (premium check)
        guard canAddRoutine() else {
            print("Cannot add routine: Free users limited to \(freeRoutineLimit) routines")
            return
        }
        
        routines.append(routine)
        saveRoutines()
        
        // Sync to iCloud if Pro user
        if storeKitManager?.isPro == true {
            cloudKitManager?.syncRoutines(routines) { _ in }
        }
    }
    
    func canAddRoutine() -> Bool {
        // Premium users can add unlimited routines
        if storeKitManager?.isPro == true {
            return true
        }
        
        // Free users limited to 3 routines
        return routines.count < freeRoutineLimit
    }
    
    func getRoutineLimit() -> Int {
        return storeKitManager?.isPro == true ? Int.max : freeRoutineLimit
    }
    
    func updateRoutine(_ routine: Routine) {
        if let index = routines.firstIndex(where: { $0.id == routine.id }) {
            routines[index] = routine
            saveRoutines()
            
            // Sync to iCloud if Pro user
            if storeKitManager?.isPro == true {
                cloudKitManager?.syncRoutines(routines) { _ in }
            }
        }
    }
    
    func deleteRoutine(_ routine: Routine) {
        routines.removeAll { $0.id == routine.id }
        saveRoutines()
        
        // Sync to iCloud if Pro user
        if storeKitManager?.isPro == true {
            cloudKitManager?.deleteRoutine(routine.id) { _ in }
            cloudKitManager?.syncRoutines(routines) { _ in }
        }
    }
    
    func deleteRoutines(at offsets: IndexSet) {
        routines.remove(atOffsets: offsets)
        saveRoutines()
    }
    
    func moveRoutines(from source: IndexSet, to destination: Int) {
        routines.move(fromOffsets: source, toOffset: destination)
        saveRoutines()
    }
    
    func duplicateRoutine(_ routine: Routine) -> Routine {
        let duplicatedSteps = routine.steps.map { item in
            switch item {
            case .step(let step):
                return RoutineItem.step(Step(
                    name: step.name,
                    duration: step.duration,
                    color: step.color
                ))
            case .group(let group):
                let duplicatedGroupSteps = group.steps.map { step in
                    Step(
                        name: step.name,
                        duration: step.duration,
                        color: step.color
                    )
                }
                return RoutineItem.group(Group(
                    name: group.name,
                    steps: duplicatedGroupSteps,
                    loopCount: group.loopCount,
                    color: group.color
                ))
            }
        }
        
        let duplicatedRoutine = Routine(
            name: "\(routine.name) (Copy)",
            steps: duplicatedSteps
        )
        
        addRoutine(duplicatedRoutine)
        return duplicatedRoutine
    }
    
    // MARK: - Stats Tracking
    
    func recordCompletedRoutine(_ routine: Routine, totalDuration: TimeInterval) {
        let completedRoutine = CompletedRoutine(
            routineName: routine.name,
            totalDuration: totalDuration,
            completedAt: Date()
        )
        
        completedRoutines.append(completedRoutine)
        saveCompletedRoutines()
    }
    
    // MARK: - Persistence
    
    private func saveRoutines() {
        do {
            let data = try JSONEncoder().encode(routines)
            userDefaults.set(data, forKey: routinesKey)
        } catch {
            print("Failed to save routines: \(error)")
        }
    }
    
    private func loadRoutines() {
        guard let data = userDefaults.data(forKey: routinesKey) else { return }
        
        do {
            routines = try JSONDecoder().decode([Routine].self, from: data)
        } catch {
            print("Failed to load routines: \(error)")
            routines = []
        }
    }
    
    private func saveCompletedRoutines() {
        do {
            let data = try JSONEncoder().encode(completedRoutines)
            userDefaults.set(data, forKey: completedRoutinesKey)
        } catch {
            print("Failed to save completed routines: \(error)")
        }
    }
    
    private func loadCompletedRoutines() {
        guard let data = userDefaults.data(forKey: completedRoutinesKey) else { return }
        
        do {
            completedRoutines = try JSONDecoder().decode([CompletedRoutine].self, from: data)
        } catch {
            print("Failed to load completed routines: \(error)")
            completedRoutines = []
        }
    }
    
    // MARK: - Utility Methods
    
    func getRoutine(by id: UUID) -> Routine? {
        routines.first { $0.id == id }
    }
    
    func getRoutineCount() -> Int {
        routines.count
    }
    
    func hasRoutines() -> Bool {
        !routines.isEmpty
    }
    
    func clearAllRoutines() {
        routines.removeAll()
        saveRoutines()
    }
    
    // MARK: - Sample Data (for development)
    
    func createSampleRoutines() {
        let sampleRoutines = [
            Routine(name: "Quick HIIT", steps: [
                .step(Step(name: "Jumping Jacks", duration: 30, color: .red)),
                .step(Step(name: "Rest", duration: 15, color: .green)),
                .step(Step(name: "Burpees", duration: 30, color: .orange)),
                .step(Step(name: "Rest", duration: 15, color: .green)),
                .step(Step(name: "Mountain Climbers", duration: 30, color: .blue)),
                .step(Step(name: "Rest", duration: 15, color: .green))
            ]),
            
            Routine(name: "Study Pomodoro", steps: [
                .step(Step(name: "Focus", duration: 25 * 60, color: .blue)),
                .step(Step(name: "Short Break", duration: 5 * 60, color: .green)),
                .step(Step(name: "Focus", duration: 25 * 60, color: .blue)),
                .step(Step(name: "Short Break", duration: 5 * 60, color: .green)),
                .step(Step(name: "Focus", duration: 25 * 60, color: .blue)),
                .step(Step(name: "Long Break", duration: 15 * 60, color: .purple))
            ]),
            
            Routine(name: "Tabata Workout", steps: [
                .group(Group(name: "Tabata Round", steps: [
                    Step(name: "Work", duration: 20, color: .red),
                    Step(name: "Rest", duration: 10, color: .green)
                ], loopCount: 8, color: .purple))
            ])
        ]
        
        for routine in sampleRoutines {
            addRoutine(routine)
        }
    }
}
