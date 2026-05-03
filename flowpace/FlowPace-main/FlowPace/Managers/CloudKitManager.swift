import Foundation
import CloudKit

@MainActor
class CloudKitManager: ObservableObject {
    @Published var isSyncing = false
    @Published var lastSyncDate: Date?
    @Published var syncError: String?
    @Published var isCloudAvailable = false
    
    private let container: CKContainer
    private let privateDatabase: CKDatabase
    private let routineZoneID = CKRecordZone.ID(zoneName: "FlowPaceRoutines", ownerName: CKCurrentUserDefaultName)
    
    // Record type names
    private let routineRecordType = "Routine"
    private let stepRecordType = "Step"
    private let groupRecordType = "Group"
    
    init() {
        container = CKContainer.default()
        privateDatabase = container.privateDatabase
        checkCloudAvailability()
    }
    
    // MARK: - Cloud Availability
    
    func checkCloudAvailability() {
        container.accountStatus { [weak self] status, error in
            DispatchQueue.main.async {
                switch status {
                case .available:
                    self?.isCloudAvailable = true
                    self?.setupZone()
                case .noAccount:
                    self?.isCloudAvailable = false
                    self?.syncError = "No iCloud account found. Please sign in to iCloud in Settings."
                case .restricted:
                    self?.isCloudAvailable = false
                    self?.syncError = "iCloud access is restricted on this device."
                case .couldNotDetermine:
                    self?.isCloudAvailable = false
                    self?.syncError = "Unable to determine iCloud status."
                @unknown default:
                    self?.isCloudAvailable = false
                }
            }
        }
    }
    
    // MARK: - Zone Setup
    
