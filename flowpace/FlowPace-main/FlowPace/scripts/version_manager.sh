#!/bin/bash

# FlowPace Version & Build Number Manager
# This script manages both marketing version and build numbers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 FlowPace Version & Build Manager${NC}"
echo "=========================================="

# Get the project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_FILE="$PROJECT_DIR/../FlowPace.xcodeproj/project.pbxproj"

# Check if project file exists
if [ ! -f "$PROJECT_FILE" ]; then
    echo -e "${RED}❌ Error: Project file not found at $PROJECT_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Project file: $PROJECT_FILE${NC}"

# Function to get current values
get_current_values() {
    CURRENT_VERSION=$(grep "MARKETING_VERSION = " "$PROJECT_FILE" | head -1 | sed 's/.*MARKETING_VERSION = \([0-9.]*\);/\1/')
    CURRENT_BUILD=$(grep "CURRENT_PROJECT_VERSION = " "$PROJECT_FILE" | head -1 | sed 's/.*CURRENT_PROJECT_VERSION = \([0-9]*\);/\1/')
    
    if [ -z "$CURRENT_VERSION" ] || [ -z "$CURRENT_BUILD" ]; then
        echo -e "${RED}❌ Error: Could not find version or build number in project file${NC}"
        exit 1
    fi
}

# Function to display current values
show_current_values() {
    echo -e "${YELLOW}📱 Current version: $CURRENT_VERSION${NC}"
    echo -e "${YELLOW}🔢 Current build: $CURRENT_BUILD${NC}"
}

# Function to increment build number
increment_build() {
    NEW_BUILD=$((CURRENT_BUILD + 1))
    echo -e "${GREEN}🆕 New build number: $NEW_BUILD${NC}"
    
    # Update all instances of CURRENT_PROJECT_VERSION
    sed -i '' "s/CURRENT_PROJECT_VERSION = $CURRENT_BUILD;/CURRENT_PROJECT_VERSION = $NEW_BUILD;/g" "$PROJECT_FILE"
    
    # Verify update
    UPDATED_BUILD=$(grep "CURRENT_PROJECT_VERSION = " "$PROJECT_FILE" | head -1 | sed 's/.*CURRENT_PROJECT_VERSION = \([0-9]*\);/\1/')
    
    if [ "$UPDATED_BUILD" = "$NEW_BUILD" ]; then
        echo -e "${GREEN}✅ Successfully updated build number to $NEW_BUILD${NC}"
    else
        echo -e "${RED}❌ Error: Failed to update build number${NC}"
        exit 1
    fi
}

# Function to update version number
update_version() {
    local new_version=$1
    
    if [[ ! $new_version =~ ^[0-9]+\.[0-9]+(\.[0-9]+)?$ ]]; then
        echo -e "${RED}❌ Error: Invalid version format. Use format: X.Y or X.Y.Z${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}🆕 New version: $new_version${NC}"
    
    # Update all instances of MARKETING_VERSION
    sed -i '' "s/MARKETING_VERSION = $CURRENT_VERSION;/MARKETING_VERSION = $new_version;/g" "$PROJECT_FILE"
    
    # Verify update
    UPDATED_VERSION=$(grep "MARKETING_VERSION = " "$PROJECT_FILE" | head -1 | sed 's/.*MARKETING_VERSION = \([0-9.]*\);/\1/')
    
    if [ "$UPDATED_VERSION" = "$new_version" ]; then
        echo -e "${GREEN}✅ Successfully updated version to $new_version${NC}"
    else
        echo -e "${RED}❌ Error: Failed to update version${NC}"
        exit 1
    fi
}

# Function to show all values in project
show_all_values() {
    echo -e "${BLUE}📋 All version numbers in project:${NC}"
    grep "MARKETING_VERSION = " "$PROJECT_FILE" | sed 's/.*MARKETING_VERSION = \([0-9.]*\);/\1/' | sort -u
    
    echo -e "${BLUE}📋 All build numbers in project:${NC}"
    grep "CURRENT_PROJECT_VERSION = " "$PROJECT_FILE" | sed 's/.*CURRENT_PROJECT_VERSION = \([0-9]*\);/\1/' | sort -u
}

# Function to show help
show_help() {
    echo -e "${BLUE}Usage:${NC}"
    echo "  $0 [command] [options]"
    echo ""
    echo -e "${BLUE}Commands:${NC}"
    echo "  build                    Increment build number"
    echo "  version <new_version>    Update version number (e.g., 1.1)"
    echo "  show                     Show current version and build"
    echo "  all                      Show all version/build numbers in project"
    echo "  help                     Show this help message"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  $0 build                 # Increment build number"
    echo "  $0 version 1.1           # Update version to 1.1"
    echo "  $0 version 1.2.0         # Update version to 1.2.0"
    echo "  $0 show                  # Show current values"
}

# Main script logic
get_current_values

case "${1:-build}" in
    "build")
        echo -e "${PURPLE}🔄 Incrementing build number...${NC}"
        show_current_values
        increment_build
        ;;
    "version")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Error: Please provide a new version number${NC}"
            echo "Usage: $0 version <new_version>"
            exit 1
        fi
        echo -e "${PURPLE}🔄 Updating version number...${NC}"
        show_current_values
        update_version "$2"
        ;;
    "show")
        show_current_values
        ;;
    "all")
        show_all_values
        ;;
    "help"|"-h"|"--help")
        show_help
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Error: Unknown command '$1'${NC}"
        show_help
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Operation complete!${NC}"
echo -e "${YELLOW}💡 Tip: Run '$0 build' before each build to keep build numbers current${NC}"
