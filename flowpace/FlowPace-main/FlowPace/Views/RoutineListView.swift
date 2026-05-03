import SwiftUI

struct RoutineListView: View {
    @EnvironmentObject var routineManager: RoutineManager
    @EnvironmentObject var storeKitManager: StoreKitManager
    @EnvironmentObject var audioManager: AudioManager
    @EnvironmentObject var backgroundColorManager: BackgroundColorManager

    @State private var showingCreateRoutine = false
    @State private var showingSettings = false
    @State private var showingAnalytics = false
    
    var body: some View {
        ZStack {
            // Dynamic gradient background based on user preference
            backgroundColorManager.backgroundGradient
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header section
                VStack(spacing: 16) {
                    // Header with logo and settings
                    VStack(spacing: 8) {
                        HStack {
                            // FlowPace Logo
                            Image("FlowPaceLogo")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(height: 60)
                            
                            Spacer()
                        
                        // Stats and settings with liquid glass
                        HStack(spacing: 12) {
                            // Analytics button
                             Button(action: { showingAnalytics = true }) {
                                Image(systemName: "chart.bar.fill")
                                    .font(.title2)
                                    .foregroundColor(.white)
                                    .frame(width: 44, height: 44)
                                    .background(
                                        Circle()
                                            .fill(.ultraThinMaterial)
                                            .opacity(0.3)
                                            .overlay(
                                                Circle()
                                                    .stroke(
                                                        LinearGradient(
                                                            colors: [
                                                                Color.white.opacity(0.4),
                                                                Color.white.opacity(0.1)
                                                            ],
                                                            startPoint: .topLeading,
                                                            endPoint: .bottomTrailing
                                                        ),
                                                        lineWidth: 1
                                                    )
                                            )
                                    )
                                    .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
                            }
                            
                            Button(action: { showingSettings = true }) {
                                Image(systemName: "gearshape.fill")
                                    .font(.title2)
                                    .foregroundColor(.white)
                                    .frame(width: 44, height: 44)
                                    .background(
                                        Circle()
                                            .fill(.ultraThinMaterial)
                                            .opacity(0.3)
                                            .overlay(
                                                Circle()
                                                    .stroke(
                                                        LinearGradient(
                                                            colors: [
                                                                Color.white.opacity(0.4),
                                                                Color.white.opacity(0.1)
                                                            ],
                                                            startPoint: .topLeading,
                                                            endPoint: .bottomTrailing
                                                        ),
                                                        lineWidth: 1
                                                    )
                                            )
                                    )
                                    .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
                            }
                        }
                        
                        // Routine counter
                        HStack {
                            Text(storeKitManager.isPro ? 
                                 "My Routines (\(routineManager.routines.count))" : 
                                 "My Routines (\(routineManager.routines.count)/\(routineManager.getRoutineLimit()))")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(
                                    Capsule()
                                        .fill(.ultraThinMaterial)
                                        .opacity(0.7)
                                        .overlay(
                                            Capsule()
                                                .stroke(Color.white.opacity(0.3), lineWidth: 1)
                                        )
                                )
                                .shadow(color: .black.opacity(0.2), radius: 4, x: 0, y: 2)
                            
                            Spacer()
                        }
                    }
                    .padding(.top, 20)
                    .padding(.horizontal, 20)
                }
                .padding(.bottom, 30)
            }
                
                // Content area
                if routineManager.routines.isEmpty {
                    // Empty state with premium design
                    VStack(spacing: 32) {
                        Spacer()
                        
                        // Icon with liquid glass background
                        ZStack {
                            Circle()
                                .fill(
                                    LinearGradient(
                                        gradient: Gradient(colors: [Color.blue, Color.purple]),
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 120, height: 120)
                                .background(
                                    Circle()
                                        .fill(.ultraThinMaterial)
                                        .opacity(0.4)
                                        .overlay(
                                            Circle()
                                                .stroke(
                                                    LinearGradient(
                                                        colors: [
                                                            Color.white.opacity(0.3),
                                                            Color.white.opacity(0.1)
                                                        ],
                                                        startPoint: .topLeading,
                                                        endPoint: .bottomTrailing
                                                    ),
                                                    lineWidth: 2
                                                )
                                        )
                                )
                                .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
                            
                            Image(systemName: "timer")
                                .font(.system(size: 50, weight: .bold))
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                        }
                        
                        VStack(spacing: 16) {
                            Text("Ready to Optimize Your Workflow?")
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                                .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
                                .multilineTextAlignment(.center)
                            
                            Text("Create your first professional interval timer routine to boost productivity and focus")
                                .font(.body)
                                .foregroundColor(.white.opacity(0.9))
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 20)
                        }
                        
                        // Premium create button with liquid glass
                        Button(action: { 
                            if routineManager.canAddRoutine() {
                                showingCreateRoutine = true
                            }
                        }) {
                            HStack(spacing: 12) {
                                Image(systemName: "plus.circle.fill")
                                    .font(.title2)
                                Text("Create Your First Routine")
                                    .font(.headline)
                                    .fontWeight(.semibold)
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 18)
                            .background(
                                RoundedRectangle(cornerRadius: 20)
                                    .fill(.ultraThinMaterial)
                                    .opacity(0.5)
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
                            .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
                        }
                        .padding(.horizontal, 40)
                        
                        Spacer()
                    }
                } else {
                    // Routines list with premium design + reordering
                    List {
                        ForEach(routineManager.routines) { routine in
                            RoutineRowView(routine: routine)
                                .listRowBackground(Color.clear)
                                .listRowSeparator(.hidden)
                                .listRowInsets(EdgeInsets(top: 8, leading: 20, bottom: 8, trailing: 20))
                        }
                        .onMove(perform: routineManager.moveRoutines)
                        .onDelete(perform: deleteRoutines)
                    }
                    .listStyle(PlainListStyle())
                    .background(Color.clear)
                }
                
                // Bottom action area
                if !routineManager.routines.isEmpty {
                    VStack(spacing: 16) {
                        // Create new routine button with liquid glass
                        Button(action: { 
                            if routineManager.canAddRoutine() {
                                showingCreateRoutine = true
                            }
                        }) {
                            HStack(spacing: 12) {
                                Image(systemName: routineManager.canAddRoutine() ? "plus.circle.fill" : "lock.circle.fill")
                                    .font(.title2)
                                Text(routineManager.canAddRoutine() ? "Create New Routine" : "Upgrade to Create More")
                                    .font(.headline)
                                    .fontWeight(.semibold)
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 18)
                            .background(
                                RoundedRectangle(cornerRadius: 20)
                                    .fill(.ultraThinMaterial)
                                    .opacity(0.5)
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
                            .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
                        }
                        .disabled(routineManager.routines.count >= 3 && !storeKitManager.isPro)
                        .opacity(routineManager.routines.count >= 3 && !storeKitManager.isPro ? 0.6 : 1.0)
                        .padding(.horizontal, 20)
                        
                        // Pro upgrade hint if needed
                        if routineManager.routines.count >= 3 && !storeKitManager.isPro {
                            Text("Upgrade to Pro for unlimited routines")
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .padding(.bottom, 10)
                        }
                    }
                    .padding(.bottom, 30)
                }
            }
        }
        .navigationBarHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { showingSettings = true }) {
                    Image(systemName: "gearshape.fill")
                        .font(.title2)
                        .foregroundColor(.primary)
                        .padding(12)
                        .background(
                            Circle()
                                .fill(Color(.systemBackground).opacity(0.8))
                                .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                        )
                }
            }
        }
            .sheet(isPresented: $showingCreateRoutine) {
                RoutineEditorView()
                    .environmentObject(routineManager)
                    .environmentObject(backgroundColorManager)
            }
            .sheet(isPresented: $showingSettings) {
                SettingsView()
                    .environmentObject(storeKitManager)
                    .environmentObject(backgroundColorManager)
            }
            .sheet(isPresented: $showingAnalytics) {
                AnalyticsView()
                    .environmentObject(routineManager)
                    .environmentObject(storeKitManager)
            }
    }
    
    private func deleteRoutines(offsets: IndexSet) {
        routineManager.deleteRoutines(at: offsets)
    }
}

