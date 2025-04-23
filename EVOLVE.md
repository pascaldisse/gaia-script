# GaiaScript Evolution Framework

## Overview

The GaiaScript Evolution Framework is a comprehensive toolset for enhancing the GaiaScript programming language through continuous improvement, powered by AI assistance. The framework includes logging infrastructure, prompt generation, and Claude integration to help with refactoring, testing, feature development, performance optimization, and user feedback analysis.

## Key Components

### 1. Enhanced Logging System

The evolution framework adds comprehensive logging throughout the GaiaScript interpreter and compiler:

- User actions (commands, file operations)
- API calls and responses
- Execution results
- Error reporting and handling
- Performance metrics

All logs are stored in a structured format in `logs/gaiascript.log` for later analysis.

### 2. Prompt Generation

Based on the collected logs, the framework can generate prompts for Claude Code in several categories:

| Prompt Type | Purpose |
|-------------|---------|
| Refactor    | Identify areas of code that need refactoring based on error patterns and user behaviors |
| Test        | Generate comprehensive test cases based on observed usage patterns |
| Feature     | Suggest new features based on user interaction analysis |
| Performance | Identify performance bottlenecks and optimization opportunities |
| Feedback    | Analyze user experience and suggest improvements |

### 3. evolve.sh Script

The `evolve.sh` script provides a command-line interface for:

- Analyzing logs
- Generating prompts
- Setting up enhanced logging
- Creating Claude Code commands
- Managing development workflows

## How to Use

### Basic Usage

```bash
# Make the script executable
chmod +x evolve.sh

# Run the script
./evolve.sh
```

### Menu Options

The script provides an interactive menu with the following options:

1. **Analyze logs** - Review recent user interactions and errors
2. **Generate refactor prompt** - Create a prompt for code refactoring
3. **Generate test prompt** - Create a prompt for test creation
4. **Generate feature prompt** - Create a prompt for new feature development
5. **Generate performance prompt** - Create a prompt for performance optimization
6. **Generate feedback prompt** - Create a prompt for user experience analysis
7. **Setup enhanced logging** - Configure the logger (usually done once)
8. **Add prompt command to GaiaScript** - Add the 'prompt' command to GaiaScript
9. **Generate Claude Code command** - Create a command to use Claude Code with the generated prompt

### Using Claude Code with Generated Prompts

After generating a prompt, you can use it with Claude Code:

```bash
# Run directly from the script menu (option 9)
# Or use the saved command
./outputs/claude_refactor.sh
```

## Development Workflow

1. **Normal Development** - Work on GaiaScript as usual; all activities will be logged
2. **Log Analysis** - Analyze logs to identify patterns and issues
3. **Prompt Generation** - Generate relevant prompts based on the analysis
4. **AI Assistance** - Use the prompts with Claude Code to get suggestions
5. **Implementation** - Implement the suggested changes
6. **Repeat** - Continue the cycle for continuous improvement

## Prompt Types in Detail

### Refactor Prompt

Analyzes recent user interactions and errors to identify code areas that need refactoring. The prompt includes:

- Recent user commands
- Error patterns
- Suggested refactoring areas (code modularity, error handling, type safety, performance)

### Test Prompt

Examines usage patterns to generate comprehensive test cases. The prompt includes:

- Common operations
- Edge cases
- Error scenarios
- Performance benchmarks

### Feature Prompt

Analyzes user behavior to suggest valuable new features. The prompt includes:

- API usage patterns
- Command patterns
- User workflow analysis
- Integration suggestions

### Performance Prompt

Identifies performance bottlenecks and optimization opportunities. The prompt includes:

- Operation timing data
- Memory usage patterns
- Algorithm complexity analysis
- Resource utilization

### Feedback Prompt

Analyzes user experience to suggest improvements. The prompt includes:

- Error patterns
- Usage patterns
- Pain points
- Feature gaps
- Documentation needs

## Technical Implementation

The framework consists of:

1. **Logger Module** (`src/logger.rs`) - Core logging infrastructure
2. **Main Integration** (`src/main.rs`) - Logger integration with GaiaScript
3. **Evolve Script** (`evolve.sh`) - Command-line interface
4. **Prompt Templates** - Templates for generating Claude Code prompts

## Contributing

To contribute to the Evolution Framework:

1. Add enhanced logging to new components
2. Improve prompt templates
3. Extend the evolve.sh script with new analysis tools
4. Share successful prompts and improvements

## Future Directions

1. Automated log analysis with ML
2. Integration with CI/CD pipelines
3. Telemetry for distributed installations
4. Collaborative prompt development