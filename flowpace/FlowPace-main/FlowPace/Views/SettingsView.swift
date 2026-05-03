import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var storeKitManager: StoreKitManager
    @EnvironmentObject var audioManager: AudioManager
    @EnvironmentObject var backgroundColorManager: BackgroundColorManager

    @Environment(\.dismiss) private var dismiss
    
    @StateObject private var hapticManager = HapticManager()
    
    @State private var showingPrivacyPolicy = false
    @State private var showingTermsOfService = false
    @State private var showingContactSupport = false
    
    // App version and build information
    private var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "Unknown"
    }
    
    private var appBuild: String {
        Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "Unknown"
    }
    
    var body: some View {
        ZStack {
            // Dynamic gradient background based on user preference
            backgroundColorManager.backgroundGradient
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("Settings")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
                    
                    Spacer()
                    
                    Button("Done") {
                        dismiss()
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 20)
                            .fill(
                                LinearGradient(
                                    gradient: Gradient(colors: [Color.blue, Color.purple]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                    )
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
                .padding(.bottom, 30)
                
                // Settings content
                ScrollView(.vertical, showsIndicators: false) {
                    LazyVStack(spacing: 20) {
                            // Pro Status Section
                         SettingsCard(title: "Subscription") {
                             VStack(spacing: 20) {
                                 // Status Header
                                 HStack {
                                     VStack(alignment: .leading, spacing: 6) {
                                         Text(storeKitManager.isPro ? "Pro Active" : "Free Plan")
                                             .font(.title2)
                                             .fontWeight(.bold)
                                             .foregroundColor(.white)
                                         
                                         Text(storeKitManager.isPro ? "All Pro features unlocked" : "Upgrade for premium features")
                                             .font(.subheadline)
                                             .foregroundColor(.white.opacity(0.8))
                                     }
                                     
                                     Spacer()
                                     
                                     if storeKitManager.isPro {
                                         Image(systemName: "checkmark.circle.fill")
                                             .foregroundColor(.green)
                                             .font(.title)
                                     }
                                 }
                                 
                                 if !storeKitManager.isPro {
                                     // Professional Upgrade Section
                                     VStack(spacing: 16) {
                                         // Primary CTA - One-time purchase
                                         Button(action: {
                                             Task {
                                                 await storeKitManager.purchasePro(productId: "com.flowpace.pro.onetime")
                                             }
                                         }) {
                                             VStack(spacing: 4) {
                                                 Text("Upgrade to Pro")
                                                     .font(.headline)
                                                     .fontWeight(.semibold)
                                                 Text("\(storeKitManager.getProPrice(productId: "com.flowpace.pro.onetime") ?? "$9.99 CAD") • One-time purchase")
                                                     .font(.caption)
                                                     .opacity(0.9)
                                             }
                                             .foregroundColor(.white)
                                             .frame(maxWidth: .infinity)
                                             .padding(.vertical, 16)
                                             .background(
                                                 RoundedRectangle(cornerRadius: 16)
                                                     .fill(
                                                         LinearGradient(
                                                             gradient: Gradient(colors: [Color.blue, Color.purple]),
                                                             startPoint: .leading,
                                                             endPoint: .trailing
                                                         )
                                                     )
                                                     .overlay(
                                                         RoundedRectangle(cornerRadius: 16)
                                                             .stroke(Color.white.opacity(0.2), lineWidth: 1)
                                                     )
                                             )
                                             .shadow(color: .black.opacity(0.2), radius: 8, x: 0, y: 4)
                                         }
                                         
                                         // Subscription options
                                         VStack(spacing: 8) {
                                             Text("Or choose a subscription:")
                                                 .font(.caption)
                                                 .foregroundColor(.white.opacity(0.7))
                                             
                                             HStack(spacing: 12) {
                                                 Button(action: {
                                                     Task {
                                                         await storeKitManager.purchasePro(productId: "com.flowpace.pro.monthly")
                                                     }
                                                 }) {
                                                     VStack(spacing: 2) {
                                                         Text("Monthly")
                                                             .font(.subheadline)
                                                             .fontWeight(.medium)
                                                         Text(storeKitManager.getProPrice(productId: "com.flowpace.pro.monthly") ?? "$1.99")
                                                             .font(.caption)
                                                     }
                                                     .foregroundColor(.white)
                                                     .frame(maxWidth: .infinity)
                                                     .padding(.vertical, 12)
                                                     .background(
                                                         RoundedRectangle(cornerRadius: 12)
                                                             .fill(.ultraThinMaterial)
                                                             .opacity(0.4)
                                                             .overlay(
                                                                 RoundedRectangle(cornerRadius: 12)
                                                                     .stroke(Color.white.opacity(0.3), lineWidth: 1)
                                                             )
                                                     )
                                                     .shadow(color: .black.opacity(0.1), radius: 6, x: 0, y: 3)
                                                 }
                                                 
                                                 Button(action: {
                                                     Task {
                                                         await storeKitManager.purchasePro(productId: "com.flowpace.pro.yearly")
                                                     }
                                                 }) {
                                                     VStack(spacing: 2) {
                                                         Text("Yearly")
                                                             .font(.subheadline)
                                                             .fontWeight(.medium)
                                                         Text(storeKitManager.getProPrice(productId: "com.flowpace.pro.yearly") ?? "$7.99")
                                                             .font(.caption)
                                                     }
                                                     .foregroundColor(.white)
                                                     .frame(maxWidth: .infinity)
                                                     .padding(.vertical, 12)
                                                     .background(
                                                         RoundedRectangle(cornerRadius: 12)
                                                             .fill(.ultraThinMaterial)
                                                             .opacity(0.4)
                                                             .overlay(
                                                                 RoundedRectangle(cornerRadius: 12)
                                                                     .stroke(Color.white.opacity(0.3), lineWidth: 1)
                                                             )
                                                     )
                                                     .shadow(color: .black.opacity(0.1), radius: 6, x: 0, y: 3)
                                                 }
                                             }
                                         }
                                         
                                         // Features list
                                         VStack(alignment: .leading, spacing: 12) {
                                             Text("Pro includes:")
                                                 .font(.subheadline)
                                                 .fontWeight(.medium)
                                                 .foregroundColor(.white)
                                             
                                             VStack(alignment: .leading, spacing: 8) {
                                                 ForEach(storeKitManager.proFeatures) { feature in
                                                     ProFeatureRow(icon: feature.icon, title: feature.title, description: feature.description)
                                                 }
                                             }
                                         }
                                         .padding(.top, 8)
                                     }
                                 } else {
                                     // Show iCloud sync status if Pro
                                     VStack(alignment: .leading, spacing: 12) {
                                         HStack {
                                             Image(systemName: "icloud.fill")
                                                 .foregroundColor(.blue)
                                             Text("iCloud Sync")
                                                 .font(.subheadline)
                                                 .fontWeight(.medium)
                                             Spacer()
                                             if cloudKitManager.isSyncing {
                                                 ProgressView()
                                                     .scaleEffect(0.7)
                                             } else if cloudKitManager.isCloudAvailable {
                                                 Image(systemName: "checkmark.circle.fill")
                                                     .foregroundColor(.green)
                                             }
                                         }
                                         
                                         if let lastSync = cloudKitManager.lastSyncDate {
                                             Text("Last sync: \(lastSync, style: .relative) ago")
                                                 .font(.caption)
                                                 .foregroundColor(.secondary)
                                         }
                                         
                                         if let error = cloudKitManager.syncError {
                                             Text(error)
                                                 .font(.caption)
                                                 .foregroundColor(.red)
                                         }
                                     }
                                     .padding(.top, 8)
                                 }
                             }
                         }
                        
                        // Appearance Settings Section
                        SettingsCard(title: "Appearance") {
                            VStack(spacing: 16) {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text("Background Color")
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                    
                                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 3), spacing: 8) {
                                        ForEach(StepColor.allCases, id: \.self) { color in
                                            Button(action: {
                                                backgroundColorManager.setBackgroundColor(color)
                                            }) {
                                                ZStack {
                                                    Circle()
                                                        .fill(color.color)
                                                        .frame(width: 44, height: 44)
                                                        .overlay(
                                                            Circle()
                                                                .stroke(Color.white, lineWidth: backgroundColorManager.selectedColor == color ? 3 : 1)
                                                        )
                                                        .shadow(color: .black.opacity(0.2), radius: 4, x: 0, y: 2)
                                                    
                                                    if backgroundColorManager.selectedColor == color {
                                                        Image(systemName: "checkmark")
                                                            .foregroundColor(.white)
                                                            .font(.system(size: 16, weight: .bold))
                                                            .shadow(color: .black.opacity(0.5), radius: 2, x: 0, y: 1)
                                                    }
                                                }
                                            }
                                            .buttonStyle(PlainButtonStyle())
                                        }
                                    }
                                    
                                    Text("Choose your preferred background color theme")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                        
                        // Audio Settings Section
                        SettingsCard(title: "Audio") {
                            VStack(spacing: 16) {
                                Toggle("Enable Audio", isOn: $audioManager.isAudioEnabled)
                                    .toggleStyle(SwitchToggleStyle(tint: .blue))
                                
                                if audioManager.isAudioEnabled {
                                    HStack {
                                        Toggle("Voice Cues", isOn: $audioManager.isVoiceEnabled)
                                            .disabled(!storeKitManager.isPro)
                                            .toggleStyle(SwitchToggleStyle(tint: .blue))
                                        
                                        if !storeKitManager.isPro {
                                            Text("PRO")
                                                .font(.caption2)
                                                .fontWeight(.bold)
                                                .foregroundColor(.white)
                                                .padding(.horizontal, 6)
                                                .padding(.vertical, 2)
                                                .background(
                                                    Capsule()
                                                        .fill(LinearGradient(
                                                            gradient: Gradient(colors: [Color.blue, Color.purple]),
                                                            startPoint: .leading,
                                                            endPoint: .trailing
                                                        ))
                                                )
                                        }
                                    }
                                    
                                    if audioManager.isVoiceEnabled {
                                        VStack(spacing: 12) {
                                            HStack {
                                                Text("Volume")
                                                    .font(.subheadline)
                                                    .fontWeight(.medium)
                                                Spacer()
                                                Text("\(Int(audioManager.volume * 100))%")
                                                    .font(.caption)
                                                    .foregroundColor(.secondary)
                                            }
                                            
                                            Slider(value: $audioManager.volume, in: 0...1, step: 0.1)
                                                .accentColor(.blue)

                                            // Premium-only Sound Pack selection
                                            if storeKitManager.isPro {
                                                VStack(alignment: .leading, spacing: 12) {
                                                    Text("Sound Pack")
                                                        .font(.subheadline)
                                                        .fontWeight(.medium)
                                                        .foregroundColor(.white)
                                                    
                                                    // Productivity Packs
                                                    VStack(alignment: .leading, spacing: 8) {
                                                        Text("Productivity & Focus")
                                                            .font(.caption)
                                                            .fontWeight(.semibold)
                                                            .foregroundColor(.white.opacity(0.7))
                                                            .padding(.horizontal, 8)
                                                            .padding(.vertical, 4)
                                                            .background(
                                                                Capsule()
                                                                    .fill(.ultraThinMaterial)
                                                                    .opacity(0.3)
                                                            )
                                                        
                                                        ForEach(audioManager.builtInPacks.filter { $0.category == "Productivity" }, id: \.id) { pack in
                                                            SoundPackRow(pack: pack, isSelected: audioManager.selectedSoundPackId == pack.id, audioManager: audioManager) {
                                                                audioManager.setSoundPack(pack.id)
                                                            }
                                                        }
                                                    }
                                                    
                                                    // Fitness Packs
                                                    VStack(alignment: .leading, spacing: 8) {
                                                        Text("Fitness & Wellness")
                                                            .font(.caption)
                                                            .fontWeight(.semibold)
                                                            .foregroundColor(.white.opacity(0.7))
                                                            .padding(.horizontal, 8)
                                                            .padding(.vertical, 4)
                                                            .background(
                                                                Capsule()
                                                                    .fill(.ultraThinMaterial)
                                                                    .opacity(0.3)
                                                            )
                                                        
                                                        ForEach(audioManager.builtInPacks.filter { $0.category == "Fitness" }, id: \.id) { pack in
                                                            SoundPackRow(pack: pack, isSelected: audioManager.selectedSoundPackId == pack.id, audioManager: audioManager) {
                                                                audioManager.setSoundPack(pack.id)
                                                            }
                                                        }
                                                    }
                                                    
                                                    // Classic Packs
                                                    VStack(alignment: .leading, spacing: 8) {
                                                        Text("Classic")
                                                            .font(.caption)
                                                            .fontWeight(.semibold)
                                                            .foregroundColor(.white.opacity(0.7))
                                                            .padding(.horizontal, 8)
                                                            .padding(.vertical, 4)
                                                            .background(
                                                                Capsule()
                                                                    .fill(.ultraThinMaterial)
                                                                    .opacity(0.3)
                                                            )
                                                        
                                                        ForEach(audioManager.builtInPacks.filter { $0.category == "Classic" }, id: \.id) { pack in
                                                            SoundPackRow(pack: pack, isSelected: audioManager.selectedSoundPackId == pack.id, audioManager: audioManager) {
                                                                audioManager.setSoundPack(pack.id)
                                                            }
                                                        }
                                                    }
                                                }
                                                .padding(.leading, 8)
                                            }

                                            // Premium-only voice selection
                                            if storeKitManager.isPro {
                                                VStack(alignment: .leading, spacing: 8) {
                                                    Text("Voice")
                                                        .font(.subheadline)
                                                        .fontWeight(.medium)
                                                    let voices = audioManager.getAvailableVoices(languagePrefix: "en")
                                                    Picker("Voice", selection: Binding<String>(
                                                        get: { audioManager.selectedVoiceIdentifier ?? "" },
                                                        set: { audioManager.setVoiceIdentifier($0.isEmpty ? nil : $0) }
                                                    )) {
                                                        Text("System Default")
                                                            .tag("")
                                                        ForEach(voices, id: \.identifier) { voice in
                                                            Text("\(voice.name) (\(voice.language))")
                                                                .tag(voice.identifier)
                                                        }
                                                    }
                                                    .pickerStyle(MenuPickerStyle())
                                                    
                                                    HStack {
                                                        Spacer()
                                                        Button(action: { audioManager.speakPreview() }) {
                                                            HStack(spacing: 8) {
                                                                Image(systemName: "play.circle.fill")
                                                                Text("Preview Voice")
                                                            }
                                                            .foregroundColor(.white)
                                                            .padding(.vertical, 8)
                                                            .padding(.horizontal, 12)
                                                            .background(Color.white.opacity(0.15))
                                                            .cornerRadius(10)
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        .padding(.leading, 8)
                                    }
                                }
                            }
                        }
                        
                        // Haptic Settings Section
                        SettingsCard(title: "Haptics") {
                            VStack(spacing: 16) {
                                if hapticManager.isHapticsSupported {
                                    HStack {
                                        Text("Haptic feedback provides tactile cues for step changes and completion")
                                            .font(.subheadline)
                                            .foregroundColor(.secondary)
                                        
                                        Spacer()
                                        
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundColor(.green)
                                            .font(.title2)
                                    }
                                } else {
                                    HStack {
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text("Haptics Not Supported")
                                                .font(.subheadline)
                                                .fontWeight(.medium)
                                                .foregroundColor(.secondary)
                                            
                                            Text("Your device doesn't support haptic feedback")
                                                .font(.caption)
                                                .foregroundColor(.secondary)
                                        }
                                        
                                        Spacer()
                                        
                                        Image(systemName: "exclamationmark.triangle")
                                            .foregroundColor(.orange)
                                            .font(.title2)
                                    }
                                }
                            }
                        }
                        
                        // App Information Section
                        SettingsCard(title: "App Information") {
                            VStack(spacing: 16) {
                                HStack {
                                    Text("Version")
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                    Spacer()
                                    Text(appVersion)
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                                
                                HStack {
                                    Text("Build")
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                    Spacer()
                                    Text(appBuild)
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                                
                                Button("Restore Purchases") {
                                    Task {
                                        await storeKitManager.restorePurchases()
                                    }
                                }
                                .font(.headline)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(
                                    RoundedRectangle(cornerRadius: 20)
                                        .fill(
                                            LinearGradient(
                                                gradient: Gradient(colors: [Color.blue, Color.purple]),
                                                startPoint: .leading,
                                                endPoint: .trailing
                                            )
                                        )
                                )
                                .disabled(storeKitManager.purchaseInProgress)
                            }
                        }
                        
                        #if DEBUG
                        // Debug Section (only in debug builds)
                        SettingsCard(title: "Debug") {
                            VStack(spacing: 16) {
                                VStack(spacing: 12) {
                                    Button(action: {
                                        storeKitManager.simulateProPurchase()
                                    }) {
                                        HStack {
                                            Text("Enable Premium (Debug)")
                                                .font(.subheadline)
                                                .fontWeight(.medium)
                                                .foregroundColor(.blue)
                                            
                                            Spacer()
                                            
                                            Image(systemName: "crown.fill")
                                                .font(.caption)
                                                .foregroundColor(.blue)
                                        }
                                        .padding(.vertical, 8)
                                    }
                                    
                                    Button(action: {
                                        storeKitManager.simulateProRevocation()
                                    }) {
                                        HStack {
                                            Text("Disable Premium (Debug)")
                                                .font(.subheadline)
                                                .fontWeight(.medium)
                                                .foregroundColor(.red)
                                            
                                            Spacer()
                                            
                                            Image(systemName: "xmark.circle.fill")
                                                .font(.caption)
                                                .foregroundColor(.red)
                                        }
                                        .padding(.vertical, 8)
                                    }
                                }
                            }
                        }
                        #endif
                        
                        // Support Section
                        SettingsCard(title: "Support") {
                            VStack(spacing: 16) {
                                VStack(spacing: 12) {
                                    SupportLink(title: "Privacy Policy", action: { showingPrivacyPolicy = true })
                                    SupportLink(title: "Terms of Service", action: { showingTermsOfService = true })
                                    SupportLink(title: "Contact Support", url: "mailto:elinstoneagency@gmail.com")
                                }
                            }
                        }
                        
                        // Bottom spacing
                        Color.clear
                            .frame(height: 30)
                    }
                    .padding(.horizontal, 20)
                }
            }
        }
        
         .sheet(isPresented: $showingPrivacyPolicy) {
             PrivacyPolicyView()
                 .environmentObject(backgroundColorManager)
         }
         .sheet(isPresented: $showingTermsOfService) {
             TermsOfServiceView()
                 .environmentObject(backgroundColorManager)
         }
         // TODO: Uncomment after adding ContactSupportView.swift to Xcode project
         // .sheet(isPresented: $showingContactSupport) {
         //     ContactSupportView()
         // }
        .alert("Purchase Error", isPresented: .constant(storeKitManager.errorMessage != nil)) {
            Button("OK") {
                storeKitManager.errorMessage = nil
            }
        } message: {
            if let errorMessage = storeKitManager.errorMessage {
                Text(errorMessage)
            }
        }
    }
}

// MARK: - Supporting Views

struct SettingsCard<Content: View>: View {
    let title: String
    let content: Content
    
    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title.uppercased())
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.white.opacity(0.9))
                .padding(.horizontal, 4)
            
            content
                .padding(20)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(.ultraThinMaterial)
                        .opacity(0.6)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
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
                        .shadow(color: .black.opacity(0.1), radius: 12, x: 0, y: 6)
                )
        }
    }
}

struct ProFeatureRow: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.blue)
                .font(.title3)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.white)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
            }
            
            Spacer()
        }
    }
}

