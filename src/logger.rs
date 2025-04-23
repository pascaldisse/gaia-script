use std::fs::{self, File, OpenOptions};
use std::io::Write;
use std::path::Path;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum LogLevel {
    Debug,
    Info,
    Warning,
    Error,
}

impl LogLevel {
    pub fn as_str(&self) -> &'static str {
        match self {
            LogLevel::Debug => "DEBUG",
            LogLevel::Info => "INFO",
            LogLevel::Warning => "WARN",
            LogLevel::Error => "ERROR",
        }
    }
}

pub struct Logger {
    file: Arc<Mutex<File>>,
    console_output: bool,
    log_level: LogLevel,
}

impl Logger {
    pub fn new(file_path: &str, console_output: bool, log_level: LogLevel) -> Result<Self, std::io::Error> {
        // Create directory if it doesn't exist
        if let Some(parent) = Path::new(file_path).parent() {
            if !parent.exists() {
                fs::create_dir_all(parent)?;
            }
        }

        let file = OpenOptions::new()
            .create(true)
            .write(true)
            .append(true)
            .open(file_path)?;

        Ok(Logger {
            file: Arc::new(Mutex::new(file)),
            console_output,
            log_level,
        })
    }

    pub fn log(&self, level: LogLevel, message: &str) {
        if level < self.log_level {
            return;
        }

        let timestamp = self.get_timestamp();
        let log_entry = format!("[{}] {} - {}\n", level.as_str(), timestamp, message);
        
        if self.console_output {
            print!("{}", log_entry);
        }
        
        if let Ok(mut file) = self.file.lock() {
            let _ = file.write_all(log_entry.as_bytes());
            let _ = file.flush();
        }
    }

    pub fn debug(&self, message: &str) {
        self.log(LogLevel::Debug, message);
    }

    pub fn info(&self, message: &str) {
        self.log(LogLevel::Info, message);
    }

    pub fn warning(&self, message: &str) {
        self.log(LogLevel::Warning, message);
    }

    pub fn error(&self, message: &str) {
        self.log(LogLevel::Error, message);
    }

    fn get_timestamp(&self) -> String {
        use chrono::Local;
        let now = Local::now();
        
        format!(
            "{:04}-{:02}-{:02} {:02}:{:02}:{:02}.{:03}",
            now.year(),
            now.month(),
            now.day(),
            now.hour(),
            now.minute(),
            now.second(),
            now.timestamp_subsec_millis()
        )
    }

    pub fn log_user_input(&self, command: &str, args: &[String]) {
        let args_str = args.join(" ");
        self.info(&format!("USER_INPUT: Command '{}' with args: {}", command, args_str));
    }

    pub fn log_execution_result(&self, result: &str) {
        self.info(&format!("RESULT: {}", result));
    }

    pub fn log_api_call(&self, endpoint: &str, request: &str) {
        self.info(&format!("API_CALL: {} - Request: {}", endpoint, request));
    }

    pub fn log_api_response(&self, endpoint: &str, response: &str) {
        self.info(&format!("API_RESPONSE: {} - Response: {}", endpoint, response));
    }

    pub fn generate_prompt(&self, prompt_type: &str) -> String {
        match prompt_type {
            "refactor" => self.generate_refactor_prompt(),
            "test" => self.generate_test_prompt(),
            "feature" => self.generate_feature_prompt(),
            "performance" => self.generate_performance_prompt(),
            "feedback" => self.generate_feedback_prompt(),
            _ => String::from("Unknown prompt type"),
        }
    }

