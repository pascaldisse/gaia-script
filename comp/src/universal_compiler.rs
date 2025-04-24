use crate::ast::ASTNode;
use crate::platform_detector::{Platform, determine_best_target};
use crate::parser;
use crate::compiler::JsCompiler;
use crate::compilers::android_compiler::AndroidCompiler;
use std::fs;
use std::path::Path;
use std::env;

pub struct UniversalCompiler {
    platform: Platform,
    force_platform: Option<Platform>,
    output_directory: String,
}

impl UniversalCompiler {
    pub fn new() -> Self {
        UniversalCompiler {
            platform: determine_best_target(),
            force_platform: None,
            output_directory: String::from("."),
        }
    }
    
    pub fn set_platform(&mut self, platform: Platform) {
        self.force_platform = Some(platform);
    }
    
    pub fn set_output_directory(&mut self, dir: &str) {
        self.output_directory = dir.to_string();
    }
    
    pub fn get_target_platform(&self) -> Platform {
        self.force_platform.unwrap_or(self.platform)
    }
    
    pub fn compile(&self, source_file: &str) -> Result<(), String> {
        // Read the source file
        let source_content = fs::read_to_string(source_file)
            .map_err(|e| format!("Failed to read source file: {}", e))?;
        
        // Parse the source
        let ast = parser::parse(&source_content)
            .map_err(|e| format!("Failed to parse source: {}", e))?;
        
        // Extract the app name from the file name
        let path = Path::new(source_file);
        let app_name = path.file_stem()
            .and_then(|s| s.to_str())
            .ok_or_else(|| "Invalid source file name".to_string())?;
        
        let target_platform = self.get_target_platform();
        
        // Compile based on target platform
        match target_platform {
            Platform::Android => self.compile_for_android(&ast, app_name),
            Platform::Web => self.compile_for_web(&ast, app_name),
            _ => self.compile_for_web(&ast, app_name), // Fallback to web for all other platforms
        }
    }
    
    // Simple fallback methods for platforms we're not fully implementing yet
    fn compile_for_macos(&self, ast: &ASTNode, app_name: &str) -> Result<(), String> {
        println!("Compiling for macOS...");
        println!("Note: macOS compilation is currently redirecting to web output.");
        self.compile_for_web(ast, app_name)
    }
    
    fn compile_for_windows(&self, ast: &ASTNode, app_name: &str) -> Result<(), String> {
        println!("Compiling for Windows...");
        println!("Note: Windows compilation is currently redirecting to web output.");
        self.compile_for_web(ast, app_name)
    }
    
    fn compile_for_linux(&self, ast: &ASTNode, app_name: &str) -> Result<(), String> {
        println!("Compiling for Linux...");
        println!("Note: Linux compilation is currently redirecting to web output.");
        self.compile_for_web(ast, app_name)
    }
    
    fn compile_for_ios(&self, ast: &ASTNode, app_name: &str) -> Result<(), String> {
        println!("Compiling for iOS...");
        println!("Note: iOS compilation is currently redirecting to web output.");
        self.compile_for_web(ast, app_name)
    }
    
    fn compile_for_android(&self, ast: &ASTNode, app_name: &str) -> Result<(), String> {
        println!("Compiling for Android...");
        
        let mut compiler = AndroidCompiler::new();
        
        // Compile the AST to Kotlin code
        let kotlin_code = compiler.compile(ast)?;
        
        // Save Kotlin code to file for inspection
        let kotlin_file = format!("{}/{}.kt", self.output_directory, app_name);
        fs::write(&kotlin_file, &kotlin_code).map_err(|e| format!("Failed to write Kotlin file: {}", e))?;
        
        println!("Generated Kotlin code at {}", kotlin_file);
        println!("You can build this into an Android app using Android Studio.");
        
        Ok(())
    }
    
    fn compile_for_web(&self, ast: &ASTNode, app_name: &str) -> Result<(), String> {
        println!("Compiling for Web...");
        
        // JavaScript is the primary target for web
        let mut js_compiler = JsCompiler::new();
        let js_code = js_compiler.compile(ast)?;
        
        // Create web directory
        let web_dir = format!("{}/{}_web", self.output_directory, app_name);
        let web_dir_path = Path::new(&web_dir);
        
        if !web_dir_path.exists() {
            fs::create_dir_all(&web_dir).map_err(|e| format!("Failed to create web project directory: {}", e))?;
        }
        
        // Write the JavaScript code
        let js_path = web_dir_path.join(format!("{}.js", app_name));
        fs::write(&js_path, &js_code).map_err(|e| format!("Failed to write JavaScript file: {}", e))?;
        
        // Create a basic HTML file
        let html_content = format!(r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{} - GaiaScript Web App</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; }}
    </style>
</head>
<body>
    <div id="app"></div>
    <script src="{}.js"></script>
</body>
</html>"#, app_name, app_name);
        
        let html_path = web_dir_path.join("index.html");
        fs::write(&html_path, &html_content).map_err(|e| format!("Failed to write HTML file: {}", e))?;
        
        println!("Generated Web application at {}", web_dir);
        println!("To serve the application:");
        println!("  cd {}", web_dir);
        println!("  python -m http.server 8000  # or any other web server");
        println!("  Open http://localhost:8000 in your browser");
        
        Ok(())
    }
}

// Standalone binary for the universal compiler
pub fn main() {
    let args: Vec<String> = env::args().collect();
    
    if args.len() < 2 {
        eprintln!("Usage: gaia [options] <file.gaia>");
        eprintln!("Options:");
        eprintln!("  --platform=PLATFORM   Force a specific target platform");
        eprintln!("                        Supported platforms: macos, windows, linux, ios, android, web");
        eprintln!("  --output=DIR          Specify output directory (default: current directory)");
        eprintln!("  --help                Show this help message");
        return;
    }
    
    // Process arguments
    let mut compiler = UniversalCompiler::new();
    let mut source_file = None;
    
    for arg in &args[1..] {
        if arg == "--help" {
            eprintln!("GaiaScript Universal Compiler");
            eprintln!("Usage: gaia [options] <file.gaia>");
            eprintln!("Options:");
            eprintln!("  --platform=PLATFORM   Force a specific target platform");
            eprintln!("                        Supported platforms: macos, windows, linux, ios, android, web");
            eprintln!("  --output=DIR          Specify output directory (default: current directory)");
            eprintln!("  --help                Show this help message");
            return;
        } else if arg.starts_with("--platform=") {
            let platform_str = &arg[11..];
            let platform = match platform_str {
                "macos" => Platform::MacOS,
                "windows" => Platform::Windows,
                "linux" => Platform::Linux,
                "ios" => Platform::IOS,
                "android" => Platform::Android,
                "web" => Platform::Web,
                _ => {
                    eprintln!("Error: Unknown platform '{}'", platform_str);
                    eprintln!("Supported platforms: macos, windows, linux, ios, android, web");
                    return;
                }
            };
            compiler.set_platform(platform);
        } else if arg.starts_with("--output=") {
            let output_dir = &arg[9..];
            compiler.set_output_directory(output_dir);
        } else if !arg.starts_with("--") {
            source_file = Some(arg.clone());
        }
    }
    
    // Check if source file is provided
    let source_path = match source_file {
        Some(path) => path,
        None => {
            eprintln!("Error: No source file specified");
            return;
        }
    };
    
    // Compile the source file
    let platform = compiler.get_target_platform();
    println!("Compiling for platform: {:?}", platform);
    
    match compiler.compile(&source_path) {
        Ok(_) => println!("Compilation successful!"),
        Err(e) => eprintln!("Compilation failed: {}", e),
    }
}