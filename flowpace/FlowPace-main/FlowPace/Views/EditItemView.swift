import SwiftUI

struct EditItemView: View {
    let item: RoutineItem
    let onSave: (RoutineItem) -> Void
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var backgroundColorManager: BackgroundColorManager
    
    @State private var editedItem: RoutineItem
    
    init(item: RoutineItem, onSave: @escaping (RoutineItem) -> Void) {
        self.item = item
        self.onSave = onSave
        self._editedItem = State(initialValue: item)
    }
    
    var body: some View {
        ZStack {
            // Dynamic gradient background
            backgroundColorManager.backgroundGradient
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header with liquid glass styling
                HStack {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(.ultraThinMaterial)
                            .opacity(0.3)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
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
                    .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                    
                    Spacer()
                    
                    Text("Edit \(item.displayName)")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                    
                    Spacer()
                    
                    Button("Save") {
                        onSave(editedItem)
                        dismiss()
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(.ultraThinMaterial)
                            .opacity(0.3)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
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
                    .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
                .padding(.bottom, 30)
                
                // Content with liquid glass cards
                ScrollView {
                    VStack(spacing: 20) {
                        switch editedItem {
                        case .step(let step):
                            EditStepSection(step: step) { updatedStep in
                                editedItem = .step(updatedStep)
                            }
                        case .group(let group):
                            EditGroupSection(group: group) { updatedGroup in
                                editedItem = .group(updatedGroup)
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                }
            }
        }
    }
}

struct EditStepSection: View {
    let step: Step
    let onUpdate: (Step) -> Void
    
    @State private var stepName: String
    @State private var minutes: Int
    @State private var seconds: Int
    @State private var selectedColor: StepColor
    
    init(step: Step, onUpdate: @escaping (Step) -> Void) {
        self.step = step
        self.onUpdate = onUpdate
        self._stepName = State(initialValue: step.name)
        self._minutes = State(initialValue: Int(step.duration) / 60)
        self._seconds = State(initialValue: Int(step.duration) % 60)
        self._selectedColor = State(initialValue: step.color)
    }
    
    var body: some View {
        VStack(spacing: 20) {
            // Step Details Card
            VStack(alignment: .leading, spacing: 16) {
                Text("Step Details")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white.opacity(0.8))
                    .padding(.bottom, 8)
                
                // Step Name Input
                VStack(alignment: .leading, spacing: 8) {
                    Text("Name")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.white.opacity(0.7))
                    
                    TextField("Step name", text: $stepName)
                        .textFieldStyle(PlainTextFieldStyle())
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(.ultraThinMaterial)
                                .opacity(0.4)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(
                                            LinearGradient(
                                                colors: [
                                                    Color.white.opacity(0.2),
                                                    Color.white.opacity(0.1)
                                                ],
                                                startPoint: .topLeading,
                                                endPoint: .bottomTrailing
                                            ),
                                            lineWidth: 1
                                        )
                                )
                        )
                        .foregroundColor(.white)
                        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                }
                
                // Duration Picker
                VStack(alignment: .leading, spacing: 8) {
                    Text("Duration")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.white.opacity(0.7))
                    
                    HStack(spacing: 16) {
                        VStack(spacing: 4) {
                            Text("Minutes")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.6))
                            
                            Picker("Minutes", selection: $minutes) {
                                ForEach(0...59, id: \.self) { minute in
                                    Text("\(minute)m").tag(minute)
                                }
                            }
                            .pickerStyle(.wheel)
                            .frame(width: 80, height: 100)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(.ultraThinMaterial)
                                    .opacity(0.3)
                            )
                            .clipped()
                        }
                        
                        VStack(spacing: 4) {
                            Text("Seconds")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.6))
                            
