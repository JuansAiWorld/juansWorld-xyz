import SwiftUI

struct TermsOfServiceView: View {
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
                    Text("Terms of Service")
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
                        PolicySection(title: "Acceptance of Terms") {
                            Text("By downloading, installing, or using FlowPace, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.")
                                .font(.body)
                                .foregroundColor(.primary)
                        }
                        
                        // App Description
                        PolicySection(title: "App Description") {
                            Text("FlowPace is an interval timer application designed to help users create and manage professional workout routines, productivity sessions, and timed activities. The app provides both free and premium features.")
                                .font(.body)
                                .foregroundColor(.primary)
                        }
                        
                        // User Accounts
                        PolicySection(title: "User Accounts") {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("When using FlowPace:")
                                    .font(.body)
                                    .foregroundColor(.primary)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    PolicyBulletPoint(text: "You are responsible for maintaining account security")
                                    PolicyBulletPoint(text: "You must provide accurate information")
                                    PolicyBulletPoint(text: "You are responsible for all activities under your account")
                                    PolicyBulletPoint(text: "You must be at least 13 years old to use the app")
                                }
                            }
                        }
                        
                        // Acceptable Use
                        PolicySection(title: "Acceptable Use") {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("You agree not to:")
                                    .font(.body)
                                    .foregroundColor(.primary)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    PolicyBulletPoint(text: "Use the app for illegal or harmful purposes")
                                    PolicyBulletPoint(text: "Attempt to reverse engineer or hack the app")
                                    PolicyBulletPoint(text: "Share your account with unauthorized users")
                                    PolicyBulletPoint(text: "Use the app to harm others or violate their rights")
                                }
                            }
                        }
                        
                        // Pro Features
                         PolicySection(title: "Pro Features") {
                             VStack(alignment: .leading, spacing: 12) {
                                 Text("FlowPace Pro offers premium features:")
                                     .font(.body)
                                     .foregroundColor(.primary)
                                 
                                 VStack(alignment: .leading, spacing: 8) {
                                     PolicyBulletPoint(text: "iCloud Sync - Sync routines across all your Apple devices")
                                     PolicyBulletPoint(text: "Advanced Analytics - Track streaks, trends, and export data")
                                     PolicyBulletPoint(text: "Unlimited Routines - Create as many routines as you need")
                                     PolicyBulletPoint(text: "Home Screen Widgets - Quick-start routines from your home screen")
                                     PolicyBulletPoint(text: "All sound packs and voice cues included")
                                 }
                                 
                                 Text("Pro features require a valid subscription through the App Store.")
                                     .font(.caption)
                                     .foregroundColor(.secondary)
                                     .padding(.top, 8)
                             }
                         }
                        
                        // Payment Terms
                        PolicySection(title: "Payment Terms") {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Payment and subscription details:")
                                    .font(.body)
                                    .foregroundColor(.primary)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    PolicyBulletPoint(text: "Pro subscriptions are managed through Apple")
                                    PolicyBulletPoint(text: "Prices are subject to change with notice")
                                    PolicyBulletPoint(text: "Subscriptions auto-renew unless cancelled")
                                    PolicyBulletPoint(text: "Refunds are subject to Apple's policies")
                                }
                            }
                        }
                        
                        // Intellectual Property
                        PolicySection(title: "Intellectual Property") {
                            Text("FlowPace and its content, including but not limited to text, graphics, logos, and software, are the property of FlowPace and are protected by copyright and other intellectual property laws. You may not copy, modify, or distribute any part of the app without permission.")
                                .font(.body)
                                .foregroundColor(.primary)
                        }
                        
                        // Privacy
                        PolicySection(title: "Privacy") {
                            Text("Your privacy is important to us. Please review our Privacy Policy, which also governs your use of FlowPace, to understand our practices regarding the collection and use of your information.")
                                .font(.body)
                                .foregroundColor(.primary)
                        }
                        
                        // Disclaimers
                        PolicySection(title: "Disclaimers") {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("FlowPace is provided 'as is' without warranties:")
                                    .font(.body)
                                    .foregroundColor(.primary)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    PolicyBulletPoint(text: "The app may not be error-free or uninterrupted")
                                    PolicyBulletPoint(text: "We do not guarantee specific results")
                                    PolicyBulletPoint(text: "Use at your own risk and discretion")
                                    PolicyBulletPoint(text: "Not intended as medical or professional advice")
                                }
                            }
                        }
                        
                        // Limitation of Liability
                        PolicySection(title: "Limitation of Liability") {
                            Text("FlowPace shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or relating to your use of the app.")
                                .font(.body)
                                .foregroundColor(.primary)
                        }
                        
                        // Termination
                        PolicySection(title: "Termination") {
                            Text("We may terminate or suspend your access to FlowPace immediately, without prior notice, for any reason, including breach of these Terms of Service. Upon termination, your right to use the app will cease immediately.")
                                .font(.body)
                                .foregroundColor(.primary)
                        }
                        
                        // Changes to Terms
                        PolicySection(title: "Changes to Terms") {
                            Text("We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes through the app. Your continued use of FlowPace after changes constitutes acceptance of the new terms.")
                                .font(.body)
                                .foregroundColor(.primary)
                        }
                        
                        // Contact Information
                        PolicySection(title: "Contact Information") {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("For questions about these Terms of Service:")
                                    .font(.body)
                                    .foregroundColor(.primary)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    PolicyBulletPoint(text: "Email: support@flowpace.app")
                                    PolicyBulletPoint(text: "We will respond within 48 hours")
                                }
                            }
                        }
                        
                        // Governing Law
                        PolicySection(title: "Governing Law") {
                            Text("These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which FlowPace operates, without regard to its conflict of law provisions.")
                                .font(.body)
                                .foregroundColor(.primary)
                        }
                        
                        // Last Updated
                        PolicySection(title: "Last Updated") {
                            Text("These Terms of Service were last updated on August 31, 2024.")
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

#Preview {
    TermsOfServiceView()
}