    private func setupZone() {
        let zone = CKRecordZone(zoneID: routineZoneID)
        let modifyOperation = CKModifyRecordZonesOperation(recordZonesToSave: [zone], recordZoneIDsToDelete: nil)
        
        modifyOperation.modifyRecordZonesResultBlock = { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success:
                    print("CloudKit zone setup complete")
                case .failure(let error as CKError):
                    if error.code == .zoneNotFound || error.code == .userDeletedZone {
                        print("Zone will be created on first sync")
                    } else {
                        self?.syncError = "Zone setup failed: \(error.localizedDescription)"
                    }
                case .failure(let error):
                    self?.syncError = "Zone setup failed: \(error.localizedDescription)"
                }
            }
        }
        
        privateDatabase.add(modifyOperation)
    }
    
    // MARK: - Sync Routines
    
    func syncRoutines(_ routines: [Routine], completion: @escaping (Result<[Routine], Error>) -> Void) {
        guard isCloudAvailable else {
            completion(.failure(CloudKitError.notAvailable))
            return
        }
        
        isSyncing = true
        syncError = nil
        
        // First, fetch remote routines
        fetchRoutines { [weak self] result in
            guard let self = self else { return }
            
            switch result {
            case .success(let remoteRoutines):
                // Merge local and remote routines
                let mergedRoutines = self.mergeRoutines(local: routines, remote: remoteRoutines)
                
                // Save merged routines to CloudKit
                self.saveRoutines(mergedRoutines) { saveResult in
                    DispatchQueue.main.async {
                        self.isSyncing = false
                        
                        switch saveResult {
                        case .success:
                            self.lastSyncDate = Date()
                            completion(.success(mergedRoutines))
                        case .failure(let error):
                            self.syncError = error.localizedDescription
                            completion(.failure(error))
                        }
                    }
                }
                
            case .failure(let error):
                DispatchQueue.main.async {
                    self.isSyncing = false
                    self.syncError = error.localizedDescription
                    completion(.failure(error))
                }
            }
        }
    }
    
    // MARK: - Fetch Routines
    
    private func fetchRoutines(completion: @escaping (Result<[Routine], Error>) -> Void) {
        let query = CKQuery(recordType: routineRecordType, predicate: NSPredicate(value: true))
        query.sortDescriptors = [NSSortDescriptor(key: "modificationDate", ascending: false)]
        
        privateDatabase.fetch(withQuery: query, inZoneWith: routineZoneID, desiredKeys: nil, resultsLimit: CKQueryOperation.maximumResults) { [weak self] result in
            switch result {
            case .success(let (records, _)):
                let routines = self?.parseRoutines(from: records) ?? []
                completion(.success(routines))
            case .failure(let error):
                completion(.failure(error))
            }
        }
    }
    
    // MARK: - Save Routines
    
    private func saveRoutines(_ routines: [Routine], completion: @escaping (Result<Void, Error>) -> Void) {
        let records = routines.map { routineToRecord($0) }
        
        let modifyOperation = CKModifyRecordsOperation(recordsToSave: records, recordIDsToDelete: nil)
        modifyOperation.savePolicy = .changedKeys
        modifyOperation.qualityOfService = .userInitiated
        
        modifyOperation.modifyRecordsResultBlock = { result in
            switch result {
            case .success:
                completion(.success(()))
            case .failure(let error):
                completion(.failure(error))
            }
        }
        
        privateDatabase.add(modifyOperation)
    }
    
    // MARK: - Merge Logic
    
    private func mergeRoutines(local: [Routine], remote: [Routine]) -> [Routine] {
        var mergedDict: [UUID: Routine] = [:]
        
        // Add all local routines
        for routine in local {
            mergedDict[routine.id] = routine
        }
        
        // Merge remote routines (remote wins on conflict by ID)
        for routine in remote {
            if let existing = mergedDict[routine.id] {
                // Keep the one with more steps or newer modification
                if routine.steps.count >= existing.steps.count {
                    mergedDict[routine.id] = routine
                }
            } else {
                mergedDict[routine.id] = routine
            }
        }
        
        return Array(mergedDict.values).sorted { $0.name < $1.name }
    }
    
    // MARK: - Record Conversion
    
    private func routineToRecord(_ routine: Routine) -> CKRecord {
        let record = CKRecord(recordType: routineRecordType, recordID: CKRecord.ID(recordName: routine.id.uuidString, zoneID: routineZoneID))
        
        record["name"] = routine.name as NSString
        record["createdDate"] = Date() as NSDate
        record["stepCount"] = routine.steps.count as NSNumber
        
        // Encode steps as JSON data
        if let encodedSteps = try? JSONEncoder().encode(routine.steps) {
            record["stepsData"] = encodedSteps as NSData
        }
        
        return record
    }
    
    private func parseRoutines(from records: [CKRecord]) -> [Routine] {
        return records.compactMap { record in
            guard let name = record["name"] as? String,
                  let stepsData = record["stepsData"] as? Data,
                  let steps = try? JSONDecoder().decode([RoutineItem].self, from: stepsData) else {
                return nil
            }
            
            return Routine(id: UUID(uuidString: record.recordID.recordName) ?? UUID(), name: name, steps: steps)
        }
    }
    
    // MARK: - Delete Routine from Cloud
    
    func deleteRoutine(_ routineId: UUID, completion: @escaping (Result<Void, Error>) -> Void) {
        let recordID = CKRecord.ID(recordName: routineId.uuidString, zoneID: routineZoneID)
        
        privateDatabase.delete(withRecordID: recordID) { _, error in
            if let error = error {
                completion(.failure(error))
            } else {
                completion(.success(()))
            }
        }
    }
    
    // MARK: - Force Sync
    
    func forceSync(_ routines: [Routine], completion: @escaping (Result<[Routine], Error>) -> Void) {
        syncRoutines(routines, completion: completion)
    }
}

// MARK: - Error Handling

enum CloudKitError: LocalizedError {
    case notAvailable
    case syncFailed(String)
    case noAccount
    
    var errorDescription: String? {
        switch self {
        case .notAvailable:
            return "iCloud is not available. Please check your iCloud settings."
        case .syncFailed(let message):
            return "Sync failed: \(message)"
        case .noAccount:
            return "No iCloud account found. Please sign in to iCloud."
        }
    }
}
