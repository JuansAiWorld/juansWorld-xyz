# FlowPace Version & Build Management

This directory contains scripts and tools to automatically manage your FlowPace app's version and build numbers.

## 🚀 Quick Start

### Option 1: Using Make (Recommended)
```bash
# Show current version and build
make show-version

# Increment build number
make increment-build

# Build with incremented build number
make build

# Or do both at once
make quick-build
```

### Option 2: Using Scripts Directly
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Show current version and build
./scripts/version_manager.sh show

# Increment build number
./scripts/version_manager.sh build

# Update version number
./scripts/version_manager.sh version 1.1
```

## 📱 What Gets Updated

The scripts automatically update these values in your `FlowPace.xcodeproj/project.pbxproj`:

- **MARKETING_VERSION**: The version users see (e.g., "1.0")
- **CURRENT_PROJECT_VERSION**: The build number (e.g., "1", "2", "3")

## 🔧 Available Commands

### Version Manager Script (`version_manager.sh`)

| Command | Description | Example |
|---------|-------------|---------|
| `build` | Increment build number | `./scripts/version_manager.sh build` |
| `version <ver>` | Update version number | `./scripts/version_manager.sh version 1.1` |
| `show` | Show current values | `./scripts/version_manager.sh show` |
| `all` | Show all values in project | `./scripts/version_manager.sh all` |
| `help` | Show help message | `./scripts/version_manager.sh help` |

### Makefile Commands

| Command | Description |
|---------|-------------|
| `make help` | Show available commands |
| `make show-version` | Display current version info |
| `make increment-build` | Increment build number |
| `make increment-version` | Increment version number |
| `make build` | Build the project |
| `make quick-build` | Increment build + build project |
| `make clean` | Clean build artifacts |

## 📋 Workflow Examples

### Daily Development
```bash
# Before each build, increment the build number
make increment-build

# Then build your project
make build
```

### Release Preparation
```bash
# Update to new version (e.g., 1.0 -> 1.1)
./scripts/version_manager.sh version 1.1

# Reset build number to 1 for new version
# (You can manually edit project.pbxproj or use sed)

# Build release version
make build
```

### Automated CI/CD
```bash
# In your CI pipeline, automatically increment build
./scripts/version_manager.sh build

# Build and archive
xcodebuild -project FlowPace.xcodeproj -target FlowPace archive
```

## 🎯 Best Practices

1. **Always increment build number before building** for distribution
2. **Use semantic versioning** (MAJOR.MINOR.PATCH)
3. **Reset build number to 1** when releasing a new version
4. **Commit version changes** to your repository
5. **Use the Makefile** for consistency across your team

## 🔍 How It Works

The scripts:
1. Parse your `project.pbxproj` file
2. Find current version and build numbers
3. Increment or update as requested
4. Update all instances in the project file
5. Verify the changes were applied correctly

## 🚨 Troubleshooting

### Script Permission Issues
```bash
chmod +x scripts/*.sh
```

### Project File Not Found
Ensure you're running from the FlowPace project root directory.

### Version Format Errors
Use proper semantic versioning: `X.Y` or `X.Y.Z` (e.g., `1.0`, `1.1.0`)

### Build Number Not Updating
Check that your project file contains `CURRENT_PROJECT_VERSION` entries.

## 📚 Additional Resources

- [Apple's Versioning Guidelines](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/TP40009249-SW1)
- [Semantic Versioning](https://semver.org/)
- [Xcode Project File Format](https://developer.apple.com/library/archive/documentation/DeveloperTools/Reference/XcodeBuildSystem/)

## 🤝 Contributing

Feel free to enhance these scripts! Common improvements:
- Git integration (auto-commit version changes)
- Release notes generation
- Multiple project support
- CI/CD integration helpers