struct RoutineRowView: View {
    let routine: Routine
    @EnvironmentObject var routineManager: RoutineManager
    @EnvironmentObject var storeKitManager: StoreKitManager
    @EnvironmentObject var audioManager: AudioManager
    @EnvironmentObject var backgroundColorManager: BackgroundColorManager
    
    var body: some View {
        NavigationLink(destination: RoutineDetailView(routine: routine).environmentObject(routineManager).environmentObject(storeKitManager).environmentObject(audioManager).environmentObject(backgroundColorManager)) {
            HStack(spacing: 16) {
                // Routine icon with exciting gradient background
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [Color.blue, Color.purple]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 60, height: 60)
                        .shadow(color: .black.opacity(0.2), radius: 8, x: 0, y: 4)
                    
                    Image(systemName: "timer")
                        .font(.title2)
                        .foregroundColor(.white)
                }
                
                // Routine details
                VStack(alignment: .leading, spacing: 6) {
                    Text(routine.name)
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                    
                    HStack(spacing: 12) {
                        HStack(spacing: 4) {
                            Image(systemName: "list.bullet")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                            Text("\(routine.steps.count) steps")
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(.white.opacity(0.8))
                        }
                        
                        HStack(spacing: 4) {
                            Image(systemName: "clock")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                            Text(formatDuration(routine.totalDuration))
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(.white.opacity(0.8))
                        }
                    }
                }
                
                Spacer()
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(.ultraThinMaterial)
                    .opacity(0.7)
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(
                                LinearGradient(
                                    colors: [
                                        Color.white.opacity(0.4),
                                        Color.white.opacity(0.2)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 1.5
                            )
                    )
            )
            .shadow(color: .black.opacity(0.15), radius: 12, x: 0, y: 6)
        }
        .buttonStyle(PlainButtonStyle())
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

struct RoutineDetailView: View {
    let routine: Routine
    @EnvironmentObject var routineManager: RoutineManager
    @EnvironmentObject var storeKitManager: StoreKitManager
    @EnvironmentObject var audioManager: AudioManager
    @EnvironmentObject var backgroundColorManager: BackgroundColorManager
    @State private var showingTimer = false
    @State private var showingEditRoutine = false
    