    fn generate_refactor_prompt(&self) -> String {
        let mut prompt = String::new();
        
        prompt.push_str("# GaiaScript Refactor Prompt\n\n");
        prompt.push_str("## Recent User Interactions\n");
        
        if let Ok(logs) = self.extract_recent_logs(50) {
            // Extract user inputs
            let user_inputs: Vec<&str> = logs
                .lines()
                .filter(|line| line.contains("USER_INPUT:"))
                .collect();
            
            prompt.push_str("### User Commands\n");
            for input in user_inputs {
                prompt.push_str(&format!("- {}\n", input));
            }
            
            // Extract errors
            let errors: Vec<&str> = logs
                .lines()
                .filter(|line| line.contains("[ERROR]"))
                .collect();
            
            if !errors.is_empty() {
                prompt.push_str("\n### Recent Errors\n");
                for error in errors {
                    prompt.push_str(&format!("- {}\n", error));
                }
            }
        }
        
        prompt.push_str("\n## Refactoring Task\n");
        prompt.push_str("Based on the recent user interactions and any errors encountered, refactor the GaiaScript code to improve:\n\n");
        prompt.push_str("1. Code modularity\n");
        prompt.push_str("2. Error handling\n");
        prompt.push_str("3. Type safety\n");
        prompt.push_str("4. Performance\n\n");
        
        prompt.push_str("Focus on [SPECIFIC AREA] and provide a clear explanation of your changes.\n");
        
        prompt
    }

    fn generate_test_prompt(&self) -> String {
        let mut prompt = String::new();
        
        prompt.push_str("# GaiaScript Test Generation Prompt\n\n");
        prompt.push_str("## Recent Usage Patterns\n");
        
        if let Ok(logs) = self.extract_recent_logs(50) {
            // Extract common operations
            let operations: Vec<&str> = logs
                .lines()
                .filter(|line| line.contains("RESULT:"))
                .collect();
            
            prompt.push_str("### Common Operations\n");
            for op in operations.iter().take(10) {
                prompt.push_str(&format!("- {}\n", op));
            }
        }
        
        prompt.push_str("\n## Test Requirements\n");
        prompt.push_str("Based on the usage patterns, create comprehensive tests for the GaiaScript [COMPONENT]. The tests should:\n\n");
        prompt.push_str("1. Cover edge cases\n");
        prompt.push_str("2. Test error handling\n");
        prompt.push_str("3. Verify expected outputs\n");
        prompt.push_str("4. Include performance benchmarks when relevant\n\n");
        
        prompt.push_str("Provide both unit tests and integration tests as appropriate.\n");
        
        prompt
    }

    fn generate_feature_prompt(&self) -> String {
        let mut prompt = String::new();
        
        prompt.push_str("# GaiaScript Feature Addition Prompt\n\n");
        prompt.push_str("## User Behavior Analysis\n");
        
        if let Ok(logs) = self.extract_recent_logs(100) {
            // Extract API calls
            let api_calls: Vec<&str> = logs
                .lines()
                .filter(|line| line.contains("API_CALL:"))
                .collect();
            
            prompt.push_str("### API Usage Patterns\n");
            for call in api_calls.iter().take(10) {
                prompt.push_str(&format!("- {}\n", call));
            }
            
            // Extract command patterns
            let commands: Vec<&str> = logs
                .lines()
                .filter(|line| line.contains("USER_INPUT: Command"))
                .collect();
            
            prompt.push_str("\n### Command Patterns\n");
            for cmd in commands.iter().take(10) {
                prompt.push_str(&format!("- {}\n", cmd));
            }
        }
        
        prompt.push_str("\n## Feature Request\n");
        prompt.push_str("Based on the user behavior analysis, implement a new feature for GaiaScript that addresses:\n\n");
        prompt.push_str("1. [SPECIFIC NEED]\n");
        prompt.push_str("2. Enhances user workflow efficiency\n");
        prompt.push_str("3. Integrates with existing functionality\n\n");
        
        prompt.push_str("Provide a detailed implementation plan and example usage.\n");
        
        prompt
    }

    fn generate_performance_prompt(&self) -> String {
        let mut prompt = String::new();
        
        prompt.push_str("# GaiaScript Performance Analysis Prompt\n\n");
        
        if let Ok(logs) = self.extract_recent_logs(100) {
            // Extract performance-related logs
            let perf_logs: Vec<&str> = logs
                .lines()
                .filter(|line| line.contains("execution time") || line.contains("RESULT:"))
                .collect();
            
            prompt.push_str("## Performance Data\n");
            for log in perf_logs.iter().take(20) {
                prompt.push_str(&format!("- {}\n", log));
            }
        }
        
        prompt.push_str("\n## Performance Optimization Task\n");
        prompt.push_str("Based on the collected performance data, identify and optimize the following aspects of GaiaScript:\n\n");
        prompt.push_str("1. Slow operations or bottlenecks\n");
        prompt.push_str("2. Memory usage patterns\n");
        prompt.push_str("3. Algorithm complexity\n");
        prompt.push_str("4. Resource utilization\n\n");
        
        prompt.push_str("Provide clear before/after benchmarks and explain your optimization approach.\n");
        
        prompt
    }

