import SwiftUI

struct AddGroupView: View {
    let onSave: (Group) -> Void
    @Environment(\.dismiss) private var dismiss
    
    @State private var groupName = ""
    @State private var loopCount = 1
    @State private var selectedColor: StepColor = .purple
    @State private var steps: [Step] = []
    @State private var showingAddStep = false
    
    var body: some View {
        NavigationView {
            Form {
                Section("Group Details") {
                    TextField("Group name", text: $groupName)
                    
                    Stepper("Loop count: \(loopCount)", value: $loopCount, in: 1...20)
                    
                    HStack {
                        Text("Color")
                        Spacer()
                        
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 8), spacing: 8) {
                            ForEach(StepColor.allCases, id: \.self) { color in
                                Button(action: { selectedColor = color }) {
                                    Circle()
                                        .fill(color.color)
                                        .frame(width: 24, height: 24)
                                        .overlay(
                                            Circle()
                                                .stroke(selectedColor == color ? Color.primary : Color.clear, lineWidth: 2)
                                        )
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .frame(width: 200)
                    }
                }
                
                Section("Steps") {
                    if steps.isEmpty {
                        HStack {
                            Text("No steps yet")
                                .foregroundColor(.secondary)
                            Spacer()
                            Button("Add Step") {
                                showingAddStep = true
                            }
                            .buttonStyle(.bordered)
                        }
                    } else {
                        ForEach(steps) { step in
                            HStack {
                                Circle()
                                    .fill(step.color.color)
                                    .frame(width: 12, height: 12)
                                
                                Text(step.name)
                                
                                Spacer()
                                
                                Text(formatDuration(step.duration))
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .onDelete(perform: deleteSteps)
                        
                        Button("Add Step") {
                            showingAddStep = true
                        }
                        .buttonStyle(.bordered)
                    }
                }
                
                if !steps.isEmpty {
                    Section {
                        HStack {
                            Text("Total Duration:")
                            Spacer()
                            Text("\(formatDuration(totalDuration))")
                                .fontWeight(.semibold)
                        }
                        
                        HStack {
                            Text("With Loops:")
                            Spacer()
                            Text("\(formatDuration(totalDuration * TimeInterval(loopCount)))")
                                .fontWeight(.semibold)
                        }
                    }
                }
            }
            .navigationTitle("Add Group")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveGroup()
                    }
                    .disabled(groupName.isEmpty || steps.isEmpty)
                }
            }
        }
        .sheet(isPresented: $showingAddStep) {
            AddStepView { step in
                steps.append(step)
            }
        }
    }
    
    private var totalDuration: TimeInterval {
        steps.reduce(0) { $0 + $1.duration }
    }
    
    private func deleteSteps(offsets: IndexSet) {
        steps.remove(atOffsets: offsets)
    }
    
    private func saveGroup() {
        let group = Group(
            name: groupName,
            steps: steps,
            loopCount: loopCount,
            color: selectedColor
        )
        onSave(group)
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

#Preview {
    AddGroupView { _ in }
}
