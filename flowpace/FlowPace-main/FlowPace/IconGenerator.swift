import SwiftUI

struct FlowPaceIcon: View {
    let size: CGFloat
    
    var body: some View {
        ZStack {
            // Background - light purple (lavender)
            Color(red: 0.85, green: 0.8, blue: 0.95)
                .frame(width: size, height: size)
            
            // Purple F shape - irregular rounded trapezoid
            Path { path in
                // Create an irregular rounded trapezoid shape that's wider at top
                let topWidth = size * 0.8
                let bottomWidth = size * 0.6
                let height = size * 0.7
                let topY = size * 0.15
                let bottomY = topY + height
                
                // Top left corner
                path.move(to: CGPoint(x: (size - topWidth) / 2, y: topY))
                
                // Top edge
                path.addLine(to: CGPoint(x: (size + topWidth) / 2, y: topY))
                
                // Top right corner
                path.addArc(center: CGPoint(x: (size + topWidth) / 2 - size * 0.08, y: topY + size * 0.08),
                           radius: size * 0.08, startAngle: Angle(degrees: -90), endAngle: Angle(degrees: 0), clockwise: false)
                
                // Right edge (tapering down)
                path.addLine(to: CGPoint(x: (size + bottomWidth) / 2, y: bottomY - size * 0.08))
                
                // Bottom right corner
                path.addArc(center: CGPoint(x: (size + bottomWidth) / 2 - size * 0.08, y: bottomY - size * 0.08),
                           radius: size * 0.08, startAngle: Angle(degrees: 0), endAngle: Angle(degrees: 90), clockwise: false)
                
                // Bottom edge
                path.addLine(to: CGPoint(x: (size - bottomWidth) / 2 + size * 0.08, y: bottomY))
                
                // Bottom left corner
                path.addArc(center: CGPoint(x: (size - bottomWidth) / 2 + size * 0.08, y: bottomY - size * 0.08),
                           radius: size * 0.08, startAngle: Angle(degrees: 90), endAngle: Angle(degrees: 180), clockwise: false)
                
                // Left edge (tapering up)
                path.addLine(to: CGPoint(x: (size - topWidth) / 2 + size * 0.08, y: topY + size * 0.08))
                
                // Top left corner
                path.addArc(center: CGPoint(x: (size - topWidth) / 2 + size * 0.08, y: topY + size * 0.08),
                           radius: size * 0.08, startAngle: Angle(degrees: 180), endAngle: Angle(degrees: 270), clockwise: false)
            }
            .fill(Color(red: 0.7, green: 0.6, blue: 0.9)) // Light purple color
            
            // White F letter
            Text("F")
                .font(.system(size: size * 0.4, weight: .bold, design: .default))
                .foregroundColor(.white)
                .offset(x: size * 0.05, y: -size * 0.02) // Slight offset to center
        }
        .clipShape(RoundedRectangle(cornerRadius: size * 0.2))
    }
}

#Preview {
    VStack(spacing: 20) {
        FlowPaceIcon(size: 100)
        FlowPaceIcon(size: 60)
        FlowPaceIcon(size: 40)
    }
    .padding()
}
