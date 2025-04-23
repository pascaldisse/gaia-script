use std::env;
use std::fs;
use std::path::Path;
use std::net::TcpListener;

use gaiascript::parser;
use gaiascript::interpreter::Interpreter;
use gaiascript::logger;

fn main() {
    // Initialize logger
    if let Err(e) = logger::init("logs/gaiascript.log", true, logger::LogLevel::Info) {
        eprintln!("Failed to initialize logger: {}", e);
    }
    
    let args: Vec<String> = env::args().collect();
    
    // Log the command
    if args.len() > 1 {
        logger::log_user_input(&args[1], if args.len() > 2 { &args[2..] } else { &[] });
    }
    
    if args.len() < 2 {
        println!("Usage:");
        println!("  cargo run -- parse <filename>       # Parse and display AST");
        println!("  cargo run -- run <filename>         # Run GaiaScript program");
        println!("  cargo run -- compile <filename>     # Compile to JavaScript");
        println!("  cargo run -- asm <filename> [arch]  # Compile to assembly (x86_64, arm64, wasm)");
        println!("  cargo run -- serve                  # Start web server");
        println!("  cargo run -- prompt <type>          # Generate development prompt");
        logger::error("No command specified");
        return;
    }
    
    match args[1].as_str() {
        "prompt" => {
            if args.len() < 3 {
                println!("Error: Missing prompt type");
                println!("Available types: refactor, test, feature, performance, feedback");
                logger::error("Missing prompt type");
                return;
            }
            
            let prompt = logger::generate_prompt(&args[2]);
            println!("{}", prompt);
            logger::info(&format!("Generated {} prompt", args[2]));
        },
        "parse" => {
            if args.len() < 3 {
                println!("Error: Missing filename");
                logger::error("Missing filename for parse command");
                return;
            }
            
            parse_file(&args[2]);
        },
        "run" => {
            if args.len() < 3 {
                println!("Error: Missing filename");
                logger::error("Missing filename for run command");
                return;
            }
            
            run_file(&args[2]);
        },
        "compile" => {
            if args.len() < 3 {
                println!("Error: Missing filename");
                logger::error("Missing filename for compile command");
                return;
            }
            
            compile_file(&args[2]);
        },
        "asm" => {
            if args.len() < 3 {
                println!("Error: Missing filename");
                logger::error("Missing filename for asm command");
                return;
            }
            
            // Default to x86_64 if no architecture specified
            let target = if args.len() >= 4 {
                match args[3].as_str() {
                    "x86_64" => gaiascript::asm_compiler::AsmTarget::X86_64,
                    "arm64" => gaiascript::asm_compiler::AsmTarget::ARM64,
                    "wasm" => gaiascript::asm_compiler::AsmTarget::WASM,
                    _ => {
                        println!("Error: Unknown architecture '{}'. Using x86_64.", args[3]);
                        logger::warning(&format!("Unknown architecture '{}'. Using x86_64.", args[3]));
                        gaiascript::asm_compiler::AsmTarget::X86_64
                    }
                }
            } else {
                println!("No architecture specified, using x86_64");
                logger::info("No architecture specified, using x86_64");
                gaiascript::asm_compiler::AsmTarget::X86_64
            };
            
            compile_to_assembly(&args[2], target);
        },
        "serve" => {
            let port = if args.len() >= 3 {
                args[2].parse().unwrap_or(8080)
            } else {
                8080
            };
            
            println!("Starting web server on port {}", port);
            logger::info(&format!("Starting web server on port {}", port));
            
            // Basic web server implementation
            match TcpListener::bind(format!("0.0.0.0:{}", port)) {
                Ok(listener) => {
                    println!("Server started at http://localhost:{}", port);
                    println!("Available paths:");
                    println!("  http://localhost:{}/gaia-playground.html - GaiaScript Playground", port);
                    println!("  http://localhost:{}/gaia-morphsphere.html - MorphSphere Game", port);
                    
                    logger::info(&format!("Server started at http://localhost:{}", port));
                    
                    for stream in listener.incoming() {
                        match stream {
                            Ok(stream) => {
                                use std::io::{Read, Write};
                                use std::fs;
                                use std::path::Path;
                                
                                // Handle the connection
                                let mut buffer = [0; 1024];
                                let mut stream = stream;
                                let bytes_read = stream.read(&mut buffer).unwrap_or(0);
                                let request = String::from_utf8_lossy(&buffer[..bytes_read]);
                                
                                // Parse the request to get the path
                                let path = if let Some(request_line) = request.lines().next() {
                                    let parts: Vec<&str> = request_line.split_whitespace().collect();
                                    if parts.len() >= 2 { parts[1] } else { "/" }
                                } else {
                                    "/"
                                };
                                
                                // Handle API requests
                                if path.starts_with("/api/") {
                                    // Extract the API endpoint
                                    let api_path = &path[5..]; // Skip "/api/"
                                    
                                    if api_path.starts_with("compile") {
                                        // Extract request body (GaiaScript code)
                                        let body_start = request.find("\r\n\r\n").unwrap_or(0) + 4;
                                        let gaia_code = &request[body_start..];
                                        
                                        println!("Compiling GaiaScript code: {}", gaia_code);
                                        logger::log_api_call("compile", gaia_code);
                                        
                                        // Parse the GaiaScript
                                        let result = match parser::parse(gaia_code) {
                                            Ok(ast) => {
                                                let js = compile_to_js(&ast);
                                                // Escape quotes for JSON
                                                let escaped_js = js.replace("\"", "\\\"").replace("\n", "\\n");
                                                let response = format!("{{ \"success\": true, \"javascript\": \"{}\" }}", escaped_js);
                                                logger::info("Successfully compiled GaiaScript code to JavaScript");
                                                response
                                            },
                                            Err(err) => {
                                                let error_msg = format!("Parse error: {}", err);
                                                logger::error(&error_msg);
                                                format!("{{ \"success\": false, \"error\": \"{}\" }}", error_msg)
                                            }
                                        };
                                        
                                        // Send response
                                        let response = format!(
                                            "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}",
                                            result.len(),
                                            result
                                        );
                                        
                                        stream.write_all(response.as_bytes()).unwrap_or(());
                                        println!("Compiled GaiaScript code");
                                        logger::log_api_response("compile", &result);
                                    } else if api_path.starts_with("run") {
                                        // Extract request body (GaiaScript code)
                                        let body_start = request.find("\r\n\r\n").unwrap_or(0) + 4;
                                        let gaia_code = &request[body_start..];
                                        
                                        println!("Running GaiaScript code: {}", gaia_code);
                                        logger::log_api_call("run", gaia_code);
                                        
                                        // Parse and run the GaiaScript
                                        let result = match parser::parse(gaia_code) {
                                            Ok(ast) => {
                                                let mut interpreter = Interpreter::new();
                                                match interpreter.interpret(&ast) {
                                                    Ok(value) => {
                                                        let result_str = format!("{:?}", value);
                                                        logger::info(&format!("Successfully ran GaiaScript code with result: {}", result_str));
                                                        logger::log_execution_result(&result_str);
                                                        format!("{{ \"success\": true, \"result\": \"{:?}\" }}", value)
                                                    },
                                                    Err(err) => {
                                                        let error_msg = format!("Runtime error: {}", err);
                                                        logger::error(&error_msg);
                                                        format!("{{ \"success\": false, \"error\": \"{}\" }}", error_msg)
                                                    }
                                                }
                                            },
                                            Err(err) => {
                                                let error_msg = format!("Parse error: {}", err);
                                                logger::error(&error_msg);
                                                format!("{{ \"success\": false, \"error\": \"{}\" }}", error_msg)
                                            }
                                        };
                                        
                                        // Send response
                                        let response = format!(
                                            "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}",
                                            result.len(),
                                            result
                                        );
                                        
                                        stream.write_all(response.as_bytes()).unwrap_or(());
                                        println!("Ran GaiaScript code");
                                        logger::log_api_response("run", &result);
                                    } else {
                                        // Unknown API endpoint
                                        let response = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\nAPI endpoint not found";
                                        stream.write_all(response.as_bytes()).unwrap_or(());
                                        println!("Unknown API endpoint: {}", api_path);
                                        logger::error(&format!("Unknown API endpoint: {}", api_path));
                                    }
                                } else {
                                    // Serve the requested file
                                    let file_path = if path == "/" {
                                        "web/gaia-playground.html".to_string()
                                    } else {
                                        format!("web{}", path)
                                    };
                                    
                                    if Path::new(&file_path).exists() {
                                        let content = fs::read(&file_path).unwrap_or_default();
                                        
                                        // Determine content type
                                        let content_type = if file_path.ends_with(".html") {
                                            "text/html"
                                        } else if file_path.ends_with(".js") {
                                            "application/javascript"
                                        } else if file_path.ends_with(".css") {
                                            "text/css"
                                        } else if file_path.ends_with(".gaia") {
                                            "text/plain"
                                        } else {
                                            "application/octet-stream"
                                        };
                                        
                                        // Handle .gaia files - serve them as plain text
                                        if path.ends_with(".gaia") {
                                            // If gaia file exists in examples directory, serve it
                                            let example_path = format!("examples/{}", path.split('/').last().unwrap_or(""));
                                            if Path::new(&example_path).exists() {
                                                let content = fs::read_to_string(example_path).unwrap_or_default();
                                                
                                                let response = format!(
                                                    "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: {}\r\n\r\n{}",
                                                    content.len(),
                                                    content
                                                );
                                                
                                                stream.write_all(response.as_bytes()).unwrap_or(());
                                                println!("Served example: {}", path);
                                                continue;
                                            }
                                        }
                                        
                                        // Send response for normal files
                                        let response = format!(
                                            "HTTP/1.1 200 OK\r\nContent-Type: {}\r\nContent-Length: {}\r\n\r\n",
                                            content_type,
                                            content.len()
                                        );
                                        
                                        stream.write_all(response.as_bytes()).unwrap_or(());
                                        stream.write_all(&content).unwrap_or(());
                                        
                                        println!("Served: {}", file_path);
                                        logger::info(&format!("Served file: {}", file_path));
                                    } else {
                                        // Send 404
                                        let response = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\nNot Found";
                                        stream.write_all(response.as_bytes()).unwrap_or(());
                                        println!("404: {}", file_path);
                                        logger::warning(&format!("404 Not Found: {}", file_path));
                                    }
                                }
                            },
                            Err(e) => {
                                println!("Connection error: {}", e);
                                logger::error(&format!("Connection error: {}", e));
                            }
                        }
                    }
                },
                Err(e) => {
                    println!("Error starting server: {}", e);
                    logger::error(&format!("Error starting server: {}", e));
                }
            }
        },
        _ => {
            println!("Unknown command: {}", args[1]);
            logger::error(&format!("Unknown command: {}", args[1]));
        }
    }
}

