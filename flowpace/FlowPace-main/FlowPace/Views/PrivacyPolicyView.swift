import SwiftUI

struct PrivacyPolicyView: View {
    @EnvironmentObject var backgroundColorManager: BackgroundColorManager
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        ZStack {
            // Dynamic gradient background based on user preference
            backgroundColorManager.backgroundGradient
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("Privacy Policy")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    
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
                
                // Content
                ScrollView(.vertical, showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 24) {
                        // Introduction
                        PolicySection(title: "Introduction") {
                            Text("FlowPace is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our interval timer application.")
                                .font(.body)
                                .foregroundColor(.primary)
                        }
                        
                        // Information We Collect
                        PolicySection(title: "Information We Collect") {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("FlowPace collects minimal personal information:")
                                    .font(.body)
                                    .foregroundColor(.primary)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    PolicyBulletPoint(text: "App usage data to improve functionality")
                                    PolicyBulletPoint(text: "Purchase information for Pro features")
                                    PolicyBulletPoint(text: "Device information for app optimization")
                                    PolicyBulletPoint(text: "No personal routines or timer data is collected")
                                }
                            }
                        }
                        
                        // How We Use Information
                        PolicySection(title: "How We Use Information") {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("We use collected information to:")
                                    .font(.body)
                                    .foregroundColor(.primary)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    PolicyBulletPoint(text: "Provide and maintain the FlowPace app")
                                    PolicyBulletPoint(text: "Process Pro feature purchases")
                                    PolicyBulletPoint(text: "Improve app performance and user experience")
                                    PolicyBulletPoint(text: "Send important app updates and notifications")
                                }
                            }
                        }
                        
                        // Data Security
                        PolicySection(title: "Data Security") {
                            Text("We implement appropriate security measures to protect your information. Your data is stored locally on your device and is not transmitted to external servers unless necessary for app functionality.")
                                .font(.body)
                                .foregroundColor(.primary)
                        }
                        
                        // Third-Party Services
                        PolicySection(title: "Third-Party Services") {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("FlowPace may use third-party services for:")
                                    .font(.body)
                                    .foregroundColor(.primary)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    PolicyBulletPoint(text: "App Store purchases and subscriptions")
                                    PolicyBulletPoint(text: "Analytics to improve app performance")
                                    PolicyBulletPoint(text: "Crash reporting for bug fixes")
                                }
                                
                                Text("These services have their own privacy policies.")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                    .padding(.top, 8)
                            }
                        }
                        
                        // Your Rights
                        PolicySection(title: "Your Rights") {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("You have the right to:")
                                    .font(.body)
                                    .foregroundColor(.primary)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    PolicyBulletPoint(text: "Access your personal data")
                                    PolicyBulletPoint(text: "Request data deletion")
                                    PolicyBulletPoint(text: "Opt out of data collection")
                                    PolicyBulletPoint(text: "Contact us with privacy concerns")
                                }
                            }
                        }
                        
                        // Contact Information
                        PolicySection(title: "Contact Us") {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("If you have questions about this Privacy Policy, please contact us:")
                                    .font(.body)
                                    .foregroundColor(.primary)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    PolicyBulletPoint(text: "Email: support@flowpace.app")
                                    PolicyBulletPoint(text: "We will respond within 48 hours")
                                }
                            }
                        }
                        
                        // Updates
                        PolicySection(title: "Updates to This Policy") {
                            Text("We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy in the app. You are advised to review this policy periodically.")
                                .font(.body)
                                .foregroundColor(.primary)
                        }
                        
                        // Last Updated
                        PolicySection(title: "Last Updated") {
                            Text("This Privacy Policy was last updated on August 31, 2024.")
                                .font(.body)
                                .foregroundColor(.primary)
                        }
                        
                        // Bottom spacing
                        Color.clear
                            .frame(height: 30)
                    }
                    .padding(.horizontal, 20)
                }
            }
        }
    }
}

struct PolicySection<Content: View>: View {
    let title: String
    let content: Content
    
    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            content
                .padding(20)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color(.systemBackground))
                        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
                )
        }
    }
}

struct PolicyBulletPoint: View {
    let text: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "circle.fill")
                .font(.system(size: 6))
                .foregroundColor(.blue)
                .padding(.top, 6)
            
            Text(text)
                .font(.body)
                .foregroundColor(.primary)
            
            Spacer()
        }
    }
}

#Preview {
    PrivacyPolicyView()
}
