import SwiftUI
import Foundation

class BackgroundColorManager: ObservableObject {
    @Published var selectedColor: StepColor = .blue
    
    private let backgroundColorKey = "selectedBackgroundColor"
    
    init() {
        loadBackgroundColor()
    }
    
    // MARK: - Background Color Management
    
    func setBackgroundColor(_ color: StepColor) {
        selectedColor = color
        saveBackgroundColor()
    }
    
    private func saveBackgroundColor() {
        if let encoded = try? JSONEncoder().encode(selectedColor) {
            UserDefaults.standard.set(encoded, forKey: backgroundColorKey)
        }
    }
    
    private func loadBackgroundColor() {
        if let data = UserDefaults.standard.data(forKey: backgroundColorKey),
           let color = try? JSONDecoder().decode(StepColor.self, from: data) {
            selectedColor = color
        }
    }
    
    // MARK: - Background Gradient Generation
    
    var backgroundGradient: LinearGradient {
        LinearGradient(
            gradient: Gradient(colors: backgroundColors),
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
    
    private var backgroundColors: [Color] {
        switch selectedColor {
        case .red:
            return [Color.red.opacity(0.3), Color.orange.opacity(0.4), Color.pink.opacity(0.5)]
        case .orange:
            return [Color.orange.opacity(0.3), Color.yellow.opacity(0.4), Color.red.opacity(0.5)]
        case .yellow:
            return [Color.yellow.opacity(0.3), Color.orange.opacity(0.4), Color.green.opacity(0.5)]
        case .green:
            return [Color.green.opacity(0.3), Color.blue.opacity(0.4), Color.teal.opacity(0.5)]
        case .blue:
            return [Color.blue.opacity(0.3), Color.indigo.opacity(0.4), Color.purple.opacity(0.5)]
        case .purple:
            return [Color.purple.opacity(0.3), Color.pink.opacity(0.4), Color.blue.opacity(0.5)]
        case .pink:
            return [Color.pink.opacity(0.3), Color.purple.opacity(0.4), Color.red.opacity(0.5)]
        case .gray:
            return [Color.gray.opacity(0.3), Color.secondary.opacity(0.4), Color.primary.opacity(0.5)]
        case .black:
            return [Color.black.opacity(0.4), Color.gray.opacity(0.3), Color.secondary.opacity(0.2)]
        }
    }
    
    // MARK: - Step Background Colors (for timer screen)
    
    func stepBackgroundColors(for stepColor: StepColor) -> [Color] {
        switch stepColor {
        case .red:
            return [Color.red.opacity(0.3), Color.orange.opacity(0.4), Color.pink.opacity(0.5)]
        case .orange:
            return [Color.orange.opacity(0.3), Color.yellow.opacity(0.4), Color.red.opacity(0.5)]
        case .yellow:
            return [Color.yellow.opacity(0.3), Color.orange.opacity(0.4), Color.green.opacity(0.5)]
        case .green:
            return [Color.green.opacity(0.3), Color.blue.opacity(0.4), Color.teal.opacity(0.5)]
        case .blue:
            return [Color.blue.opacity(0.3), Color.indigo.opacity(0.4), Color.purple.opacity(0.5)]
        case .purple:
            return [Color.purple.opacity(0.3), Color.pink.opacity(0.4), Color.blue.opacity(0.5)]
        case .pink:
            return [Color.pink.opacity(0.3), Color.purple.opacity(0.4), Color.red.opacity(0.5)]
        case .gray:
            return [Color.gray.opacity(0.3), Color.secondary.opacity(0.4), Color.primary.opacity(0.5)]
        case .black:
            return [Color.black.opacity(0.4), Color.gray.opacity(0.3), Color.secondary.opacity(0.2)]
        }
    }
    
    // MARK: - Default Step Background Colors (when no step is active)
    
    var defaultStepBackgroundColors: [Color] {
        return stepBackgroundColors(for: selectedColor)
    }
}