fn parse_file(filename: &str) {
    logger::info(&format!("Parsing file: {}", filename));
    
    let contents = match fs::read_to_string(filename) {
        Ok(c) => c,
        Err(e) => {
            println!("Error reading file: {}", e);
            logger::error(&format!("Error reading file {}: {}", filename, e));
            return;
        }
    };
    
    match parser::parse(&contents) {
        Ok(ast) => {
            println!("AST: {:#?}", ast);
            logger::info(&format!("Successfully parsed file: {}", filename));
        },
        Err(e) => {
            println!("Parse error: {}", e);
            logger::error(&format!("Parse error in file {}: {}", filename, e));
        }
    }
}

fn run_file(filename: &str) {
    logger::info(&format!("Running file: {}", filename));
    
    let contents = match fs::read_to_string(filename) {
        Ok(c) => c,
        Err(e) => {
            println!("Error reading file: {}", e);
            logger::error(&format!("Error reading file {}: {}", filename, e));
            return;
        }
    };
    
    match parser::parse(&contents) {
        Ok(ast) => {
            let mut interpreter = Interpreter::new();
            
            match interpreter.interpret(&ast) {
                Ok(result) => {
                    println!("Result: {:?}", result);
                    let result_str = format!("{:?}", result);
                    logger::info(&format!("Successfully ran file {} with result: {}", filename, result_str));
                    logger::log_execution_result(&result_str);
                },
                Err(e) => {
                    println!("Runtime error: {}", e);
                    logger::error(&format!("Runtime error in file {}: {}", filename, e));
                }
            }
        },
        Err(e) => {
            println!("Parse error: {}", e);
            logger::error(&format!("Parse error in file {}: {}", filename, e));
        }
    }
}