struct SoundPackRow: View {
    let pack: AudioManager.SoundPack
    let isSelected: Bool
    let audioManager: AudioManager
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                Text(pack.emoji)
                    .font(.title2)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(pack.displayName)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.white)
                    
                    Text(pack.description)
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                }
                
                Spacer()
                
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.blue)
                        .font(.title3)
                } else {
                    Button("Preview") {
                        audioManager.playPreviewSound(for: pack.id)
                    }
                    .font(.caption)
                    .foregroundColor(.blue)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(
                        Capsule()
                            .fill(.ultraThinMaterial)
                            .opacity(0.3)
                    )
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(isSelected ? Color.blue.opacity(0.2) : Color.clear)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(isSelected ? Color.blue.opacity(0.5) : Color.white.opacity(0.1), lineWidth: 1)
                    )
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct SupportLink: View {
    let title: String
    let url: String?
    let action: (() -> Void)?
    
    init(title: String, url: String) {
        self.title = title
        self.url = url
        self.action = nil
    }
    
    init(title: String, action: @escaping () -> Void) {
        self.title = title
        self.url = nil
        self.action = action
    }
    
    var body: some View {
        if let url = url {
            Link(destination: URL(string: url)!) {
                linkContent
            }
        } else if let action = action {
            Button(action: action) {
                linkContent
            }
        }
    }
    
    private var linkContent: some View {
        HStack {
            Text(title)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.blue)
            
            Spacer()
            
            Image(systemName: "arrow.up.right")
                .font(.caption)
                .foregroundColor(.blue)
        }
        .padding(.vertical, 8)
    }
}

#Preview {
    SettingsView()
        .environmentObject(StoreKitManager())
        .environmentObject(AudioManager())
        .environmentObject(BackgroundColorManager())
}
