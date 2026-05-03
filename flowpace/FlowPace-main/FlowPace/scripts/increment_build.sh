#!/bin/bash

# FlowPace Build Number Incrementer
# This script automatically increments the build number in your Xcode project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 FlowPace Build Number Incrementer${NC}"
echo "=================================="

# Get the project directory (assuming script is in FlowPace/scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_FILE="$PROJECT_DIR/FlowPace.xcodeproj/project.pbxproj"

# Check if project file exists
if [ ! -f "$PROJECT_FILE" ]; then
    echo -e "${RED}❌ Error: Project file not found at $PROJECT_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Project file: $PROJECT_FILE${NC}"

# Get current build number
CURRENT_BUILD=$(grep "CURRENT_PROJECT_VERSION = " "$PROJECT_FILE" | head -1 | sed 's/.*CURRENT_PROJECT_VERSION = \([0-9]*\);/\1/')

if [ -z "$CURRENT_BUILD" ]; then
    echo -e "${RED}❌ Error: Could not find CURRENT_PROJECT_VERSION in project file${NC}"
    exit 1
fi

echo -e "${YELLOW}📱 Current build number: $CURRENT_BUILD${NC}"

# Increment build number
NEW_BUILD=$((CURRENT_BUILD + 1))

echo -e "${GREEN}🆕 New build number: $NEW_BUILD${NC}"

# Update all instances of CURRENT_PROJECT_VERSION in the project file
sed -i '' "s/CURRENT_PROJECT_VERSION = $CURRENT_BUILD;/CURRENT_PROJECT_VERSION = $NEW_BUILD;/g" "$PROJECT_FILE"

# Verify the update
UPDATED_BUILD=$(grep "CURRENT_PROJECT_VERSION = " "$PROJECT_FILE" | head -1 | sed 's/.*CURRENT_PROJECT_VERSION = \([0-9]*\);/\1/')

if [ "$UPDATED_BUILD" = "$NEW_BUILD" ]; then
    echo -e "${GREEN}✅ Successfully updated build number to $NEW_BUILD${NC}"
    
    # Show all build numbers in the file
    echo -e "${BLUE}📋 All build numbers in project:${NC}"
    grep "CURRENT_PROJECT_VERSION = " "$PROJECT_FILE" | sed 's/.*CURRENT_PROJECT_VERSION = \([0-9]*\);/\1/' | sort -u
    
else
    echo -e "${RED}❌ Error: Failed to update build number${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Build number increment complete!${NC}"
echo -e "${YELLOW}💡 Tip: Run this script before each build to keep build numbers current${NC}"
