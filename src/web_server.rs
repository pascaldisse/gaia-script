use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::net::{TcpListener, TcpStream};
use std::io::{Read, Write};
use std::thread;
use std::sync::Arc;
use std::time::{Duration, SystemTime};
use std::collections::HashMap;

use crate::parser;
use crate::interpreter::Interpreter;

pub fn start_server(port: u16) -> io::Result<()> {
    let listener = TcpListener::bind(format!("0.0.0.0:{}", port))?;
    println!("Server started at http://localhost:{}", port);
    
    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                thread::spawn(|| {
                    handle_connection(stream).unwrap_or_else(|e| {
                        eprintln!("Error handling connection: {}", e);
                    });
                });
            }
            Err(e) => {
                eprintln!("Connection failed: {}", e);
            }
        }
    }
    
    Ok(())
}

fn handle_connection(mut stream: TcpStream) -> io::Result<()> {
    let mut buffer = [0; 1024];
    let bytes_read = stream.read(&mut buffer)?;
    let request = String::from_utf8_lossy(&buffer[..bytes_read]);
    
    // Parse the request to get the path
    let path = if let Some(request_line) = request.lines().next() {
        let parts: Vec<&str> = request_line.split_whitespace().collect();
        if parts.len() >= 2 {
            parts[1]
        } else {
            "/"
        }
    } else {
        "/"
    };
    
    if path == "/" {
        serve_file(stream, "web/index.html", "text/html")
    } else if path.starts_with("/api/run") {
        // Extract the GaiaScript code from the request body
        let body_start = request.find("\r\n\r\n").unwrap_or(0) + 4;
        let body = &request[body_start..];
        
        // Run the GaiaScript code and return the result
        handle_gaiascript_run(stream, body)
    } else if path.starts_with("/api/chat") {
        // Extract the chat message from the request body
        let body_start = request.find("\r\n\r\n").unwrap_or(0) + 4;
        let body = &request[body_start..];
        
        // Process the chat message
        handle_chat_request(stream, body)
    } else {
        // Serve static files
        let file_path = path.trim_start_matches('/');
        let full_path = PathBuf::from("web").join(file_path);
        
        let content_type = match Path::new(file_path).extension().and_then(|s| s.to_str()) {
            Some("html") => "text/html",
            Some("css") => "text/css",
            Some("js") => "application/javascript",
            Some("png") => "image/png",
            Some("jpg") | Some("jpeg") => "image/jpeg",
            Some("gif") => "image/gif",
            Some("svg") => "image/svg+xml",
            Some("ico") => "image/x-icon",
            Some("json") => "application/json",
            _ => "application/octet-stream",
        };
        
        serve_file(stream, full_path, content_type)
    }
}

fn serve_file<P: AsRef<Path>>(mut stream: TcpStream, path: P, content_type: &str) -> io::Result<()> {
    let path = path.as_ref();
    
    // Check if file exists
    if !path.exists() || !path.is_file() {
        return serve_404(stream);
    }
    
    // Read file content
    let content = fs::read(path)?;
    
    // Send response
    let response = format!(
        "HTTP/1.1 200 OK\r\nContent-Type: {}\r\nContent-Length: {}\r\n\r\n",
        content_type,
        content.len()
    );
    
    stream.write_all(response.as_bytes())?;
    stream.write_all(&content)?;
    
    Ok(())
}

fn serve_404(mut stream: TcpStream) -> io::Result<()> {
    let content = b"404 Not Found";
    
    let response = format!(
        "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: {}\r\n\r\n",
        content.len()
    );
    
    stream.write_all(response.as_bytes())?;
    stream.write_all(content)?;
    
    Ok(())
}

fn handle_gaiascript_run(mut stream: TcpStream, code: &str) -> io::Result<()> {
    // Parse and run the GaiaScript code
    let result = match parser::parse(code) {
        Ok(ast) => {
            let mut interpreter = Interpreter::new();
            match interpreter.interpret(&ast) {
                Ok(value) => format!("{{ \"success\": true, \"result\": \"{:?}\" }}", value),
                Err(err) => format!("{{ \"success\": false, \"error\": \"Runtime error: {}\" }}", err),
            }
        },
        Err(err) => {
            format!("{{ \"success\": false, \"error\": \"Parse error: {}\" }}", err)
        }
    };
    
    // Send response
    let response = format!(
        "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}",
        result.len(),
        result
    );
    
    stream.write_all(response.as_bytes())?;
    
    Ok(())
}

