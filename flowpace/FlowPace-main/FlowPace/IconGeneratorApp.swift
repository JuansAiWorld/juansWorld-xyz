import SwiftUI

struct IconGeneratorApp: App {
    var body: some Scene {
        WindowGroup {
            IconGeneratorView()
        }
    }
}

struct IconGeneratorView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 30) {
                Text("FlowPace Icon Generator")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .padding()
                
                Text("Use this to generate app icons at different sizes")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                // Main icon sizes
                VStack(spacing: 20) {
                    Text("Main Icon Sizes")
                        .font(.headline)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 20) {
                        IconSizeView(size: 1024, label: "App Store\n1024x1024")
                        IconSizeView(size: 180, label: "iPhone\n180x180")
                        IconSizeView(size: 167, label: "iPad Pro\n167x167")
                    }
                }
                
                // Medium icon sizes
                VStack(spacing: 20) {
                    Text("Medium Icon Sizes")
                        .font(.headline)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 20) {
                        IconSizeView(size: 120, label: "iPhone\n120x120")
                        IconSizeView(size: 87, label: "iPhone\n87x87")
                        IconSizeView(size: 80, label: "iPhone\n80x80")
                    }
                }
                
                // Small icon sizes
                VStack(spacing: 20) {
                    Text("Small Icon Sizes")
                        .font(.headline)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 20) {
                        IconSizeView(size: 60, label: "iPhone\n60x60")
                        IconSizeView(size: 58, label: "iPhone\n58x58")
                        IconSizeView(size: 40, label: "iPhone\n40x40")
                    }
                }
                
                // Instructions
                VStack(alignment: .leading, spacing: 15) {
                    Text("Instructions:")
                        .font(.headline)
                    
                    Text("1. Take screenshots of each icon size")
                    Text("2. Crop to just the icon (remove background)")
                    Text("3. Save as PNG files with appropriate names")
                    Text("4. Add to AppIcon.appiconset in Xcode")
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
                
                Spacer()
            }
            .padding()
        }
    }
}

struct IconSizeView: View {
    let size: CGFloat
    let label: String
    
    var body: some View {
        VStack(spacing: 8) {
            FlowPaceIcon(size: size)
                .frame(width: size, height: size)
                .background(Color.white)
                .cornerRadius(8)
                .shadow(radius: 2)
            
            Text(label)
                .font(.caption)
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
        }
    }
}

#Preview {
    IconGeneratorView()
}
