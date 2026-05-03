#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}╔══════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  FlowPace + Juan's World — Local Dev Start  ║${NC}"
echo -e "${YELLOW}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Kill any existing Next.js or FlowPace dev servers
echo -e "${YELLOW}→ Cleaning up existing dev servers...${NC}"
pkill -f "next dev" 2>/dev/null || true
pgrep -f "flowpace/dev.py" | xargs kill 2>/dev/null || true
sleep 1

# Start FlowPace API
echo -e "${YELLOW}→ Starting FlowPace API on 0.0.0.0:8000${NC}"
flowpace/.venv/bin/python flowpace/dev.py > /tmp/flowpace-dev.log 2>&1 &
FLOWPACE_PID=$!

# Wait for FlowPace to be ready
for i in {1..30}; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/routines | grep -q "200"; then
    echo -e "  ${GREEN}✓ FlowPace API ready${NC}"
    break
  fi
  sleep 1
done

# Start Next.js on 0.0.0.0
echo -e "${YELLOW}→ Starting Next.js on 0.0.0.0:3000${NC}"
PORT=3000 npx next dev -H 0.0.0.0 > /tmp/next-dev.log 2>&1 &
NEXT_PID=$!

# Wait for Next.js to be ready
for i in {1..60}; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -qE "200|307|308"; then
    echo -e "  ${GREEN}✓ Next.js ready${NC}"
    break
  fi
  sleep 1
done

echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Both servers are running!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo "  FlowPace app:  http://localhost:3000/flowpace/"
echo "  FlowPace API:  http://localhost:8000/api/"
echo "  Juan's World:  http://localhost:3000/"
echo ""
echo "  (Also available on your network at your machine's IP)"
echo ""
echo "  Logs:"
echo "    FlowPace: tail -f /tmp/flowpace-dev.log"
echo "    Next.js:  tail -f /tmp/next-dev.log"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo ""

cleanup() {
  echo ""
  echo -e "${YELLOW}→ Shutting down servers...${NC}"
  kill $FLOWPACE_PID 2>/dev/null || true
  kill $NEXT_PID 2>/dev/null || true
  wait $FLOWPACE_PID 2>/dev/null || true
  wait $NEXT_PID 2>/dev/null || true
  echo -e "${GREEN}✓ Done.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

wait
