# FlowPace iOS App

**The most flexible and polished interval timer on the App Store**

FlowPace empowers users to build any timed sequence they can imagine, wrapped in a beautiful and intuitive iOS-native experience.

## 🎯 Features

### Core Features

- **Create, Save, Edit, Delete Routines** - Full CRUD operations for custom timer routines
- **Flexible Step System** - Add individual timed steps with custom names, durations, and colors
- **Group Loops** - Create repeating groups of steps with customizable loop counts
- **Drag & Drop Reordering** - Intuitive gesture-based editing with standard iOS list reordering
- **High-Visibility Timer** - Large, clear display optimized for active workouts and activities

### Pro Features (In-App Purchase)

- **Unlimited Routine Saves** - Free version limited to 3 routines
- **Premium Sound Packs** - Themed audio collections (Calm, Intense, Retro Arcade)
- **Voice Cues** - Text-to-speech announcements for step names and countdowns

### Technical Features

- **100% Offline** - No internet connection required
- **Haptic Feedback** - Taptic Engine integration for tactile cues
- **Audio Management** - System sounds and voice synthesis
- **StoreKit Integration** - Secure in-app purchase handling

## 🏗️ Project Structure

```
FlowPace/
├── FlowPace.xcodeproj/          # Xcode project file
├── FlowPace/                    # Main app source
│   ├── FlowPaceApp.swift        # App entry point
│   ├── ContentView.swift        # Main navigation container
│   ├── Views/                   # UI Views
│   │   ├── RoutineListView.swift    # Home screen with routine list
│   │   ├── RoutineEditorView.swift  # Routine builder interface
│   │   ├── ActiveTimerView.swift    # Active timer display
│   │   ├── AddStepView.swift        # Step creation interface
│   │   ├── AddGroupView.swift       # Group creation interface
│   │   ├── EditItemView.swift       # Item editing interface
│   │   └── SettingsView.swift       # App settings and Pro upgrade
│   ├── Models/                  # Data models
│   │   └── Models.swift         # Core data structures
│   ├── Managers/                # Business logic managers
│   │   ├── RoutineManager.swift     # Routine CRUD operations
│   │   ├── TimerManager.swift       # Timer logic and state
│   │   ├── AudioManager.swift       # Audio playback and voice
│   │   ├── HapticManager.swift      # Haptic feedback
│   │   └── StoreKitManager.swift    # In-app purchases
│   ├── Assets.xcassets/         # App icons and colors
│   ├── FlowPace.entitlements    # App capabilities
│   └── Info.plist               # App configuration
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

- Xcode 15.0+ (iOS 17.0+ deployment target)
- macOS 14.0+
- iOS Simulator or physical device

### Installation

1. Clone the repository
2. Open `FlowPace.xcodeproj` in Xcode
3. Select your development team in project settings
4. Build and run on simulator or device

### First Run

- The app will start with no routines
- Tap the "+" button to create your first routine
- Add steps and groups to build your timer sequence
- Save and start your routine

## 🎨 Architecture

### Design Patterns

- **MVVM** - Model-View-ViewModel architecture
- **SwiftUI** - Modern declarative UI framework
- **Combine** - Reactive programming for data flow
- **@MainActor** - Main thread safety for UI updates

### Data Flow

1. **Models** define the data structures (Routine, Step, Group)
2. **Managers** handle business logic and state management
3. **Views** observe managers and update the UI
4. **User interactions** flow back through managers to update state

### Key Components

- **RoutineManager** - Handles routine persistence using UserDefaults
- **TimerManager** - Manages timer state, step progression, and timing logic
- **AudioManager** - Controls audio playback and voice synthesis
- **HapticManager** - Provides tactile feedback using Core Haptics
- **StoreKitManager** - Handles Pro version purchases and restoration

## 🔧 Configuration

### App Capabilities

- In-App Purchase support
- Associated domains for deep linking
- Background audio (if needed for future features)

### Permissions

- Microphone access for voice cues
- Camera access for potential QR code features

### StoreKit Setup

1. Configure product ID: `com.flowpace.pro`
2. Set up App Store Connect product
3. Test with StoreKit testing framework

## 📱 User Experience

### Routine Creation Flow

1. **Name Your Routine** - Give it a descriptive name
2. **Add Steps** - Individual timed elements with colors
3. **Create Groups** - Repeating sequences with loop counts
4. **Reorder & Edit** - Drag to reorder, tap to edit
5. **Save & Start** - Save your routine and begin timing

### Active Timer Experience

- **Large Display** - Optimized for visibility during activities
- **Color Coding** - Background changes with each step
- **Progress Indicators** - Circular and linear progress bars
- **Audio & Haptic** - Multi-sensory feedback for step changes

### Settings & Customization

- Audio preferences (enable/disable, volume)
- Haptic feedback settings
- Pro version management
- Purchase restoration

## 🧪 Testing

### Development Testing

- Use Xcode's built-in testing framework
- Test on multiple device sizes and orientations
- Verify haptic feedback on supported devices
- Test audio features with different volume levels

### StoreKit Testing

- Use StoreKit testing framework for in-app purchase testing
- Test purchase flow, restoration, and Pro feature unlocking
- Verify free version limitations (3 routine limit)

## 🚀 Deployment

### App Store Preparation

1. Update version and build numbers
2. Configure App Store Connect metadata
3. Test on physical devices
4. Submit for review

### Release Notes

- **v1.0** - Initial release with core features
- **v1.1** - Voice cues and premium sound packs
- **Future** - watchOS companion, lock screen widgets, HealthKit integration

## 🤝 Contributing

### Development Guidelines

- Follow SwiftUI best practices
- Use semantic naming conventions
- Maintain MVVM architecture
- Add comprehensive documentation
- Include preview providers for SwiftUI views

### Code Style

- Use SwiftLint for consistent formatting
- Follow Apple's Human Interface Guidelines
- Implement proper error handling
- Use appropriate access control levels

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

- **Email**: coming soon!!
- **Website**: coming soon?
- **Documentation**: [Link to documentation]

---

**Built with ❤️ using SwiftUI and modern iOS development practices**
