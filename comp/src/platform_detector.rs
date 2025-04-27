use std::env;

/// Represents the platform/operating system
#[derive(Debug, PartialEq, Clone, Copy)]
pub enum Platform {
    MacOS,
    Windows,
    Linux,
    IOS,
    Android,
    Web,
    Unknown,
}

/// Detects the current platform
pub fn detect_platform() -> Platform {
    let os = env::consts::OS;
    
    match os {
        "macos" => Platform::MacOS,
        "windows" => Platform::Windows,
        "linux" => Platform::Linux,
        "ios" => Platform::IOS,
        "android" => Platform::Android,
        _ => {
            // Additional checks for web platform
            if let Ok(user_agent) = env::var("HTTP_USER_AGENT") {
                // Check if running in a browser environment
                if user_agent.contains("Mozilla") || user_agent.contains("WebKit") {
                    return Platform::Web;
                }
            }
            
            // Check for browser-specific variables
            if env::var("BROWSER").is_ok() || env::var("CHROME_BIN").is_ok() || env::var("FIREFOX_BIN").is_ok() {
                return Platform::Web;
            }
            
            Platform::Unknown
        }
    }
}

/// Determines if the current platform is mobile
pub fn is_mobile() -> bool {
    let platform = detect_platform();
    platform == Platform::IOS || platform == Platform::Android
}

/// Determines if the current platform is desktop
pub fn is_desktop() -> bool {
    let platform = detect_platform();
    platform == Platform::MacOS || platform == Platform::Windows || platform == Platform::Linux
}

/// Determines if the current platform is web
pub fn is_web() -> bool {
    detect_platform() == Platform::Web
}

/// Gets the string representation of the platform
pub fn platform_name(platform: Platform) -> &'static str {
    match platform {
        Platform::MacOS => "macos",
        Platform::Windows => "windows",
        Platform::Linux => "linux",
        Platform::IOS => "ios",
        Platform::Android => "android",
        Platform::Web => "web",
        Platform::Unknown => "unknown",
    }
}

/// Gets the language associated with a platform for compilation
pub fn platform_language(platform: Platform) -> &'static str {
    match platform {
        Platform::MacOS => "swift",
        Platform::Windows => "csharp",
        Platform::Linux => "c",
        Platform::IOS => "swift",
        Platform::Android => "kotlin",
        Platform::Web => "javascript",
        Platform::Unknown => "javascript", // Default to JavaScript
    }
}

/// Gets the file extension for the platform's primary language
pub fn platform_file_extension(platform: Platform) -> &'static str {
    match platform {
        Platform::MacOS => "swift",
        Platform::Windows => "cs",
        Platform::Linux => "c",
        Platform::IOS => "swift",
        Platform::Android => "kt",
        Platform::Web => "js",
        Platform::Unknown => "js", // Default to JavaScript
    }
}

/// Extracts the target platform from command line arguments
pub fn get_target_platform_from_args() -> Platform {
    // Check command-line arguments
    let args: Vec<String> = env::args().collect();
    
    for arg in args.iter() {
        match arg.as_str() {
            "--target=macos" | "--macos" => return Platform::MacOS,
            "--target=windows" | "--windows" => return Platform::Windows,
            "--target=linux" | "--linux" => return Platform::Linux,
            "--target=ios" | "--ios" => return Platform::IOS,
            "--target=android" | "--android" => return Platform::Android,
            "--target=web" | "--web" => return Platform::Web,
            _ => {
                // Check for --target=xxx format
                if arg.starts_with("--target=") {
                    let platform_str = &arg[9..];
                    match platform_str {
                        "macos" => return Platform::MacOS,
                        "windows" => return Platform::Windows,
                        "linux" => return Platform::Linux,
                        "ios" => return Platform::IOS,
                        "android" => return Platform::Android,
                        "web" => return Platform::Web,
                        _ => {} // Ignore unknown targets
                    }
                }
            }
        }
    }
    
    // If no target is specified, detect current platform
    detect_platform()
}

/// Determines the best compiler target based on the current platform
pub fn determine_best_target() -> Platform {
    let current_platform = detect_platform();
    
    // First check command line args
    let target_from_args = get_target_platform_from_args();
    if target_from_args != Platform::Unknown {
        return target_from_args;
    }
    
    // If no target specified in args, use current platform
    if current_platform != Platform::Unknown {
        return current_platform;
    }
    
    // Default to web if platform can't be determined
    Platform::Web
}