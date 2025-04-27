use crate::ast::ASTNode;
use crate::platform_detector::{Platform, determine_best_target};
use crate::parser;
use crate::compiler::JsCompiler;
use crate::compilers::react_compiler::ReactCompiler;
use crate::compilers::android_compiler::AndroidCompiler;
use std::fs;
use std::path::Path;
use std::env;

/// Represents the web framework/library to target
#[derive(Debug, PartialEq, Clone, Copy)]
pub enum WebFramework {
    PureJs,
    React,
    Angular,
    Vue,
    Svelte,
}

pub struct UniversalCompiler {
    platform: Platform,
    force_platform: Option<Platform>,
    output_directory: String,
    web_framework: WebFramework,
}

impl UniversalCompiler {
    pub fn new() -> Self {
        UniversalCompiler {
            platform: determine_best_target(),
            force_platform: None,
            output_directory: String::from("."),
            web_framework: WebFramework::PureJs, // Default to pure JS
        }
    }
    
    pub fn set_platform(&mut self, platform: Platform) {
        self.force_platform = Some(platform);
    }
    
    pub fn set_output_directory(&mut self, dir: &str) {
        self.output_directory = dir.to_string();
    }
    
    pub fn set_web_framework(&mut self, framework: WebFramework) {
        self.web_framework = framework;
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
            Platform::Web => {
                // For web, use the specified framework
                match self.web_framework {
                    WebFramework::PureJs => self.compile_for_web_js(&ast, app_name),
                    WebFramework::React => self.compile_for_web_react(&ast, app_name),
                    WebFramework::Angular => {
                        println!("Angular support is limited, falling back to pure JS");
                        self.compile_for_web_js(&ast, app_name)
                    },
                    WebFramework::Vue => {
                        println!("Vue support is limited, falling back to pure JS");
                        self.compile_for_web_js(&ast, app_name)
                    },
                    WebFramework::Svelte => {
                        println!("Svelte support is limited, falling back to pure JS");
                        self.compile_for_web_js(&ast, app_name)
                    },
                }
            },
            // For all other platforms, fall back to web (using the specified framework)
            _ => {
                println!("Platform {:?} compilation is redirecting to web output with {:?} framework.", 
                         target_platform, self.web_framework);
                
                match self.web_framework {
                    WebFramework::React => self.compile_for_web_react(&ast, app_name),
                    _ => self.compile_for_web_js(&ast, app_name), // Default to pure JS for other frameworks
                }
            }
        }
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
    
