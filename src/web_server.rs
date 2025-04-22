use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::net::{TcpListener, TcpStream};
use std::io::{Read, Write};
use std::thread;
use std::sync::Arc;

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