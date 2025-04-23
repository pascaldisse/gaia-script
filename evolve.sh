#!/bin/bash
# evolve.sh - GaiaScript evolution script
# This script analyzes logs, generates prompts, and helps with development

# Set colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directory setup
LOGS_DIR="logs"
PROMPT_DIR="prompts"
OUTPUT_DIR="outputs"

# Create directories if they don't exist
mkdir -p $LOGS_DIR
mkdir -p $PROMPT_DIR
mkdir -p $OUTPUT_DIR

function print_header() {
    echo -e "${PURPLE}=========================================${NC}"
    echo -e "${PURPLE} GaiaScript Evolution Script ${NC}"
    echo -e "${PURPLE}=========================================${NC}"
    echo ""
}

function check_dependencies() {
    echo -e "${BLUE}Checking dependencies...${NC}"
    
    # Check if Rust is installed
    if ! command -v cargo &> /dev/null; then
        echo -e "${RED}Rust not found. Please install Rust to continue.${NC}"
        exit 1
    fi
    
    # Check if the GaiaScript project is properly set up
    if [ ! -f "Cargo.toml" ]; then
        echo -e "${RED}Cargo.toml not found. Please run this script from the GaiaScript project root.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}All dependencies found.${NC}"
}

function analyze_logs() {
    LOG_FILE="$LOGS_DIR/gaiascript.log"
    
    if [ ! -f "$LOG_FILE" ]; then
        echo -e "${YELLOW}No log file found at $LOG_FILE. Run GaiaScript first to generate logs.${NC}"
        return
    }
    
    echo -e "${BLUE}Analyzing logs...${NC}"
    
    # Count user inputs
    USER_INPUTS=$(grep "USER_INPUT:" "$LOG_FILE" | wc -l)
    echo -e "${GREEN}User inputs: $USER_INPUTS${NC}"
    
    # Count API calls
    API_CALLS=$(grep "API_CALL:" "$LOG_FILE" | wc -l)
    echo -e "${GREEN}API calls: $API_CALLS${NC}"
    
    # Count errors
    ERRORS=$(grep "\[ERROR\]" "$LOG_FILE" | wc -l)
    echo -e "${YELLOW}Errors: $ERRORS${NC}"
    
    # Identify most common operations
    echo -e "${BLUE}Most common operations:${NC}"
    grep "USER_INPUT:" "$LOG_FILE" | cut -d' ' -f4- | sort | uniq -c | sort -nr | head -5
    
    # Identify most common errors
    if [ $ERRORS -gt 0 ]; then
        echo -e "${YELLOW}Most common errors:${NC}"
        grep "\[ERROR\]" "$LOG_FILE" | cut -d' ' -f4- | sort | uniq -c | sort -nr | head -5
    fi
}

function generate_prompt() {
    PROMPT_TYPE=$1
    OUTPUT_FILE="$PROMPT_DIR/$(date +%Y%m%d)_${PROMPT_TYPE}.md"
    
    echo -e "${BLUE}Generating $PROMPT_TYPE prompt...${NC}"
    
    # Call the GaiaScript logger's prompt generator
    cargo run -- prompt $PROMPT_TYPE > "$OUTPUT_FILE"
    
    echo -e "${GREEN}Prompt generated at: $OUTPUT_FILE${NC}"
    
    # Open prompt in default editor
    if [ -f "$OUTPUT_FILE" ]; then
        echo -e "${BLUE}Would you like to edit this prompt now? (y/n)${NC}"
        read -r EDIT_PROMPT
        if [[ "$EDIT_PROMPT" =~ ^[Yy]$ ]]; then
            ${EDITOR:-vi} "$OUTPUT_FILE"
        fi
    fi
}

function generate_claude_command() {
    PROMPT_TYPE=$1
    PROMPT_FILE="$PROMPT_DIR/$(date +%Y%m%d)_${PROMPT_TYPE}.md"
    
    if [ ! -f "$PROMPT_FILE" ]; then
        echo -e "${RED}Prompt file not found: $PROMPT_FILE${NC}"
        return
    }
    
    echo -e "${BLUE}Generating Claude Code command for $PROMPT_TYPE...${NC}"
    
    CLAUDE_CMD="claude -m claude-3-7-sonnet-20250219 -f $PROMPT_FILE"
    
    echo -e "${CYAN}Run this command to use Claude Code with the generated prompt:${NC}"
    echo -e "${GREEN}$CLAUDE_CMD${NC}"
    
    # Ask if user wants to run this now
    echo -e "${BLUE}Would you like to run this command now? (y/n)${NC}"
    read -r RUN_CMD
    if [[ "$RUN_CMD" =~ ^[Yy]$ ]]; then
        eval "$CLAUDE_CMD"
    else
        # Write command to a script file for later use
        SCRIPT_FILE="$OUTPUT_DIR/claude_${PROMPT_TYPE}.sh"
        echo "#!/bin/bash" > "$SCRIPT_FILE"
        echo "$CLAUDE_CMD" >> "$SCRIPT_FILE"
        chmod +x "$SCRIPT_FILE"
        echo -e "${GREEN}Command saved to: $SCRIPT_FILE${NC}"
    fi
}

