# FlowPace Makefile
# Easy commands for building and version management

.PHONY: help build increment-version increment-build clean show-version

# Default target
help:
	@echo "🚀 FlowPace Build & Version Management"
	@echo "====================================="
	@echo ""
	@echo "Available commands:"
	@echo "  make build              # Build the project"
	@echo "  make increment-build    # Increment build number"
	@echo "  make increment-version  # Increment version number"
	@echo "  make show-version       # Show current version and build"
	@echo "  make clean              # Clean build artifacts"
	@echo "  make help               # Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  make increment-build    # Bump build number"
	@echo "  make increment-version  # Bump version (e.g., 1.0 -> 1.1)"
	@echo "  make build              # Build with updated numbers"

# Build the project
build:
	@echo "🔨 Building FlowPace..."
	xcodebuild -project FlowPace.xcodeproj -target FlowPace -sdk iphonesimulator build

# Increment build number
increment-build:
	@echo "🔢 Incrementing build number..."
	@chmod +x FlowPace/scripts/version_manager.sh
	@cd FlowPace && ./scripts/version_manager.sh build

# Increment version number
increment-version:
	@echo "📱 Incrementing version number..."
	@chmod +x FlowPace/scripts/version_manager.sh
	@cd FlowPace && ./scripts/version_manager.sh version $(shell cd FlowPace && ./scripts/version_manager.sh show | grep "Current version:" | sed 's/.*Current version: \([0-9.]*\)/\1/' | awk -F. '{print $$1"."$$2"."$$3+1}')

# Show current version and build
show-version:
	@echo "📋 Current version information:"
	@chmod +x FlowPace/scripts/version_manager.sh
	@cd FlowPace && ./scripts/version_manager.sh show

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf build/
	rm -rf DerivedData/
	@echo "✅ Clean complete!"

# Quick build with auto-increment
quick-build: increment-build build
	@echo "🚀 Quick build complete with incremented build number!"