fn compile_file(filename: &str) {
    logger::info(&format!("Compiling file to JavaScript: {}", filename));
    
    let contents = match fs::read_to_string(filename) {
        Ok(c) => c,
        Err(e) => {
            println!("Error reading file: {}", e);
            logger::error(&format!("Error reading file {}: {}", filename, e));
            return;
        }
    };
    
    match parser::parse(&contents) {
        Ok(ast) => {
            println!("Compiling to JavaScript...");
            logger::info("Parsing successful, compiling to JavaScript...");
            
            // Generate JavaScript output filename
            let path = Path::new(filename);
            let stem = path.file_stem().unwrap().to_str().unwrap();
            let js_filename = format!("{}.js", stem);
            
            // Compile AST to JavaScript
            let js_code = compile_to_js(&ast);
            
            // Write JavaScript to file
            match fs::write(&js_filename, js_code) {
                Ok(_) => {
                    println!("Successfully compiled to {}", js_filename);
                    logger::info(&format!("Successfully compiled {} to {}", filename, js_filename));
                },
                Err(e) => {
                    println!("Error writing JavaScript file: {}", e);
                    logger::error(&format!("Error writing JavaScript file {}: {}", js_filename, e));
                }
            }
        },
        Err(e) => {
            println!("Parse error: {}", e);
            logger::error(&format!("Parse error in file {}: {}", filename, e));
        }
    }
}