    // Pure JavaScript compilation for web
    fn compile_for_web_js(&self, ast: &ASTNode, app_name: &str) -> Result<(), String> {
        println!("Compiling for Web (Pure JavaScript)...");
        
        // JavaScript is the primary target for web
        let mut js_compiler = JsCompiler::new();
        let js_code = match js_compiler.compile(ast) {
            Ok(code) => code,
            Err(e) => return Err(format!("JavaScript compilation error: {}", e))
        };
        
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
        .container {{ max-width: 1200px; margin: 0 auto; padding: 1rem; }}
        header {{ background-color: #f0f0f0; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; }}
        h1 {{ margin-top: 0; }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>{} - GaiaScript App</h1>
        </header>
        <div id="app"></div>
    </div>
    <script src="{}.js"></script>
</body>
</html>"#, app_name, app_name, app_name);
        
        let html_path = web_dir_path.join("index.html");
        fs::write(&html_path, &html_content).map_err(|e| format!("Failed to write HTML file: {}", e))?;
        
        println!("Generated Pure JavaScript Web application at {}", web_dir);
        println!("To serve the application:");
        println!("  cd {}", web_dir);
        println!("  python -m http.server 8000  # or any other web server");
        println!("  Open http://localhost:8000 in your browser");
        
        Ok(())
    }
    
    // React-specific compilation for web
    fn compile_for_web_react(&self, ast: &ASTNode, app_name: &str) -> Result<(), String> {
        println!("Compiling for Web (React.js)...");
        
        // Use the React compiler
        let mut react_compiler = ReactCompiler::new();
        let react_code = match react_compiler.compile(ast) {
            Ok(code) => code,
            Err(e) => return Err(format!("React compilation error: {}", e))
        };
        
        // Create React app directory structure
        let react_dir = format!("{}/{}_react", self.output_directory, app_name);
        let react_dir_path = Path::new(&react_dir);
        let src_dir_path = react_dir_path.join("src");
        let public_dir_path = react_dir_path.join("public");
        
        // Create directories
        if !react_dir_path.exists() {
            fs::create_dir_all(&react_dir_path).map_err(|e| format!("Failed to create React project directory: {}", e))?;
        }
        if !src_dir_path.exists() {
            fs::create_dir_all(&src_dir_path).map_err(|e| format!("Failed to create src directory: {}", e))?;
        }
        if !public_dir_path.exists() {
            fs::create_dir_all(&public_dir_path).map_err(|e| format!("Failed to create public directory: {}", e))?;
        }
        
        // Write React component
        let app_js_path = src_dir_path.join("App.js");
        fs::write(&app_js_path, &react_code).map_err(|e| format!("Failed to write App.js file: {}", e))?;
        
        // Create App.css
        let app_css_content = r#"
.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

.App-link {
  color: #61dafb;
}
"#;
        let app_css_path = src_dir_path.join("App.css");
        fs::write(&app_css_path, app_css_content).map_err(|e| format!("Failed to write App.css file: {}", e))?;
        
        // Create index.js
        let index_js_content = r#"
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"#;
        let index_js_path = src_dir_path.join("index.js");
        fs::write(&index_js_path, index_js_content).map_err(|e| format!("Failed to write index.js file: {}", e))?;
        
        // Create index.css
        let index_css_content = r#"
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
"#;
        let index_css_path = src_dir_path.join("index.css");
        fs::write(&index_css_path, index_css_content).map_err(|e| format!("Failed to write index.css file: {}", e))?;
        
        // Create index.html
        let index_html_content = format!(r#"<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Web app created using GaiaScript" />
    <title>{} - GaiaScript React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>"#, app_name);
        let index_html_path = public_dir_path.join("index.html");
        fs::write(&index_html_path, index_html_content).map_err(|e| format!("Failed to write index.html file: {}", e))?;
        
        // Create package.json
        let package_json_content = format!(r#"{{
  "name": "{}",
  "version": "0.1.0",
  "private": true,
  "dependencies": {{
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  }},
  "scripts": {{
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }},
  "eslintConfig": {{
    "extends": [
      "react-app"
    ]
  }},
  "browserslist": {{
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }}
}}"#, app_name.to_lowercase().replace(" ", "-"));
        let package_json_path = react_dir_path.join("package.json");
        fs::write(&package_json_path, package_json_content).map_err(|e| format!("Failed to write package.json file: {}", e))?;
        
        // Create README.md
        let readme_content = format!(r#"# {} React App

This is a React application generated from GaiaScript.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run build`

Builds the app for production to the `build` folder.

## Learn More

This app was generated using GaiaScript's Universal Compiler with React support.
"#, app_name);
        let readme_path = react_dir_path.join("README.md");
        fs::write(&readme_path, readme_content).map_err(|e| format!("Failed to write README.md file: {}", e))?;
        
        println!("Generated React application at {}", react_dir);
        println!("To run the application:");
        println!("  cd {}", react_dir);
        println!("  npm install");
        println!("  npm start");
        
        Ok(())
    }
}

// Helper function to parse web framework from string
pub fn parse_web_framework(framework_str: &str) -> WebFramework {
    match framework_str.to_lowercase().as_str() {
        "react" => WebFramework::React,
        "angular" => WebFramework::Angular,
        "vue" => WebFramework::Vue,
        "svelte" => WebFramework::Svelte,
        _ => WebFramework::PureJs, // Default to pure JS
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
        eprintln!("  --framework=FRAMEWORK Force a specific web framework");
        eprintln!("                        Supported frameworks: js, react, angular, vue, svelte");
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
            eprintln!("  --framework=FRAMEWORK Force a specific web framework");
            eprintln!("                        Supported frameworks: js, react, angular, vue, svelte");
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
        } else if arg.starts_with("--framework=") {
            let framework_str = &arg[12..];
            let framework = parse_web_framework(framework_str);
            compiler.set_web_framework(framework);
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