                            Picker("Seconds", selection: $seconds) {
                                ForEach(0...59, id: \.self) { second in
                                    Text("\(second)s").tag(second)
                                }
                            }
                            .pickerStyle(.wheel)
                            .frame(width: 80, height: 100)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(.ultraThinMaterial)
                                    .opacity(0.3)
                            )
                            .clipped()
                        }
                        
                        Spacer()
                    }
                }
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(.ultraThinMaterial)
                    .opacity(0.4)
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
            .shadow(color: .black.opacity(0.1), radius: 12, x: 0, y: 6)
            
            // Color Selection Card
            VStack(alignment: .leading, spacing: 16) {
                Text("Color")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white.opacity(0.8))
                    .padding(.bottom, 8)
                
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 16) {
                    ForEach(StepColor.allCases, id: \.self) { color in
                        Button(action: { selectedColor = color }) {
                            ZStack {
                                Circle()
                                    .fill(color.color)
                                    .frame(width: 50, height: 50)
                                    .shadow(color: .black.opacity(0.2), radius: 4, x: 0, y: 2)
                                
                                if selectedColor == color {
                                    Circle()
                                        .stroke(Color.white, lineWidth: 4)
                                        .frame(width: 60, height: 60)
                                        .shadow(color: .white.opacity(0.5), radius: 8, x: 0, y: 0)
                                }
                            }
                        }
                        .buttonStyle(PlainButtonStyle())
                        .scaleEffect(selectedColor == color ? 1.1 : 1.0)
                        .animation(.easeInOut(duration: 0.2), value: selectedColor)
                    }
                }
                .padding(.vertical, 8)
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(.ultraThinMaterial)
                    .opacity(0.4)
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
            .shadow(color: .black.opacity(0.1), radius: 12, x: 0, y: 6)
            
            // Total Duration Card
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    Text("Total Duration:")
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.white.opacity(0.8))
                    
                    Spacer()
                    
                    Text("\(minutes)m \(seconds)s")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                }
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(.ultraThinMaterial)
                    .opacity(0.4)
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
            .shadow(color: .black.opacity(0.1), radius: 12, x: 0, y: 6)
        }
        .onChange(of: stepName) { _, _ in updateStep() }
        .onChange(of: minutes) { _, _ in updateStep() }
        .onChange(of: seconds) { _, _ in updateStep() }
        .onChange(of: selectedColor) { _, _ in updateStep() }
    }
    
    private func updateStep() {
        let duration = TimeInterval(minutes * 60 + seconds)
        // Preserve the original step ID so edits update the same step
        let updatedStep = Step(id: step.id, name: stepName, duration: duration, color: selectedColor)
        onUpdate(updatedStep)
    }
}

struct EditGroupSection: View {
    let group: Group
    let onUpdate: (Group) -> Void
    
    @State private var groupName: String
    @State private var loopCount: Int
    @State private var selectedColor: StepColor
    @State private var steps: [Step]
    
    init(group: Group, onUpdate: @escaping (Group) -> Void) {
        self.group = group
        self.onUpdate = onUpdate
        self._groupName = State(initialValue: group.name)
        self._loopCount = State(initialValue: group.loopCount)
        self._selectedColor = State(initialValue: group.color)
        self._steps = State(initialValue: group.steps)
    }
    