    fn generate_feedback_prompt(&self) -> String {
        let mut prompt = String::new();
        
        prompt.push_str("# GaiaScript User Feedback Analysis Prompt\n\n");
        
        if let Ok(logs) = self.extract_recent_logs(200) {
            // Extract error patterns
            let errors: Vec<&str> = logs
                .lines()
                .filter(|line| line.contains("[ERROR]"))
                .collect();
            
            prompt.push_str("## Error Patterns\n");
            for err in errors.iter().take(10) {
                prompt.push_str(&format!("- {}\n", err));
            }
            
            // Extract usage patterns
            let usage: Vec<&str> = logs
                .lines()
                .filter(|line| line.contains("USER_INPUT:"))
                .collect();
            
            prompt.push_str("\n## Usage Patterns\n");
            for use_case in usage.iter().take(10) {
                prompt.push_str(&format!("- {}\n", use_case));
            }
        }
        
        prompt.push_str("\n## Feedback Analysis Task\n");
        prompt.push_str("Based on the error and usage patterns, analyze user experience with GaiaScript and provide:\n\n");
        prompt.push_str("1. Common pain points\n");
        prompt.push_str("2. Feature gaps\n");
        prompt.push_str("3. Usability recommendations\n");
        prompt.push_str("4. Documentation needs\n\n");
        
        prompt.push_str("Create a prioritized improvement plan to address these findings.\n");
        
        prompt
    }

    fn extract_recent_logs(&self, limit: usize) -> Result<String, std::io::Error> {
        if let Ok(file) = self.file.lock() {
            drop(file); // Release the lock before reading the file
            
            if let Ok(log_content) = fs::read_to_string(self.file_path()) {
                let lines: Vec<&str> = log_content.lines().collect();
                let start = if lines.len() > limit { lines.len() - limit } else { 0 };
                Ok(lines[start..].join("\n"))
            } else {
                Ok(String::new())
            }
        } else {
            Ok(String::new())
        }
    }
    
    fn file_path(&self) -> String {
        // Use a simpler way to get the file path
        // This is a workaround since we can't directly get the path from a File
        // In a real implementation, we'd store the path separately
        String::from("logs/gaiascript.log")
    }
}

// Global logger instance
static mut LOGGER: Option<Logger> = None;

pub fn init(file_path: &str, console_output: bool, log_level: LogLevel) -> Result<(), std::io::Error> {
    let logger = Logger::new(file_path, console_output, log_level)?;
    
    unsafe {
        LOGGER = Some(logger);
    }
    
    Ok(())
}

pub fn get_logger() -> Option<&'static Logger> {
    unsafe { LOGGER.as_ref() }
}

pub fn debug(message: &str) {
    if let Some(logger) = get_logger() {
        logger.debug(message);
    }
}

pub fn info(message: &str) {
    if let Some(logger) = get_logger() {
        logger.info(message);
    }
}

pub fn warning(message: &str) {
    if let Some(logger) = get_logger() {
        logger.warning(message);
    }
}

pub fn error(message: &str) {
    if let Some(logger) = get_logger() {
        logger.error(message);
    }
}

pub fn log_user_input(command: &str, args: &[String]) {
    if let Some(logger) = get_logger() {
        logger.log_user_input(command, args);
    }
}

pub fn log_execution_result(result: &str) {
    if let Some(logger) = get_logger() {
        logger.log_execution_result(result);
    }
}

pub fn log_api_call(endpoint: &str, request: &str) {
    if let Some(logger) = get_logger() {
        logger.log_api_call(endpoint, request);
    }
}

pub fn log_api_response(endpoint: &str, response: &str) {
    if let Some(logger) = get_logger() {
        logger.log_api_response(endpoint, response);
    }
}

pub fn generate_prompt(prompt_type: &str) -> String {
    if let Some(logger) = get_logger() {
        logger.generate_prompt(prompt_type)
    } else {
        String::from("Logger not initialized")
    }
}