fn compile_to_assembly(filename: &str, target: gaiascript::asm_compiler::AsmTarget) {
    let target_name = match target {
        gaiascript::asm_compiler::AsmTarget::X86_64 => "x86_64",
        gaiascript::asm_compiler::AsmTarget::ARM64 => "arm64",
        gaiascript::asm_compiler::AsmTarget::WASM => "wasm",
    };
    
    logger::info(&format!("Compiling file to {} assembly: {}", target_name, filename));
    
    let contents = match fs::read_to_string(filename) {
        Ok(c) => c,
        Err(e) => {
            println!("Error reading file: {}", e);
            logger::error(&format!("Error reading file {}: {}", filename, e));
            return;
        }
    };
    
    match parser::parse(&contents) {
        Ok(ast) => {
            println!("Compiling to {} assembly...", target_name);
            logger::info(&format!("Parsing successful, compiling to {} assembly...", target_name));
            
            // Generate assembly output filename
            let path = Path::new(filename);
            let stem = path.file_stem().unwrap().to_str().unwrap();
            let asm_extension = match target {
                gaiascript::asm_compiler::AsmTarget::X86_64 => "s",
                gaiascript::asm_compiler::AsmTarget::ARM64 => "s",
                gaiascript::asm_compiler::AsmTarget::WASM => "wat",
            };
            let asm_filename = format!("{}_{}.{}", stem, target_name, asm_extension);
            
            // Compile AST to assembly
            let asm_code = gaiascript::asm_compiler::compile_to_asm(&ast, target);
            
            // Write assembly to file
            match fs::write(&asm_filename, asm_code) {
                Ok(_) => {
                    println!("Successfully compiled to {}", asm_filename);
                    println!("Assembly code is ready to be assembled with appropriate tools.");
                    logger::info(&format!("Successfully compiled {} to {}", filename, asm_filename));
                    
                    let assembly_instructions = match target {
                        gaiascript::asm_compiler::AsmTarget::X86_64 => {
                            let instructions = format!("To assemble: nasm -f elf64 {} -o {}.o\nTo link: ld {}.o -o {}", 
                                asm_filename, stem, stem, stem);
                            println!("To assemble: nasm -f elf64 {} -o {}.o", asm_filename, stem);
                            println!("To link: ld {}.o -o {}", stem, stem);
                            instructions
                        },
                        gaiascript::asm_compiler::AsmTarget::ARM64 => {
                            let instructions = format!("To assemble: as {} -o {}.o\nTo link: ld {}.o -o {}", 
                                asm_filename, stem, stem, stem);
                            println!("To assemble: as {} -o {}.o", asm_filename, stem);
                            println!("To link: ld {}.o -o {}", stem, stem);
                            instructions
                        },
                        gaiascript::asm_compiler::AsmTarget::WASM => {
                            let instructions = format!("To convert to binary WebAssembly:\nwat2wasm {} -o {}.wasm", 
                                asm_filename, stem);
                            println!("To convert to binary WebAssembly:");
                            println!("wat2wasm {} -o {}.wasm", asm_filename, stem);
                            instructions
                        },
                    };
                    
                    logger::info(&format!("Assembly instructions: {}", assembly_instructions));
                },
                Err(e) => {
                    println!("Error writing assembly file: {}", e);
                    logger::error(&format!("Error writing assembly file {}: {}", asm_filename, e));
                }
            }
        },
        Err(e) => {
            println!("Parse error: {}", e);
            logger::error(&format!("Parse error in file {}: {}", filename, e));
        }
    }
}

