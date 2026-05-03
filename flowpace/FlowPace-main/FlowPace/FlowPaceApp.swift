import SwiftUI

@main
struct FlowPaceApp: App {
    @State private var showingSplash = true
    @StateObject private var backgroundColorManager = BackgroundColorManager()
    
    var body: some Scene {
        WindowGroup {
            ZStack {
                if showingSplash {
                    SplashScreenView()
                        .environmentObject(backgroundColorManager)
                        .transition(.opacity)
                        .zIndex(1)
                } else {
                    ContentView()
                        .environmentObject(backgroundColorManager)
                        .transition(.opacity)
                        .zIndex(0)
                }
            }
            .animation(.easeInOut(duration: 0.5), value: showingSplash)
            .onAppear {
                // Show splash for 3 seconds, then transition to main app
                DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
                    withAnimation {
                        showingSplash = false
                    }
                }
            }
        }
    }
}
