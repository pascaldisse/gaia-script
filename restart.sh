#!/bin/bash
# GaiaScript Server Restart Script - Refactored for single file

# Default ports
GAIA_PORT=8080
LYNX_PORT=5555

# Parse port arguments if provided
if [ "$1" != "" ]; then
    GAIA_PORT=$1
fi
if [ "$2" != "" ]; then
    LYNX_PORT=$2
fi

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}GaiaScript Server Management Script${NC}"
echo "==============================================="
echo -e "Current working directory: ${GREEN}$(pwd)${NC}"
echo -e "GaiaScript server port: ${GREEN}$GAIA_PORT${NC}"
echo -e "LynxJS server port: ${GREEN}$LYNX_PORT${NC}"

# Function to kill any existing server process
kill_existing_server() {
    echo -e "${YELLOW}Checking for existing GaiaScript server processes...${NC}"
    
    # Find processes that match gaiascript serve (both debug and release)
    PIDS=$(ps aux | grep "gaiascript serve" | grep -v grep | awk '{print $2}')
    
    if [ -z "$PIDS" ]; then
        echo -e "${GREEN}No existing GaiaScript server processes found.${NC}"
    else
        echo -e "${RED}Found existing server processes with PIDs: $PIDS${NC}"
        echo -e "${YELLOW}Killing existing server processes...${NC}"
        for PID in $PIDS; do
            kill -9 $PID
            echo -e "${GREEN}Killed process with PID: $PID${NC}"
        done
    fi
    
    # Also check for any LynxJS server processes
    echo -e "${YELLOW}Checking for existing LynxJS server processes...${NC}"
    LYNX_PIDS=$(ps aux | grep "node web/js/gaia-runtime.js" | grep -v grep | awk '{print $2}')
    
    if [ -z "$LYNX_PIDS" ]; then
        echo -e "${GREEN}No existing LynxJS server processes found.${NC}"
    else
        echo -e "${RED}Found existing LynxJS processes with PIDs: $LYNX_PIDS${NC}"
        echo -e "${YELLOW}Killing existing LynxJS processes...${NC}"
        for PID in $LYNX_PIDS; do
            kill -9 $PID
            echo -e "${GREEN}Killed process with PID: $PID${NC}"
        done
    fi
    
    # Check for any process using the GaiaScript port
    echo -e "${YELLOW}Checking for processes using port $GAIA_PORT...${NC}"
    GAIA_PORT_PIDS=$(lsof -i :$GAIA_PORT | grep LISTEN | awk '{print $2}')
    
    if [ -z "$GAIA_PORT_PIDS" ]; then
        echo -e "${GREEN}No processes using port $GAIA_PORT.${NC}"
    else
        echo -e "${RED}Found processes using port $GAIA_PORT with PIDs: $GAIA_PORT_PIDS${NC}"
        echo -e "${YELLOW}Killing processes using port $GAIA_PORT...${NC}"
        for PID in $GAIA_PORT_PIDS; do
            kill -9 $PID
            echo -e "${GREEN}Killed process with PID: $PID${NC}"
        done
    fi
    
    # Check for any process using the LynxJS port
    echo -e "${YELLOW}Checking for processes using port $LYNX_PORT...${NC}"
    LYNX_PORT_PIDS=$(lsof -i :$LYNX_PORT | grep LISTEN | awk '{print $2}')
    
    if [ -z "$LYNX_PORT_PIDS" ]; then
        echo -e "${GREEN}No processes using port $LYNX_PORT.${NC}"
    else
        echo -e "${RED}Found processes using port $LYNX_PORT with PIDs: $LYNX_PORT_PIDS${NC}"
        echo -e "${YELLOW}Killing processes using port $LYNX_PORT...${NC}"
        for PID in $LYNX_PORT_PIDS; do
            kill -9 $PID
            echo -e "${GREEN}Killed process with PID: $PID${NC}"
        done
    fi
}

