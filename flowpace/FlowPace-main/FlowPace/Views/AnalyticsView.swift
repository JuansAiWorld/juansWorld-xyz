import SwiftUI
import Charts

struct AnalyticsView: View {
    @EnvironmentObject var routineManager: RoutineManager
    @EnvironmentObject var storeKitManager: StoreKitManager
    
    @State private var selectedTimeRange: TimeRange = .week
    @State private var selectedMetric: MetricType = .duration
    
    enum TimeRange: String, CaseIterable {
        case week = "Week"
        case month = "Month"
        case year = "Year"
    }
    
    enum MetricType: String, CaseIterable {
        case duration = "Duration"
        case count = "Sessions"
        case streak = "Streak"
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    if !storeKitManager.isPro {
                        // Free user teaser
                        ProFeatureTeaser()
                    }
                    
                    // Time range selector
                    Picker("Time Range", selection: $selectedTimeRange) {
                        ForEach(TimeRange.allCases, id: \.self) { range in
                            Text(range.rawValue).tag(range)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    .padding(.horizontal)
                    
                    // Metric selector
                    Picker("Metric", selection: $selectedMetric) {
                        ForEach(MetricType.allCases, id: \.self) { metric in
                            Text(metric.rawValue).tag(metric)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    .padding(.horizontal)
                    
                    // Stats cards
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                        StatCard(title: "Total Sessions", value: "\(filteredCompletions.count)", icon: "checkmark.circle.fill", color: .green)
                        StatCard(title: "Total Time", value: totalTimeFormatted, icon: "clock.fill", color: .blue)
                        StatCard(title: "Current Streak", value: "\(currentStreak) days", icon: "flame.fill", color: .orange)
                        StatCard(title: "Avg Duration", value: averageDurationFormatted, icon: "chart.bar.fill", color: .purple)
                    }
                    .padding(.horizontal)
                    
                    // Chart
                    VStack(alignment: .leading, spacing: 12) {
                        Text("\(selectedMetric.rawValue) Over Time")
                            .font(.headline)
                            .padding(.horizontal)
                        
                        if #available(iOS 16.0, *) {
                            Chart(filteredCompletions) { completion in
                                BarMark(
                                    x: .value("Date", completion.completedAt, unit: .day),
                                    y: .value(selectedMetric.rawValue, metricValue(for: completion))
                                )
                                .foregroundStyle(Color.blue.gradient)
                            }
                            .frame(height: 200)
                            .padding(.horizontal)
                        } else {
                            // Fallback for iOS 15
                            Text("Charts require iOS 16+")
                                .foregroundColor(.secondary)
                                .padding()
                        }
                    }
                    
                    // Routine breakdown
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Routine Breakdown")
                            .font(.headline)
                            .padding(.horizontal)
                        
                        ForEach(routineBreakdown, id: \.name) { item in
                            HStack {
                                Text(item.name)
                                    .font(.subheadline)
                                Spacer()
                                Text("\(item.count) sessions")
                                    .foregroundColor(.secondary)
                                Text("(\(formatTime(item.totalTime)))")
                                    .foregroundColor(.secondary)
                                    .font(.caption)
                            }
                            .padding(.horizontal)
                            .padding(.vertical, 8)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                            .padding(.horizontal)
                        }
                    }
                    
                    // Export button (Pro only)
                    if storeKitManager.isPro {
                        Button(action: exportData) {
                            Label("Export Data (CSV)", systemImage: "square.and.arrow.up")
                                .font(.headline)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue)
                                .cornerRadius(10)
                        }
                        .padding(.horizontal)
                        .padding(.top)
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Analytics")
        }
    }
    
    // MARK: - Computed Properties
    
    var filteredCompletions: [CompletedRoutine] {
        let calendar = Calendar.current
        let now = Date()
        
        return routineManager.completedRoutines.filter { completion in
            switch selectedTimeRange {
            case .week:
                return calendar.isDate(completion.completedAt, equalTo: now, toGranularity: .weekOfYear)
            case .month:
                return calendar.isDate(completion.completedAt, equalTo: now, toGranularity: .month)
            case .year:
                return calendar.isDate(completion.completedAt, equalTo: now, toGranularity: .year)
            }
        }
    }
    