    var body: some View {
        ZStack {
            // Dynamic gradient background based on user preference
            backgroundColorManager.backgroundGradient
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header section
                VStack(spacing: 24) {
                    // Routine icon and title
                    ZStack {
                        Circle()
                            .fill(
                                LinearGradient(
                                    gradient: Gradient(colors: [Color.blue, Color.purple]),
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 120, height: 120)
                            .shadow(color: .black.opacity(0.2), radius: 10, x: 0, y: 5)
                        
                        Image(systemName: "timer")
                            .font(.system(size: 50, weight: .bold))
                            .foregroundColor(.white)
                    }
                    
                    VStack(spacing: 12) {
                        Text(routine.name)
                            .font(.system(size: 36, weight: .heavy, design: .rounded))
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
                            .multilineTextAlignment(.center)
                        
                        // Edit button
                        Button(action: { showingEditRoutine = true }) {
                            HStack(spacing: 8) {
                                Image(systemName: "pencil.circle.fill")
                                    .font(.title2)
                                Text("Edit")
                                    .font(.headline)
                                    .fontWeight(.semibold)
                            }
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 12)
                            .background(
                                RoundedRectangle(cornerRadius: 20)
                                    .fill(
                                        LinearGradient(
                                            gradient: Gradient(colors: [Color.orange, Color.red]),
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        )
                                    )
                                    .shadow(color: .black.opacity(0.15), radius: 6, x: 0, y: 3)
                            )
                        }
                        
                        HStack(spacing: 20) {
                            // Steps count
                            VStack(spacing: 6) {
                                Text("\(routine.steps.count)")
                                    .font(.system(size: 24, weight: .bold, design: .rounded))
                                    .foregroundColor(.white)
                                Text("Steps")
                                    .font(.caption)
                                    .fontWeight(.medium)
                                    .foregroundColor(.white.opacity(0.8))
                            }
                            
                            // Duration
                            VStack(spacing: 6) {
                                Text(formatDuration(routine.totalDuration))
                                    .font(.system(size: 24, weight: .bold, design: .rounded))
                                    .foregroundColor(.white)
                                Text("Duration")
                                    .font(.caption)
                                    .fontWeight(.medium)
                                    .foregroundColor(.white.opacity(0.8))
                            }
                        }
                        .padding(.vertical, 16)
                        .padding(.horizontal, 24)
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(Color.white.opacity(0.25))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 16)
                                        .stroke(Color.white.opacity(0.4), lineWidth: 2)
                                )
                                .shadow(color: .black.opacity(0.2), radius: 12, x: 0, y: 6)
                        )
                    }
                }
                .padding(.top, 40)
                .padding(.horizontal, 20)
                