# Function to check and handle log directory
setup_logs() {
    echo -e "${YELLOW}Setting up log directory...${NC}"
    if [ ! -d "logs" ]; then
        echo -e "${BLUE}Creating logs directory${NC}"
        mkdir -p logs
    fi
    
    # Rotate logs if they're getting too large (5MB)
    for LOG_FILE in logs/*.log; do
        if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE") -gt 5000000 ]; then
            echo -e "${BLUE}Rotating log file: $LOG_FILE${NC}"
            TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
            LOG_BASENAME=$(basename "$LOG_FILE" .log)
            mv "$LOG_FILE" "logs/${LOG_BASENAME}_${TIMESTAMP}.log"
        fi
    done
    
    # Clean up old log files (keep only the 10 most recent for each type)
    echo -e "${BLUE}Cleaning up old log files...${NC}"
    for LOG_PREFIX in $(find logs -name "*.log" | sed 's/.*\///' | sed 's/_[0-9]*\.log$//' | sed 's/\.log$//' | sort | uniq); do
        # Count how many rotated logs exist for this prefix
        LOG_COUNT=$(find logs -name "${LOG_PREFIX}*.log" | wc -l)
        
        # If more than 10 logs, delete oldest
        if [ $LOG_COUNT -gt 10 ]; then
            echo -e "${BLUE}Found $LOG_COUNT logs for $LOG_PREFIX, removing oldest...${NC}"
            find logs -name "${LOG_PREFIX}*.log" | sort | head -n $(($LOG_COUNT - 10)) | xargs rm -f
        fi
    done
}

# Function to start LynxJS server
start_lynx_server() {
    echo -e "${YELLOW}Starting LynxJS server on port $LYNX_PORT...${NC}"
    echo -e "${BLUE}Access the LynxJS application at: ${GREEN}http://localhost:$LYNX_PORT${NC}"
    
    # Log startup information
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting LynxJS server on port $LYNX_PORT" >> logs/lynx_server_$LYNX_PORT.log
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] App: LynxJS - Environment: $(node -v)" >> logs/lynx_server_$LYNX_PORT.log
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Configuration: PORT=$LYNX_PORT, PWD=$(pwd)" >> logs/lynx_server_$LYNX_PORT.log
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Using consolidated main.gaia for all components" >> logs/lynx_server_$LYNX_PORT.log
    
    # Start LynxJS server in background and redirect output to log file
    (node web/js/gaia-runtime.js --port=$LYNX_PORT --single-file=main.gaia >> logs/lynx_server_$LYNX_PORT.log 2>&1) &
    LYNX_PID=$!
    echo -e "${GREEN}LynxJS server started with PID: $LYNX_PID${NC}"
    
    # Log PID information
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] LynxJS server started with PID: $LYNX_PID" >> logs/lynx_server_$LYNX_PORT.log
    
    # Sleep briefly to allow server to start
    sleep 2
    
    # Check if server started successfully
    if kill -0 $LYNX_PID 2>/dev/null; then
        echo -e "${GREEN}LynxJS server running successfully on port $LYNX_PORT${NC}"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] LynxJS server running successfully on port $LYNX_PORT" >> logs/lynx_server_$LYNX_PORT.log
    else
        echo -e "${RED}Failed to start LynxJS server. Check logs/lynx_server_$LYNX_PORT.log for details.${NC}"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Failed to start LynxJS server" >> logs/lynx_server_$LYNX_PORT.log
    fi
}

# Print a header
print_header() {
    echo -e "${YELLOW}==================================================${NC}"
    echo -e "${YELLOW}     GaiaScript Consolidated Server Manager       ${NC}"
    echo -e "${YELLOW}==================================================${NC}"
    echo -e "Version: 2.0.0 - $(date '+%Y-%m-%d')"
    echo -e "Ports: GaiaScript:${GREEN}$GAIA_PORT${NC}, LynxJS:${GREEN}$LYNX_PORT${NC}"
    echo -e "${YELLOW}==================================================${NC}"
    echo ""
}

# Parse command line options
RUN_MODE="normal" # normal, build-only, kill-only
BUILD_TYPE="debug" # debug, release

while [[ $# -gt 0 ]]; do
    case $1 in
        --port=*)
            PORT="${1#*=}"
            shift
            ;;
        --release)
            BUILD_TYPE="release"
            shift
            ;;
        --build-only)
            RUN_MODE="build-only"
            shift
            ;;
        --kill-only)
            RUN_MODE="kill-only"
            shift
            ;;
        *)
            # If it's just a number, treat it as port
            if [[ $1 =~ ^[0-9]+$ ]]; then
                PORT=$1
            fi
            shift
            ;;
    esac
done

# Main script execution
print_header
echo -e "${YELLOW}Setting up environment${NC}"
setup_logs

echo -e "${YELLOW}Step 1: Killing any existing server processes${NC}"
kill_existing_server

if [ "$RUN_MODE" = "kill-only" ]; then
    echo -e "${GREEN}Server processes stopped. Exiting as requested.${NC}"
    exit 0
fi

echo -e "${YELLOW}Step 2: Building the GaiaScript project${NC}"
if [ "$BUILD_TYPE" = "release" ]; then
    BUILD_FLAG="--release"
else
    BUILD_FLAG=""
fi

cargo build $BUILD_FLAG

BUILD_RESULT=$?
if [ $BUILD_RESULT -ne 0 ]; then
    echo -e "${RED}GaiaScript build failed with error code $BUILD_RESULT. Exiting.${NC}"
    exit 1
else
    echo -e "${GREEN}GaiaScript build successful!${NC}"
fi

if [ "$RUN_MODE" = "build-only" ]; then
    echo -e "${GREEN}Build completed. Exiting as requested.${NC}"
    exit 0
fi

# Start LynxJS server in background
echo -e "${YELLOW}Step 3: Starting LynxJS server${NC}"
start_lynx_server

# Sleep briefly to ensure we don't have resource conflicts during startup
sleep 2

# Start GaiaScript server in foreground
echo -e "${YELLOW}Step 4: Starting GaiaScript server on port $GAIA_PORT${NC}"
echo -e "${BLUE}Access the GaiaScript application at: ${GREEN}http://localhost:$GAIA_PORT/gaia-playground.html${NC}"
echo ""
echo -e "${YELLOW}Using consolidated main.gaia file for all components${NC}"

if [ "$BUILD_TYPE" = "release" ]; then
    echo -e "${BLUE}Starting server in RELEASE mode${NC}"
    cargo run --release --bin gaiascript -- serve $GAIA_PORT --single-file main.gaia
else
    echo -e "${BLUE}Starting server in DEBUG mode${NC}"
    cargo run --bin gaiascript -- serve $GAIA_PORT --single-file main.gaia
fi

# Check if the server started successfully
SERVER_RESULT=$?
if [ $SERVER_RESULT -ne 0 ]; then
    echo -e "${RED}GaiaScript server failed to start with error code $SERVER_RESULT${NC}"
    echo -e "${YELLOW}Check the error message above for more details${NC}"
    exit $SERVER_RESULT
fi