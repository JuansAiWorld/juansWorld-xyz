import SwiftUI

struct RoutineEditorView: View {
    @EnvironmentObject var routineManager: RoutineManager
    @EnvironmentObject var backgroundColorManager: BackgroundColorManager
    @Environment(\.dismiss) private var dismiss
    
    let routineToEdit: Routine?
    
    @State private var routineName = ""
    @State private var items: [RoutineItem] = []
    @State private var showingAddStep = false
    @State private var showingAddGroup = false
    @State private var editingItem: RoutineItem?
    
    init(routine: Routine? = nil) {
        self.routineToEdit = routine
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                            // Dynamic gradient background based on user preference
            backgroundColorManager.backgroundGradient
                .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Routine Name Input
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Routine Name")
                            .font(.system(size: 20, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                        
                        TextField("Enter routine name", text: $routineName)
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(.black)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(Color.white)
                                    .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
                            )
                            .textFieldStyle(PlainTextFieldStyle())
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 32)
                    
                    // Total Duration Display
                    HStack {
                        Text("Total Duration:")
                            .font(.system(size: 18, weight: .semibold, design: .rounded))
                            .foregroundColor(.white.opacity(0.9))
                        
                        Spacer()
                        
                        Text(formatDuration(totalDuration))
                            .font(.system(size: 24, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 12)
                            .background(
                                RoundedRectangle(cornerRadius: 20)
                                    .fill(
                                        LinearGradient(
                                            gradient: Gradient(colors: [
                                                Color.blue.opacity(0.3),
                                                Color.indigo.opacity(0.25),
                                                Color.purple.opacity(0.2)
                                            ]),
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 20)
                                            .stroke(Color.white.opacity(0.4), lineWidth: 1)
                                    )
                            )
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 24)
                    .padding(.bottom, 32)
                    
                    // Steps List
                    if items.isEmpty {
                        VStack(spacing: 24) {
                            Image(systemName: "plus.circle.fill")
                                .font(.system(size: 60))
                                .foregroundColor(.white.opacity(0.8))
                            
                            Text("No Steps Yet")
                                .font(.system(size: 24, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                            
                            Text("Add steps and groups to build your routine")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.white.opacity(0.8))
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 32)
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .padding(.top, 40)
                    } else {
                        // Styled List with drag-to-reorder and swipe-to-delete
                        List {
                            ForEach(items) { item in
                                RoutineItemRow(item: item) {
                                    editingItem = item
                                }
                                .listRowBackground(Color.clear)
                                .listRowSeparator(.hidden)
                                .padding(.vertical, 4)
                            }
                            .onMove(perform: moveItems)
                            .onDelete(perform: deleteItems)
                        }
                        .listStyle(.plain)
                        .scrollContentBackground(.hidden)
                        .background(Color.clear)
                        .padding(.horizontal, 8)
                    }
                    
                    // Bottom Toolbar
                    VStack(spacing: 20) {
                        HStack(spacing: 16) {
                            Button(action: { showingAddStep = true }) {
                                HStack(spacing: 8) {
                                    Image(systemName: "plus.circle.fill")
                                        .font(.title2)
                                    Text("Add Step")
                                        .font(.headline)
                                        .fontWeight(.semibold)
                                }
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(
                                    RoundedRectangle(cornerRadius: 20)
                                        .fill(
                                            LinearGradient(
                                                gradient: Gradient(colors: [
                                                    Color.blue.opacity(0.3),
                                                    Color.indigo.opacity(0.25),
                                                    Color.purple.opacity(0.2)
                                                ]),
                                                startPoint: .topLeading,
                                                endPoint: .bottomTrailing
                                            )
                                        )
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 20)
                                                .stroke(Color.white.opacity(0.4), lineWidth: 1)
                                        )
                                )
                            }
                            
                            Button(action: { showingAddGroup = true }) {
                                HStack(spacing: 8) {
                                    Image(systemName: "folder.badge.plus")
                                        .font(.title2)
                                    Text("Add Group")
                                        .font(.headline)
                                        .fontWeight(.semibold)
                                }
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(
                                    RoundedRectangle(cornerRadius: 20)
                                        .fill(
                                            LinearGradient(
                                                gradient: Gradient(colors: [
                                                    Color.blue.opacity(0.3),
                                                    Color.indigo.opacity(0.25),
                                                    Color.purple.opacity(0.2)
                                                ]),
                                                startPoint: .topLeading,
                                                endPoint: .bottomTrailing
                                            )
                                        )
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 20)
                                                .stroke(Color.white.opacity(0.4), lineWidth: 1)
                                        )
                                )
                            }
                        }
                        
