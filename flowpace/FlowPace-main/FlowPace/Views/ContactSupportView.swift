import SwiftUI

struct ContactSupportView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var emailText = ""
    @State private var subjectText = ""
    @State private var messageText = ""
    @State private var showingAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        ZStack {
            // Professional gradient background matching the app's aesthetic
            LinearGradient(
                gradient: Gradient(colors: [
                    Color.blue.opacity(0.15),
                    Color.indigo.opacity(0.1),
                    Color.purple.opacity(0.08)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("Contact Support")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    
                    Spacer()
                    
                    Button("Cancel") {
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
                        // Contact Information
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Get Help")
                                .font(.headline)
                                .fontWeight(.semibold)
                                .foregroundColor(.primary)
                            
                            VStack(alignment: .leading, spacing: 12) {
                                Text("We're here to help! Choose how you'd like to contact us:")
                                    .font(.body)
                                    .foregroundColor(.primary)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    ContactOption(
                                        icon: "envelope.fill",
                                        title: "Email Support",
                                        description: "support@flowpace.app",
                                        action: { openEmailApp() }
                                    )
                                    
                                    ContactOption(
                                        icon: "questionmark.circle.fill",
                                        title: "FAQ & Help",
                                        description: "Common questions and solutions",
                                        action: { showFAQ() }
                                    )
                                    
                                    ContactOption(
                                        icon: "star.fill",
                                        title: "Feature Request",
                                        description: "Suggest new features",
                                        action: { showFeatureRequest() }
                                    )
                                }
                            }
                            .padding(20)
                            .background(
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(Color(.systemBackground))
                                    .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
                            )
                        }
                        
                        // Response Time
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Response Time")
                                .font(.headline)
                                .fontWeight(.semibold)
                                .foregroundColor(.primary)
                            
                            VStack(alignment: .leading, spacing: 12) {
                                Text("We typically respond within:")
                                    .font(.body)
                                    .foregroundColor(.primary)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    ResponseTimeRow(time: "24 hours", description: "General inquiries")
                                    ResponseTimeRow(time: "48 hours", description: "Technical support")
                                    ResponseTimeRow(time: "1 week", description: "Feature requests")
                                }
                            }
                            .padding(20)
                            .background(
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(Color(.systemBackground))
                                    .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
                            )
                        }
                        
                        // Before You Contact Us
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Before You Contact Us")
                                .font(.headline)
                                .fontWeight(.semibold)
                                .foregroundColor(.primary)
                            
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Please include the following information:")
                                    .font(.body)
                                    .foregroundColor(.primary)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    InfoRow(text: "App version: \(appVersion)")
                                    InfoRow(text: "Device model and iOS version")
                                    InfoRow(text: "Detailed description of the issue")
                                    InfoRow(text: "Steps to reproduce the problem")
                                }
                            }
                            .padding(20)
                            .background(
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(Color(.systemBackground))
                                    .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
                            )
                        }
                        
                        // Bottom spacing
                        Color.clear
                            .frame(height: 30)
                    }
                    .padding(.horizontal, 20)
                }
            }
        }
        .alert("Contact Support", isPresented: $showingAlert) {
            Button("OK") { }
        } message: {
            Text(alertMessage)
        }
    }
    
    // App version information
    private var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "Unknown"
    }
    
    private func openEmailApp() {
        let email = "support@flowpace.app"
        let subject = "FlowPace Support Request"
        let body = """
        
        App Version: \(appVersion)
        Device: \(UIDevice.current.model)
        iOS Version: \(UIDevice.current.systemVersion)
        
        Please describe your issue or question below:
        
        
        """
        
        let encodedSubject = subject.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let encodedBody = body.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        
        if let url = URL(string: "mailto:\(email)?subject=\(encodedSubject)&body=\(encodedBody)") {
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url)
            } else {
                // Fallback: copy email to clipboard
                UIPasteboard.general.string = email
                alertMessage = "Email address copied to clipboard: \(email)"
                showingAlert = true
            }
        }
    }
    
    private func showFAQ() {
        alertMessage = "FAQ coming soon! For now, please email us at support@flowpace.app with your questions."
        showingAlert = true
    }
    
    private func showFeatureRequest() {
        alertMessage = "We'd love to hear your ideas! Please email us at support@flowpace.app with your feature requests."
        showingAlert = true
    }
}

struct ContactOption: View {
    let icon: String
    let title: String
    let description: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(.blue)
                    .frame(width: 30)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                    
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct ResponseTimeRow: View {
    let time: String
    let description: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text("•")
                .font(.title2)
                .foregroundColor(.blue)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(time)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

struct InfoRow: View {
    let text: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text("•")
                .font(.title2)
                .foregroundColor(.blue)
            
            Text(text)
                .font(.subheadline)
                .foregroundColor(.primary)
            
            Spacer()
        }
    }
}

#Preview {
    ContactSupportView()
}
