import SwiftUI

struct ContentView: View {
    @StateObject private var routineManager = RoutineManager()
    @StateObject private var storeKitManager = StoreKitManager()
    @StateObject private var audioManager = AudioManager()
    @StateObject private var cloudKitManager = CloudKitManager()
    @EnvironmentObject var backgroundColorManager: BackgroundColorManager
    
    var body: some View {
        NavigationView {
            RoutineListView()
                .environmentObject(routineManager)
                .environmentObject(storeKitManager)
                .environmentObject(audioManager)
                .environmentObject(cloudKitManager)
                .environmentObject(backgroundColorManager)
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .onAppear {
            audioManager.storeKitManager = storeKitManager
            
            // Connect RoutineManager to StoreKitManager and CloudKitManager for premium features
            routineManager.storeKitManager = storeKitManager
            routineManager.cloudKitManager = cloudKitManager
        }
    }
}

#Preview {
    ContentView()
}