    var totalTimeFormatted: String {
        let total = filteredCompletions.reduce(0) { $0 + $1.totalDuration }
        return formatTime(total)
    }
    
    var averageDurationFormatted: String {
        guard !filteredCompletions.isEmpty else { return "0m" }
        let total = filteredCompletions.reduce(0) { $0 + $1.totalDuration }
        let avg = total / Double(filteredCompletions.count)
        return formatTime(avg)
    }
    
    var currentStreak: Int {
        let calendar = Calendar.current
        let sortedCompletions = routineManager.completedRoutines.sorted { $0.completedAt > $1.completedAt }
        var streak = 0
        var checkDate = Date()
        
        for completion in sortedCompletions {
            if calendar.isDate(completion.completedAt, inSameDayAs: checkDate) {
                streak += 1
                checkDate = calendar.date(byAdding: .day, value: -1, to: checkDate) ?? checkDate
            } else if calendar.isDateInYesterday(completion.completedAt) {
                streak += 1
                checkDate = completion.completedAt
            } else {
                break
            }
        }
        
        return streak
    }
    
    var routineBreakdown: [(name: String, count: Int, totalTime: TimeInterval)] {
        var breakdown: [String: (count: Int, totalTime: TimeInterval)] = [:]
        
        for completion in filteredCompletions {
            let current = breakdown[completion.routineName] ?? (0, 0)
            breakdown[completion.routineName] = (current.count + 1, current.totalTime + completion.totalDuration)
        }
        
        return breakdown.map { ($0.key, $0.value.count, $0.value.totalTime) }
            .sorted { $0.count > $1.count }
    }
    
    // MARK: - Helper Methods
    
    func metricValue(for completion: CompletedRoutine) -> Double {
        switch selectedMetric {
        case .duration:
            return completion.totalDuration / 60.0 // Convert to minutes
        case .count:
            return 1.0
        case .streak:
            return Double(currentStreak)
        }
    }
    
    func formatTime(_ timeInterval: TimeInterval) -> String {
        let minutes = Int(timeInterval) / 60
        let hours = minutes / 60
        let remainingMinutes = minutes % 60
        
        if hours > 0 {
            return "\(hours)h \(remainingMinutes)m"
        } else {
            return "\(minutes)m"
        }
    }
    
    func exportData() {
        // CSV export functionality
        var csv = "Date,Routine Name,Duration (minutes)\n"
        
        for completion in routineManager.completedRoutines {
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "yyyy-MM-dd HH:mm"
            let dateStr = dateFormatter.string(from: completion.completedAt)
            let durationMinutes = completion.totalDuration / 60.0
            csv += "\(dateStr),\(completion.routineName),\(String(format: "%.1f", durationMinutes))\n"
        }
        
        // Share the CSV file
        let tempDir = FileManager.default.temporaryDirectory
        let fileURL = tempDir.appendingPathComponent("FlowPace_Analytics.csv")
        
        do {
            try csv.write(to: fileURL, atomically: true, encoding: .utf8)
            // In a real app, you'd use UIActivityViewController to share
            print("CSV exported to: \(fileURL)")
        } catch {
            print("Failed to export CSV: \(error)")
        }
    }
}

// MARK: - Supporting Views

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Spacer()
            }
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct ProFeatureTeaser: View {
    @EnvironmentObject var storeKitManager: StoreKitManager
    
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "chart.line.uptrend.xyaxis")
                .font(.system(size: 40))
                .foregroundColor(.blue)
            
            Text("Unlock Advanced Analytics")
                .font(.headline)
            
            Text("Track streaks, trends, and export your data with FlowPace Pro")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Button(action: {
                // Show purchase options
            }) {
                Text("Upgrade to Pro")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.blue)
                    .cornerRadius(8)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

// MARK: - Preview

struct AnalyticsView_Previews: PreviewProvider {
    static var previews: some View {
        AnalyticsView()
            .environmentObject(RoutineManager())
            .environmentObject(StoreKitManager())
    }
}
