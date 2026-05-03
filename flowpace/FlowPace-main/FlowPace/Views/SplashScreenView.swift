import SwiftUI

struct SplashScreenView: View {
    @EnvironmentObject var backgroundColorManager: BackgroundColorManager
    @State private var logoScale: CGFloat = 0.8
    @State private var logoOpacity: Double = 0.0
    
    var body: some View {
        ZStack {
            // Dynamic gradient background based on user preference
            backgroundColorManager.backgroundGradient
                .ignoresSafeArea()
            
            VStack(spacing: 40) {
                Spacer()
                
                // FlowPace Logo
                Image("FlowPaceLogo")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(height: 120)
                    .scaleEffect(logoScale)
                    .opacity(logoOpacity)
                    .animation(.easeOut(duration: 1.2), value: logoScale)
                    .animation(.easeIn(duration: 1.0), value: logoOpacity)
                
                Spacer()
                

                
                Spacer()
                
                // Version info
                Text("Version 2.0")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.white.opacity(0.5))
                    .opacity(logoOpacity)
                    .animation(.easeIn(duration: 1.0).delay(0.6), value: logoOpacity)
                
                Spacer()
            }
            .padding(.horizontal, 40)
        }
        .onAppear {
            startAnimation()
        }
    }
    
    private func startAnimation() {
        // Start logo animation
        withAnimation(.easeOut(duration: 1.2)) {
            logoScale = 1.0
        }
        
        withAnimation(.easeIn(duration: 1.0)) {
            logoOpacity = 1.0
        }
    }
}

#Preview {
    SplashScreenView()
}