                // Steps breakdown
                VStack(spacing: 16) {
                    Text("Routine Breakdown")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    
                    VStack(spacing: 12) {
                        ForEach(routine.steps) { item in
                            HStack(spacing: 16) {
                                // Color indicator
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(itemColor(item).color)
                                    .frame(width: 16, height: 16)
                                
                                Text(item.displayName)
                                    .font(.body)
                                    .fontWeight(.medium)
                                    .foregroundColor(.white)
                                
                                Spacer()
                                
                                Text(formatDuration(item.duration))
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(
                                        RoundedRectangle(cornerRadius: 8)
                                            .fill(Color.white.opacity(0.2))
                                    )
                            }
                            .padding(.vertical, 12)
                            .padding(.horizontal, 16)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.white.opacity(0.2))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(Color.white.opacity(0.3), lineWidth: 1)
                                    )
                                    .shadow(color: .black.opacity(0.2), radius: 8, x: 0, y: 4)
                            )
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 30)
                
                Spacer()
                
                // Start button
                VStack(spacing: 16) {
                    Button(action: { showingTimer = true }) {
                        HStack(spacing: 12) {
                            Image(systemName: "play.circle.fill")
                                .font(.title2)
                            Text("Start Routine")
                                .font(.title2)
                                .fontWeight(.bold)
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 20)
                        .background(
                            RoundedRectangle(cornerRadius: 24)
                                .fill(
                                    LinearGradient(
                                        gradient: Gradient(colors: [Color.blue, Color.purple]),
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .shadow(color: .black.opacity(0.2), radius: 12, x: 0, y: 6)
                        )
                    }
                    .padding(.horizontal, 20)
                    
                    Text("Tap to begin your focused work session")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                        .padding(.bottom, 30)
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .fullScreenCover(isPresented: $showingTimer) {
            ActiveTimerView(routine: routine)
                .environmentObject(audioManager)
                .environmentObject(storeKitManager)
                .environmentObject(backgroundColorManager)
        }
        .sheet(isPresented: $showingEditRoutine) {
            RoutineEditorView(routine: routine)
                .environmentObject(routineManager)
                .environmentObject(backgroundColorManager)
        }
        .sheet(isPresented: $showingAnalytics) {
            AnalyticsView()
                .environmentObject(routineManager)
                .environmentObject(storeKitManager)
        }
    }
    
    private func itemColor(_ item: RoutineItem) -> StepColor {
        switch item {
        case .step(let step):
            return step.color
        case .group(let group):
            return group.color
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
    RoutineListView()
        .environmentObject(RoutineManager())
        .environmentObject(StoreKitManager())
        .environmentObject(AudioManager())
        .environmentObject(BackgroundColorManager())
}