fn handle_chat_request(mut stream: TcpStream, body: &str) -> io::Result<()> {
    // Parse the JSON request body
    let message = if body.contains("\"message\"") {
        body.split("\"message\"")
            .nth(1)
            .and_then(|s| s.split("\"").nth(2))
            .unwrap_or("No message provided")
    } else {
        "No message provided"
    };
    
    // Extract context if provided
    let context = if body.contains("\"context\"") {
        body.split("\"context\"")
            .nth(1)
            .and_then(|s| s.split("\"").nth(2))
            .unwrap_or("")
    } else {
        ""
    };
    
    // Try to use the Gaia LLM API first
    match call_gaia_llm_api(message, context) {
        Ok(api_response) => {
            // Successfully received response from Gaia API
            // Send the response
            let result = format!("{{ \"response\": {:?} }}", api_response);
            let response = format!(
                "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: {}\r\n\r\n{}",
                result.len(),
                result
            );
            stream.write_all(response.as_bytes())?;
        },
        Err(error) => {
            // If API call fails, fall back to local response generation
            println!("LLM API call failed: {}", error);
            
            // Generate local response
            let fallback_response = generate_gaiascript_response(message);
            let result = format!("{{ \"response\": {:?}, \"source\": \"local\" }}", fallback_response);
            let response = format!(
                "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: {}\r\n\r\n{}",
                result.len(),
                result
            );
            stream.write_all(response.as_bytes())?;
        }
    }
    
    Ok(())
}

fn call_gaia_llm_api(message: &str, context: &str) -> Result<String, String> {
    // Gaia LLM API endpoint
    let api_url = "http://localhost:5000/api/llm/chat";
    
    // Set up a temporary directory for curl output
    let temp_dir = std::env::temp_dir();
    let output_file = temp_dir.join("gaia_api_response.json");
    let output_path = output_file.to_string_lossy();
    
    // Prepare messages array with system prompt based on context
    let system_prompt = if !context.is_empty() {
        format!("You are a GaiaScript assistant. GaiaScript is a symbolic language for concisely describing neural network architectures. {}", context)
    } else {
        "You are a GaiaScript assistant. GaiaScript is a symbolic language for concisely describing neural network architectures. Your goal is to help users learn and use GaiaScript.".to_string()
    };
    
    // Build request body with proper JSON structure
    let request_body = format!(
        r#"{{
            "model": "meta-llama/Meta-Llama-3-70B-Instruct",
            "messages": [
                {{"role": "system", "content": "{}"}},
                {{"role": "user", "content": "{}"}}
            ],
            "temperature": 0.7,
            "max_tokens": 800
        }}"#,
        system_prompt.replace("\"", "\\\""),
        message.replace("\"", "\\\"")
    );
    
    // Create a temporary file to store the request body
    let request_file = temp_dir.join("gaia_api_request.json");
    fs::write(&request_file, &request_body)
        .map_err(|e| format!("Failed to write request body: {}", e))?;
    
    // Prepare curl command
    let status = std::process::Command::new("curl")
        .arg("-s")
        .arg("-X")
        .arg("POST")
        .arg(api_url)
        .arg("-H")
        .arg("Content-Type: application/json")
        .arg("-H")
        .arg("Authorization: Bearer gaia-dev-key")
        .arg("-d")
        .arg(format!("@{}", request_file.to_string_lossy()))
        .arg("-o")
        .arg(&output_path)
        .status()
        .map_err(|e| format!("Failed to execute curl command: {}", e))?;
    
    // Clean up request file
    let _ = fs::remove_file(request_file);
    
    if !status.success() {
        return Err(format!("API request failed with status: {}", status));
    }
    
    // Read response from file
    let response_content = fs::read_to_string(&output_file)
        .map_err(|e| format!("Failed to read API response: {}", e))?;
    
    // Clean up output file
    let _ = fs::remove_file(output_file);
    
    // Parse response to extract message content
    if response_content.contains("\"message\"") {
        // Extract the message content from the response JSON
        let message = response_content.split("\"message\"")
            .nth(1)
            .and_then(|s| {
                let start = s.find(':').map(|i| i + 1).unwrap_or(0);
                let content = &s[start..];
                let content = content.trim_start().trim_start_matches('\"');
                let end = content.rfind("\",").or_else(|| content.rfind("\"}")).unwrap_or(content.len());
                Some(content[..end].trim().to_string())
            })
            .unwrap_or_else(|| "API returned an invalid response format".to_string());
        
        Ok(message)
    } else if response_content.contains("\"error\"") {
        // Extract error message
        let error = response_content.split("\"error\"")
            .nth(1)
            .and_then(|s| {
                let start = s.find(':').map(|i| i + 1).unwrap_or(0);
                let content = &s[start..];
                let content = content.trim_start().trim_start_matches('\"');
                let end = content.rfind("\",").or_else(|| content.rfind("\"}")).unwrap_or(content.len());
                Some(content[..end].trim().to_string())
            })
            .unwrap_or_else(|| "Unknown API error".to_string());
        
        Err(format!("API error: {}", error))
    } else {
        Err("Invalid API response format".to_string())
    }
}

