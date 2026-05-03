import SwiftUI

struct AddStepView: View {
    let onSave: (Step) -> Void
    @Environment(\.dismiss) private var dismiss
    
    @State private var stepName = ""
    @State private var minutes = 0
    @State private var seconds = 0
    @State private var selectedColor: StepColor = .blue
    
    var body: some View {
        NavigationView {
            ZStack {
                backgroundGradient
                
                ScrollView {
                    VStack(spacing: 24) {
                        stepDetailsCard
                        colorSelectionCard
                        totalDurationCard
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 24)
                }
            }
            .navigationTitle("Add Step")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(.white)
                    .font(.system(size: 16, weight: .semibold))
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveStep()
                    }
                    .disabled(stepName.isEmpty || (minutes == 0 && seconds == 0))
                    .foregroundColor(stepName.isEmpty || (minutes == 0 && seconds == 0) ? .white.opacity(0.5) : .white)
                    .font(.system(size: 16, weight: .semibold))
                }
            }
        }
    }
    
    // MARK: - Background
    private var backgroundGradient: some View {
        LinearGradient(
            gradient: Gradient(colors: [
                Color.blue.opacity(0.8),
                Color.indigo.opacity(0.7),
                Color.purple.opacity(0.6)
            ]),
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
    }
    
    // MARK: - Step Details Card
    private var stepDetailsCard: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("STEP DETAILS")
                .font(.system(size: 14, weight: .semibold, design: .rounded))
                .foregroundColor(.white.opacity(0.7))
                .tracking(1.0)
            
            VStack(spacing: 16) {
                stepNameInput
                durationPicker
            }
        }
        .padding(24)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.white.opacity(0.15))
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.white.opacity(0.3), lineWidth: 1)
                )
        )
        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
    }
    
    // MARK: - Step Name Input
    private var stepNameInput: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Step Name")
                .font(.system(size: 16, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
            
            TextField("Enter step name", text: $stepName)
                .font(.system(size: 18, weight: .medium))
                .foregroundColor(.black)
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.white)
                        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                )
                .textFieldStyle(PlainTextFieldStyle())
        }
    }
    
    // MARK: - Duration Picker
    private var durationPicker: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Duration")
                .font(.system(size: 16, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
            
            HStack(spacing: 20) {
                minutesPicker
                secondsPicker
            }
        }
    }
    
    // MARK: - Minutes Picker
    private var minutesPicker: some View {
        VStack(spacing: 8) {
            Text("\(minutes)m")
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .shadow(color: .black.opacity(0.2), radius: 2, x: 0, y: 1)
            
            Picker("Minutes", selection: $minutes) {
                ForEach(0...59, id: \.self) { minute in
                    Text("\(minute)m").tag(minute)
                }
            }
            .pickerStyle(.wheel)
            .frame(width: 100, height: 120)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.white.opacity(0.15))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.white.opacity(0.3), lineWidth: 1)
                    )
            )
        }
    }
    
    // MARK: - Seconds Picker
    private var secondsPicker: some View {
        VStack(spacing: 8) {
            Text("\(seconds)s")
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .shadow(color: .black.opacity(0.2), radius: 2, x: 0, y: 1)
            
            Picker("Seconds", selection: $seconds) {
                ForEach(0...59, id: \.self) { second in
                    Text("\(second)s").tag(second)
                }
            }
            .pickerStyle(.wheel)
            .frame(width: 100, height: 120)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.white.opacity(0.15))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.white.opacity(0.3), lineWidth: 1)
                    )
            )
        }
    }
    
    // MARK: - Color Selection Card
    private var colorSelectionCard: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("COLOR")
                .font(.system(size: 14, weight: .semibold, design: .rounded))
                .foregroundColor(.white.opacity(0.7))
                .tracking(1.0)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 16) {
                ForEach(StepColor.allCases, id: \.self) { color in
                    colorButton(for: color)
                }
            }
        }
        .padding(24)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.white.opacity(0.15))
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.white.opacity(0.3), lineWidth: 1)
                )
        )
        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
    }
    
    // MARK: - Color Button
    private func colorButton(for color: StepColor) -> some View {
        Button(action: { selectedColor = color }) {
            ZStack {
                Circle()
                    .fill(color.color)
                    .frame(width: 50, height: 50)
                    .shadow(color: .black.opacity(0.2), radius: 4, x: 0, y: 2)
                
                if selectedColor == color {
                    Circle()
                        .stroke(Color.white, lineWidth: 3)
                        .frame(width: 56, height: 56)
                    
                    Image(systemName: "checkmark")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                }
            }
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    // MARK: - Total Duration Card
    private var totalDurationCard: some View {
        HStack {
            Text("Total Duration:")
                .font(.system(size: 16, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
            
            Spacer()
            
            Text("\(minutes)m \(seconds)s")
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .shadow(color: .black.opacity(0.2), radius: 2, x: 0, y: 1)
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white.opacity(0.15))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.white.opacity(0.3), lineWidth: 1)
                )
        )
        .shadow(color: .black.opacity(0.1), radius: 6, x: 0, y: 3)
    }
    
    private func saveStep() {
        let duration = TimeInterval(minutes * 60 + seconds)
        let step = Step(name: stepName, duration: duration, color: selectedColor)
        onSave(step)
        dismiss()
    }
}

#Preview {
    AddStepView { _ in }
}