                        Button(action: { saveRoutine() }) {
                            HStack(spacing: 12) {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.title2)
                                Text("Save Routine")
                                    .font(.title2)
                                    .fontWeight(.bold)
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 20)
                            .background(
                                RoundedRectangle(cornerRadius: 25)
                                    .fill(
                                        LinearGradient(
                                            gradient: Gradient(colors: [
                                                Color.blue.opacity(0.8),
                                                Color.indigo.opacity(0.7),
                                                Color.purple.opacity(0.6)
                                            ]),
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .shadow(color: .black.opacity(0.2), radius: 10, x: 0, y: 5)
                            )
                        }
                        .disabled(routineName.isEmpty || items.isEmpty)
                        .opacity(routineName.isEmpty || items.isEmpty ? 0.6 : 1.0)
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle(routineToEdit != nil ? "Edit Routine" : "Create Routine")
            .navigationBarTitleDisplayMode(.inline)
            .navigationViewStyle(StackNavigationViewStyle())
            .toolbar(content: {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    EditButton()
                        .disabled(items.isEmpty)
                }
            })
            .onAppear {
                if let routine = routineToEdit {
                    routineName = routine.name
                    items = routine.steps
                }
            }
        }
        .sheet(isPresented: $showingAddStep) {
            AddStepView { step in
                items.append(.step(step))
            }
        }
        .sheet(isPresented: $showingAddGroup) {
            AddGroupView { group in
                items.append(.group(group))
            }
        }
        .sheet(item: $editingItem) { item in
            EditItemView(item: item) { updatedItem in
                if let index = items.firstIndex(where: { $0.id == updatedItem.id }) {
                    items[index] = updatedItem
                }
            }
        }
    }
    
    private var totalDuration: TimeInterval {
        items.reduce(0) { $0 + $1.duration }
    }
    
    private func moveItems(from source: IndexSet, to destination: Int) {
        items.move(fromOffsets: source, toOffset: destination)
    }
    
    private func deleteItems(offsets: IndexSet) {
        items.remove(atOffsets: offsets)
    }
    
    private func saveRoutine() {
        if let existingRoutine = routineToEdit {
            // Update existing routine by preserving the original ID
            let updatedRoutine = Routine(
                id: existingRoutine.id,  // Preserve the original ID
                name: routineName, 
                steps: items
            )
            routineManager.updateRoutine(updatedRoutine)
        } else {
            // Create new routine
            let routine = Routine(name: routineName, steps: items)
            routineManager.addRoutine(routine)
            
            // Soft reminder for free users at 2nd routine
            if routineManager.storeKitManager?.isPro != true && routineManager.routines.count == 2 {
                // Show a subtle reminder - could be implemented as a toast or alert
                print("Soft reminder: 1 free routine remaining")
            }
        }
        dismiss()
    }
    
    private func formatDuration(_ duration: TimeInterval) -> String {
        let minutes = Int(duration) / 60
        let seconds = Int(duration) % 60
        
        if minutes > 0 {
            return "\(minutes)m \(seconds)s"
        } else {
            return "\(seconds)s"
        }
    }
}

struct RoutineItemRow: View {
    let item: RoutineItem
    let onEdit: () -> Void
    
    var body: some View {
        HStack(spacing: 16) {
            Circle()
                .fill(itemColor.color)
                .frame(width: 20, height: 20)
                .shadow(color: .black.opacity(0.2), radius: 4, x: 0, y: 2)
            
            VStack(alignment: .leading, spacing: 6) {
                Text(item.displayName)
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Text(itemDescription)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
            }
            
            Spacer()
            
            HStack(spacing: 12) {
                Text(formatDuration(item.duration))
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white.opacity(0.9))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        Color.blue.opacity(0.25),
                                        Color.indigo.opacity(0.2),
                                        Color.purple.opacity(0.15)
                                    ]),
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                    )
                
                Button(action: onEdit) {
                    Image(systemName: "pencil.circle.fill")
                        .font(.title2)
                        .foregroundColor(.white.opacity(0.9))
                }
            }
        }
        .padding(.vertical, 16)
        .padding(.horizontal, 20)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.blue.opacity(0.2),
                            Color.indigo.opacity(0.15),
                            Color.purple.opacity(0.1)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
        )
    }
    
    private var itemColor: StepColor {
        switch item {
        case .step(let step):
            return step.color
        case .group(let group):
            return group.color
        }
    }
    
    private var itemDescription: String {
        switch item {
        case .step:
            return "Single step"
        case .group(let group):
            return "\(group.steps.count) steps × \(group.loopCount) loops"
        }
    }
    
    private func formatDuration(_ duration: TimeInterval) -> String {
        let minutes = Int(duration) / 60
        let seconds = Int(duration) % 60
        
        if minutes > 0 {
            return "\(minutes)m \(seconds)s"
        } else {
            return "\(seconds)s"
        }
    }
}

#Preview {
    RoutineEditorView()
        .environmentObject(RoutineManager())
        .environmentObject(BackgroundColorManager())
}