// Very simple JS compilation - in a real implementation, this would be more sophisticated
fn compile_to_js(ast: &gaiascript::ast::ASTNode) -> String {
    let mut js = String::new();
    
    js.push_str("// Generated from GaiaScript\n\n");
    js.push_str("class GaiaModel {\n");
    js.push_str("    constructor() {\n");
    js.push_str("        this.layers = [];\n");
    js.push_str("        this.components = {};\n");
    js.push_str("    }\n\n");
    
    js.push_str("    addLayer(type, config) {\n");
    js.push_str("        this.layers.push({ type, config });\n");
    js.push_str("        return this;\n");
    js.push_str("    }\n\n");
    
    js.push_str("    addComponent(name, model) {\n");
    js.push_str("        this.components[name] = model;\n");
    js.push_str("        return this;\n");
    js.push_str("    }\n\n");
    
    js.push_str("    execute(input) {\n");
    js.push_str("        console.log('Executing model with input:', input);\n");
    js.push_str("        return { output: 'GaiaScript model output' };\n");
    js.push_str("    }\n");
    js.push_str("}\n\n");
    
    // Basic visualization function for 3D rendering
    js.push_str("function visualizeModel(model, container) {\n");
    js.push_str("    // Create THREE.js visualization\n");
    js.push_str("    const scene = new THREE.Scene();\n");
    js.push_str("    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);\n");
    js.push_str("    const renderer = new THREE.WebGLRenderer();\n");
    js.push_str("    renderer.setSize(container.clientWidth, container.clientHeight);\n");
    js.push_str("    container.appendChild(renderer.domElement);\n\n");
    
    js.push_str("    // Create network visualization\n");
    js.push_str("    let y = 0;\n");
    js.push_str("    const nodes = [];\n\n");
    
    js.push_str("    model.layers.forEach((layer, i) => {\n");
    js.push_str("        const geometry = new THREE.SphereGeometry(0.5, 32, 32);\n");
    js.push_str("        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });\n");
    js.push_str("        const node = new THREE.Mesh(geometry, material);\n");
    js.push_str("        node.position.set(0, y, 0);\n");
    js.push_str("        scene.add(node);\n");
    js.push_str("        nodes.push(node);\n");
    js.push_str("        y -= 2;\n");
    js.push_str("    });\n\n");
    
    js.push_str("    camera.position.z = 5;\n\n");
    
    js.push_str("    function animate() {\n");
    js.push_str("        requestAnimationFrame(animate);\n");
    js.push_str("        nodes.forEach(node => { node.rotation.x += 0.01; node.rotation.y += 0.01; });\n");
    js.push_str("        renderer.render(scene, camera);\n");
    js.push_str("    }\n\n");
    
    js.push_str("    animate();\n");
    js.push_str("}\n\n");
    
    // Create model instance
    js.push_str("const model = new GaiaModel();\n\n");
    
    match ast {
        gaiascript::ast::ASTNode::Network(network) => {
            // Add components from the AST
            js.push_str("// Network components\n");
            
            // For simplicity, we'll add placeholders for components and layers
            js.push_str("model.addLayer('input', { units: 32 });\n");
            js.push_str("model.addLayer('dense', { units: 64, activation: 'relu' });\n");
            js.push_str("model.addLayer('output', { units: 10, activation: 'softmax' });\n\n");
            
            js.push_str("// Expose the model\n");
            js.push_str("window.gaiaModel = model;\n\n");
            
            js.push_str("// Auto-visualize when placed in a container\n");
            js.push_str("document.addEventListener('DOMContentLoaded', () => {\n");
            js.push_str("    const container = document.getElementById('gaia-container');\n");
            js.push_str("    if (container) {\n");
            js.push_str("        visualizeModel(model, container);\n");
            js.push_str("    }\n");
            js.push_str("});\n");
        },
        _ => {
            js.push_str("console.error('Invalid AST: expected network');\n");
        }
    }
    
    js
}