    var body: some View {
        VStack(spacing: 20) {
            // Group Details Card
            VStack(alignment: .leading, spacing: 16) {
                Text("Group Details")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white.opacity(0.8))
                    .padding(.bottom, 8)
                
                // Group Name Input
                VStack(alignment: .leading, spacing: 8) {
                    Text("Name")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.white.opacity(0.7))
                    
                    TextField("Group name", text: $groupName)
                        .textFieldStyle(PlainTextFieldStyle())
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(.ultraThinMaterial)
                                .opacity(0.4)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(
                                            LinearGradient(
                                                colors: [
                                                    Color.white.opacity(0.2),
                                                    Color.white.opacity(0.1)
                                                ],
                                                startPoint: .topLeading,
                                                endPoint: .bottomTrailing
                                            ),
                                            lineWidth: 1
                                        )
                                )
                        )
                        .foregroundColor(.white)
                        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                }
                
                // Loop Count Stepper
                VStack(alignment: .leading, spacing: 8) {
                    Text("Loop Count")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.white.opacity(0.7))
                    
                    HStack {
                        Button(action: { if loopCount > 1 { loopCount -= 1 } }) {
                            Image(systemName: "minus.circle.fill")
                                .font(.title2)
                                .foregroundColor(.white)
                        }
                        .disabled(loopCount <= 1)
                        
                        Spacer()
                        
                        Text("\(loopCount)")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                        
                        Spacer()
                        
                        Button(action: { if loopCount < 20 { loopCount += 1 } }) {
                            Image(systemName: "plus.circle.fill")
                                .font(.title2)
                                .foregroundColor(.white)
                        }
                        .disabled(loopCount >= 20)
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(.ultraThinMaterial)
                            .opacity(0.3)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(
                                        LinearGradient(
                                            colors: [
                                                Color.white.opacity(0.2),
                                                Color.white.opacity(0.1)
                                            ],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        ),
                                        lineWidth: 1
                                    )
                            )
                    )
                    .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                }
                
                // Color Selection
                VStack(alignment: .leading, spacing: 8) {
                    Text("Color")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.white.opacity(0.7))
                    
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 8), spacing: 12) {
                        ForEach(StepColor.allCases, id: \.self) { color in
                            Button(action: { selectedColor = color }) {
                                ZStack {
                                    Circle()
                                        .fill(color.color)
                                        .frame(width: 30, height: 30)
                                        .shadow(color: .black.opacity(0.2), radius: 2, x: 0, y: 1)
                                    
                                    if selectedColor == color {
                                        Circle()
                                            .stroke(Color.white, lineWidth: 3)
                                            .frame(width: 36, height: 36)
                                            .shadow(color: .white.opacity(0.5), radius: 4, x: 0, y: 0)
                                    }
                                }
                            }
                            .buttonStyle(PlainButtonStyle())
                            .scaleEffect(selectedColor == color ? 1.1 : 1.0)
                            .animation(.easeInOut(duration: 0.2), value: selectedColor)
                        }
                    }
                }
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(.ultraThinMaterial)
                    .opacity(0.4)
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
            .shadow(color: .black.opacity(0.1), radius: 12, x: 0, y: 6)
            
            // Steps List Card
            VStack(alignment: .leading, spacing: 16) {
                Text("Steps")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white.opacity(0.8))
                    .padding(.bottom, 8)
                
                ForEach(steps) { step in
                    HStack(spacing: 12) {
                        Circle()
                            .fill(step.color.color)
                            .frame(width: 16, height: 16)
                            .shadow(color: .black.opacity(0.2), radius: 2, x: 0, y: 1)
                        
                        Text(step.name)
                            .font(.body)
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.3), radius: 1, x: 0, y: 1)
                        
                        Spacer()
                        
                        Text(formatDuration(step.duration))
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.white.opacity(0.7))
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(.ultraThinMaterial)
                            .opacity(0.2)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(
                                        LinearGradient(
                                            colors: [
                                                Color.white.opacity(0.1),
                                                Color.white.opacity(0.05)
                                            ],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        ),
                                        lineWidth: 1
                                    )
                            )
                    )
                }
                .onDelete(perform: deleteSteps)
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(.ultraThinMaterial)
                    .opacity(0.4)
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
            .shadow(color: .black.opacity(0.1), radius: 12, x: 0, y: 6)
            
            // Duration Summary Card
            VStack(alignment: .leading, spacing: 16) {
                VStack(spacing: 12) {
                    HStack {
                        Text("Total Duration:")
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.white.opacity(0.8))
                        
                        Spacer()
                        
                        Text("\(formatDuration(totalDuration))")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                    }
                    
                    HStack {
                        Text("With Loops:")
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.white.opacity(0.8))
                        
                        Spacer()
                        
                        Text("\(formatDuration(totalDuration * TimeInterval(loopCount)))")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                    }
                }
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(.ultraThinMaterial)
                    .opacity(0.4)
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
            .shadow(color: .black.opacity(0.1), radius: 12, x: 0, y: 6)
        }
        .onChange(of: groupName) { _, _ in updateGroup() }
        .onChange(of: loopCount) { _, _ in updateGroup() }
        .onChange(of: selectedColor) { _, _ in updateGroup() }
        .onChange(of: steps) { _, _ in updateGroup() }
    }
    
    private var totalDuration: TimeInterval {
        steps.reduce(0) { $0 + $1.duration }
    }
    
    private func deleteSteps(offsets: IndexSet) {
        steps.remove(atOffsets: offsets)
    }
    
    private func updateGroup() {
        let updatedGroup = Group(
            name: groupName,
            steps: steps,
            loopCount: loopCount,
            color: selectedColor
        )
        onUpdate(updatedGroup)
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
    EditItemView(item: .step(Step(name: "Sample Step", duration: 30, color: .blue))) { _ in }
}
