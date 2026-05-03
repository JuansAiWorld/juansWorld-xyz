# FlowPace App Icon Generation Guide

## Overview
This guide will help you create the proper app icon files from your FlowPace logo for iOS.

## Required Icon Sizes
Based on your `AppIcon.appiconset/Contents.json`, you need these sizes:

### iPhone Icons
- **20x20** @2x = **40x40** pixels
- **20x20** @3x = **60x60** pixels  
- **29x29** @2x = **58x58** pixels
- **29x29** @3x = **87x87** pixels
- **40x40** @2x = **80x80** pixels
- **40x40** @3x = **120x120** pixels
- **60x60** @2x = **120x120** pixels
- **60x60** @3x = **180x180** pixels

### iPad Icons
- **20x20** @1x = **20x20** pixels
- **20x20** @2x = **40x40** pixels
- **29x29** @1x = **29x29** pixels
- **29x29** @2x = **58x58** pixels
- **40x40** @1x = **40x40** pixels
- **40x40** @2x = **80x80** pixels
- **76x76** @2x = **152x152** pixels
- **83.5x83.5** @2x = **167x167** pixels

### App Store Icon
- **1024x1024** pixels (1x)

## Design Specifications
Based on your logo:
- **Background**: Light purple (lavender) color
- **Icon Shape**: Light purple irregular rounded trapezoid with the white "F"
- **Shape Details**: Wider at the top, tapering toward the bottom with smooth rounded corners
- **Corner Radius**: iOS automatically applies corner radius, so keep your icon square
- **Safe Area**: Keep important elements within the center 80% of the image

## Steps to Create Icons

### Option 1: Use Design Software (Recommended)
1. **Open your logo in design software** (Photoshop, Figma, Sketch, etc.)
2. **Create a square canvas** for each required size
3. **Place your logo** centered on the canvas
4. **Export as PNG** with transparent background (if possible)
5. **Name files** according to size (e.g., `icon-40x40.png`, `icon-120x120.png`)

### Option 2: Use Online Icon Generators
- **App Icon Generator**: https://appicon.co/
- **MakeAppIcon**: https://makeappicon.com/
- **Icon Kitchen**: https://icon.kitchen/

### Option 3: Use the SwiftUI Icon Generator
I've created a `FlowPaceIcon.swift` file that generates the icon programmatically. You can:
1. **Run the app in simulator**
2. **Take screenshots** of the icon at different sizes
3. **Crop and save** as PNG files

## File Naming Convention
For Xcode to recognize your icons, name them like this:
- `icon-20x20@2x.png` (40x40 pixels)
- `icon-20x20@3x.png` (60x60 pixels)
- `icon-29x29@2x.png` (58x58 pixels)
- `icon-29x29@3x.png` (87x87 pixels)
- `icon-40x40@2x.png` (80x80 pixels)
- `icon-40x40@3x.png` (120x120 pixels)
- `icon-60x60@2x.png` (120x120 pixels)
- `icon-60x60@3x.png` (180x180 pixels)
- `icon-76x76@2x.png` (152x152 pixels)
- `icon-83.5x83.5@2x.png` (167x167 pixels)
- `icon-1024x1024.png` (1024x1024 pixels)

## Adding Icons to Xcode
1. **Drag and drop** your icon files into the `AppIcon.appiconset` folder
2. **Xcode will automatically** assign them to the correct sizes
3. **Verify** that all required sizes are filled in the Assets catalog

## Testing Your Icon
1. **Build and run** the app in simulator
2. **Check the home screen** to see your icon
3. **Verify** it looks good at different sizes

## Tips
- **Start with the largest size** (1024x1024) and scale down
- **Use PNG format** for best quality
- **Avoid transparency** in the final icon files
- **Test on different devices** to ensure it looks good
- **Keep it simple** - complex details may not be visible at small sizes