function setup_logging() {
    echo -e "${BLUE}Setting up enhanced logging...${NC}"
    
    # Enable logging by default
    sed -i.bak 's/println!(/logger::info(/g' src/main.rs
    
    # Check if we've already added logger initialization
    if ! grep -q "logger::init" src/main.rs; then
        # Find the main function and add logger initialization at the beginning
        # This is a simplified approach - in a real situation, you'd want to do this with a proper code editor
        sed -i.bak '/fn main() {/a \    // Initialize logger\n    if let Err(e) = logger::init("logs/gaiascript.log", true, logger::LogLevel::Info) {\n        eprintln!("Failed to initialize logger: {}", e);\n    }' src/main.rs
    fi
    
    echo -e "${GREEN}Logging setup complete. Building project...${NC}"
    cargo build
}

function add_prompt_command() {
    # Check if we've already added the prompt command to main.rs
    if ! grep -q '"prompt"' src/main.rs; then
        echo -e "${BLUE}Adding prompt command to main.rs...${NC}"
        
        # First add it to the usage message
        sed -i.bak '/cargo run -- serve/a \        println!("  cargo run -- prompt <type>        # Generate development prompt");' src/main.rs
        
        # Then add the match arm for the prompt command
        sed -i.bak '/"serve" => {/i \        "prompt" => {\n            if args.len() < 3 {\n                println!("Error: Missing prompt type");\n                println!("Available types: refactor, test, feature, performance, feedback");\n                return;\n            }\n            \n            let prompt = logger::generate_prompt(&args[2]);\n            println!("{}", prompt);\n        },' src/main.rs
    fi
    
    echo -e "${GREEN}Prompt command added. Building project...${NC}"
    cargo build
}

function display_menu() {
    echo ""
    echo -e "${CYAN}Available commands:${NC}"
    echo -e "  ${GREEN}1${NC}. Analyze logs"
    echo -e "  ${GREEN}2${NC}. Generate refactor prompt"
    echo -e "  ${GREEN}3${NC}. Generate test prompt"
    echo -e "  ${GREEN}4${NC}. Generate feature prompt"
    echo -e "  ${GREEN}5${NC}. Generate performance prompt"
    echo -e "  ${GREEN}6${NC}. Generate feedback prompt"
    echo -e "  ${GREEN}7${NC}. Setup enhanced logging"
    echo -e "  ${GREEN}8${NC}. Add prompt command to GaiaScript"
    echo -e "  ${GREEN}9${NC}. Generate Claude Code command"
    echo -e "  ${GREEN}q${NC}. Quit"
    echo ""
    echo -e "${CYAN}Enter your choice:${NC}"
}

function main() {
    print_header
    check_dependencies
    
    while true; do
        display_menu
        read -r CHOICE
        
        case $CHOICE in
            1)
                analyze_logs
                ;;
            2)
                generate_prompt "refactor"
                ;;
            3)
                generate_prompt "test"
                ;;
            4)
                generate_prompt "feature"
                ;;
            5)
                generate_prompt "performance"
                ;;
            6)
                generate_prompt "feedback"
                ;;
            7)
                setup_logging
                ;;
            8)
                add_prompt_command
                ;;
            9)
                echo -e "${CYAN}Which prompt type?${NC}"
                echo -e "  ${GREEN}1${NC}. Refactor"
                echo -e "  ${GREEN}2${NC}. Test"
                echo -e "  ${GREEN}3${NC}. Feature"
                echo -e "  ${GREEN}4${NC}. Performance"
                echo -e "  ${GREEN}5${NC}. Feedback"
                read -r PROMPT_CHOICE
                
                case $PROMPT_CHOICE in
                    1) generate_claude_command "refactor" ;;
                    2) generate_claude_command "test" ;;
                    3) generate_claude_command "feature" ;;
                    4) generate_claude_command "performance" ;;
                    5) generate_claude_command "feedback" ;;
                    *) echo -e "${RED}Invalid choice.${NC}" ;;
                esac
                ;;
            q|Q)
                echo -e "${GREEN}Exiting. Happy coding!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid choice. Please try again.${NC}"
                ;;
        esac
    done
}

# Run the main function
main