fn generate_gaiascript_response(message: &str) -> String {
    // Add a small delay to simulate thinking time
    thread::sleep(Duration::from_millis(300));
    
    let message_lower = message.to_lowercase();
    
    // Helper function to create code blocks in markdown format
    let code_block = |code: &str| {
        format!("```gaiascript\n{}\n```", code)
    };
    
    if message_lower.contains("cnn") || message_lower.contains("convolutional") {
        if message_lower.contains("simple") || message_lower.contains("basic") {
            let code = "N I → C₁ 32 3 ρ → P 2 → C₂ 64 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S";
            format!("Here's a simple CNN for image classification:\n\n{}\n\nThis network has two convolutional layers with ReLU activation (ρ), each followed by pooling. The output goes through two dense layers and ends with a softmax classifier.", code_block(code))
        } else {
            let code = "N ⊻ I ⊸ μ σ → C₁ 32 5 ρ → R → P 2 → C₂ 64 3 ρ → R → P 2 → C₃ 128 3 ρ → R → P 2 → F → D₁ 256 R → D₀ 10 → S";
            format!("Here's a more complex CNN architecture:\n\n{}\n\nThis network has three convolutional layers with normalization and regularization. It's well-suited for detailed image classification tasks.", code_block(code))
        }
    } else if message_lower.contains("gan") || message_lower.contains("generative") {
        let code = "N〈G⊕D〉\nG: Z 100 → U 4×4×512 → [U 2× → C 256 ρ]×2 → C 3 τ\nD: I → [C 64 5 ρ → P 2]×3 → F → D₁ 1024 ρ → D₀ 1 σ\nL: G(Z)⊳D⟿BCE+λ‖∇D‖";
        format!("Here's a GAN architecture for image generation:\n\n{}\n\nThis GAN has a generator (G) that creates images from random noise, and a discriminator (D) that tries to distinguish real from generated images. The loss function trains both networks adversarially.", code_block(code))
    } else if message_lower.contains("transformer") || message_lower.contains("attention") {
        let code = "N〈E⊕D〉\nE: I → [E → A{h:8} → N]×6\nD: I → [E → A{h:8} → N]×6 → D₀ V S\nA{h}: [L QKV h → ⊗ → ⊕]‖";
        format!("Here's a transformer architecture with attention mechanism:\n\n{}\n\nThis implementation has an encoder-decoder structure with multi-head attention. The attention mechanism is defined with 8 heads that operate in parallel.", code_block(code))
    } else if message_lower.contains("write") && message_lower.contains("simple") {
        let code = "N I → [D₁ 64 ρ]×2 → D₀ 10 → S";
        format!("Here's a simple GaiaScript neural network:\n\n{}\n\nThis is a basic feedforward network with two hidden layers of 64 neurons each using ReLU activation, followed by a 10-neuron output layer with softmax activation.", code_block(code))
    } else if message_lower.contains("explain") && message_lower.contains("symbol") {
        "GaiaScript uses these symbols for concise neural network notation:\n\n- N: Network definition\n- I: Input layer\n- C: Convolutional layer (C₁, C₂, etc. for different channels)\n- D: Dense/Fully connected layer (D₁ for hidden, D₀ for output)\n- P: Pooling layer\n- F: Flatten operation\n- →: Data flow direction\n- ρ: ReLU activation\n- σ: Sigmoid activation\n- τ: Tanh activation\n- S: Softmax activation\n- R: Regularization\n- [ ]×n: Repeat block n times\n- 〈〉: Component grouping\n- ⊕: Component separation\n\nThis symbolic notation allows complex networks to be expressed in minimal space."
    } else if message_lower.contains("explain") && message_lower.contains("gaiascript") {
        "GaiaScript is a symbolic language designed for concise representation of neural networks and other AI architectures. It uses Unicode symbols to express complex structures in a minimal, mathematically-inspired notation.\n\nKey benefits:\n1. Density: Express complex networks in a fraction of the space\n2. Readability: Once familiar with the symbols, networks can be understood at a glance\n3. Mathematical clarity: Captures the essence of neural computation\n\nGaiaScript can represent everything from simple feedforward networks to complex architectures like CNNs, RNNs, GANs, and Transformers."
    } else {
        "I'm the GaiaScript Assistant. I can help you write neural network architectures using GaiaScript notation, explain symbols, or generate example code for different network types like CNNs, GANs, or Transformers.\n\nTry asking me to:\n- Write a CNN for image classification\n- Explain GaiaScript symbols\n- Generate a GAN architecture\n- Write a simple neural network"
    }
}