#!/bin/bash
# GaiaScript Server Restart Script

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

# Function to build and start the server
build_and_start_server() {
    echo -e "${YELLOW}Building the project...${NC}"
    
    # Determine build type
    BUILD_TYPE="debug"
    if [ "$2" = "release" ]; then
        BUILD_TYPE="release"
        BUILD_FLAG="--release"
        echo -e "${BLUE}Building in RELEASE mode${NC}"
    else
        echo -e "${BLUE}Building in DEBUG mode${NC}"
    fi
    
    cargo build $BUILD_FLAG
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Build failed. Exiting.${NC}"
        exit 1
    else
        echo -e "${GREEN}Build successful!${NC}"
    fi
    
    echo -e "${YELLOW}Starting server on port $PORT...${NC}"
    if [ "$BUILD_TYPE" = "release" ]; then
        cargo run --release --bin gaiascript -- serve $PORT
    else
        cargo run --bin gaiascript -- serve $PORT
    fi
}

# Function to check and handle log directory
setup_logs() {
    echo -e "${YELLOW}Setting up log directory...${NC}"
    if [ ! -d "logs" ]; then
        echo -e "${BLUE}Creating logs directory${NC}"
        mkdir -p logs
    fi
    
    # Rotate logs if they're getting too large
    if [ -f "logs/gaiascript.log" ] && [ $(stat -f%z "logs/gaiascript.log") -gt 5000000 ]; then
        echo -e "${BLUE}Rotating log files${NC}"
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        mv logs/gaiascript.log logs/gaiascript_$TIMESTAMP.log
    fi
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

# Function to start LynxJS server
start_lynx_server() {
    echo -e "${YELLOW}Starting LynxJS server on port $LYNX_PORT...${NC}"
    echo -e "${BLUE}Access the LynxJS application at: ${GREEN}http://localhost:$LYNX_PORT${NC}"
    
    # Log startup information
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting LynxJS server on port $LYNX_PORT" >> logs/lynx_server_$LYNX_PORT.log
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] App: LynxJS - Environment: $(node -v)" >> logs/lynx_server_$LYNX_PORT.log
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Configuration: PORT=$LYNX_PORT, PWD=$(pwd)" >> logs/lynx_server_$LYNX_PORT.log
    
    # Start LynxJS server in background and redirect output to log file
    (node web/js/gaia-runtime.js --port=$LYNX_PORT >> logs/lynx_server_$LYNX_PORT.log 2>&1) &
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

# Main script execution
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

if [ $? -ne 0 ]; then
    echo -e "${RED}GaiaScript build failed. Exiting.${NC}"
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

# Start GaiaScript server in foreground
echo -e "${YELLOW}Step 4: Starting GaiaScript server on port $GAIA_PORT${NC}"
echo -e "${BLUE}Access the GaiaScript application at: ${GREEN}http://localhost:$GAIA_PORT/gaia-playground.html${NC}"

if [ "$BUILD_TYPE" = "release" ]; then
    cargo run --release --bin gaiascript -- serve $GAIA_PORT
else
    cargo run --bin gaiascript -- serve $GAIA_PORT
fi

# Note: The script will not return as the GaiaScript server runs in foreground
# To stop both servers, press Ctrl+C
# This will stop the foreground GaiaScript server, but you'll need to manually kill the background LynxJS server
# or run this script with the --kill-only flag