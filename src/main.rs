use std::env;
use std::fs;
use std::path::Path;
use std::net::TcpListener;

use gaiascript::parser;
use gaiascript::interpreter::Interpreter;
use gaiascript::compiler::JsCompiler;
use gaiascript::compilers::kotlin_compiler::KotlinCompiler;
use gaiascript::compilers::react_compiler::ReactCompiler;
use gaiascript::compilers::flutter_compiler::FlutterCompiler;
use gaiascript::compilers::lynx_compiler::LynxCompiler;
use gaiascript::compilers::llvm_compiler::LLVMCompiler;
use gaiascript::ast::SymbolTable;

fn main() {
    let args: Vec<String> = env::args().collect();
    
    if args.len() < 2 {
        println!("Usage:");
        println!("  cargo run -- parse <filename>          # Parse and display AST");
        println!("  cargo run -- run <filename>            # Run GaiaScript program");
        println!("  cargo run -- compile <filename>        # Compile to JavaScript");
        println!("  cargo run -- target <filename> <plat>  # Compile to target platform");
        println!("    Platforms: js, kotlin, react, flutter, lynx, wasm, x86_64, arm64, llvm");
        println!("  cargo run -- asm <filename> [arch]     # Compile to assembly (x86_64, arm64, wasm)");
        println!("  cargo run -- serve                     # Start web server");
        println!("  cargo run -- llvm <filename> [output]  # Compile to native code using LLVM");
        return;
    }
    
    match args[1].as_str() {
        "llvm" => {
            if args.len() < 3 {
                println!("Error: Missing filename");
                return;
            }
            
            let filename = &args[2];
            let output_name = if args.len() >= 4 {
                &args[3]
            } else {
                // Default output name based on input filename
                let path = Path::new(filename);
                path.file_stem().unwrap().to_str().unwrap()
            };
            
            let show_ir = args.iter().any(|arg| arg == "--show-ir");
            
            // Compile the file to native code using LLVM
            compile_with_llvm(filename, output_name, show_ir);
        },
        "parse" => {
            if args.len() < 3 {
                println!("Error: Missing filename");
                return;
            }
            
            parse_file(&args[2]);
        },
        "run" => {
            if args.len() < 3 {
                println!("Error: Missing filename");
                return;
            }
            
            run_file(&args[2]);
        },
        "compile" => {
            if args.len() < 3 {
                println!("Error: Missing filename");
                return;
            }
            
            compile_file(&args[2]);
        },
        "target" => {
            if args.len() < 4 {
                println!("Error: Usage: target <filename> <platform>");
                println!("Platforms: js, kotlin, react, flutter, lynx, wasm, x86_64, arm64");
                return;
            }
            
            let filename = &args[2];
            let platform = &args[3];
            
            compile_to_target(filename, platform);
        },
        "asm" => {
            if args.len() < 3 {
                println!("Error: Missing filename");
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
                        gaiascript::asm_compiler::AsmTarget::X86_64
                    }
                }
            } else {
                println!("No architecture specified, using x86_64");
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
            
            // Basic web server implementation
            match TcpListener::bind(format!("0.0.0.0:{}", port)) {
                Ok(listener) => {
                    println!("Server started at http://localhost:{}", port);
                    println!("Available paths:");
                    println!("  http://localhost:{}/gaia-playground.html - GaiaScript Playground", port);
                    println!("  http://localhost:{}/gaia-morphsphere.html - MorphSphere Game", port);
                    
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
                                        
                                        // Parse the GaiaScript
                                        let result = match parser::parse(gaia_code) {
                                            Ok(ast) => {
                                                let js = compile_to_js(&ast);
                                                // Escape quotes for JSON
                                                let escaped_js = js.replace("\"", "\\\"").replace("\n", "\\n");
                                                format!("{{ \"success\": true, \"javascript\": \"{}\" }}", escaped_js)
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
                                        
                                        stream.write_all(response.as_bytes()).unwrap_or(());
                                        println!("Compiled GaiaScript code");
                                    } else if api_path.starts_with("run") {
                                        // Extract request body (GaiaScript code)
                                        let body_start = request.find("\r\n\r\n").unwrap_or(0) + 4;
                                        let gaia_code = &request[body_start..];
                                        
                                        println!("Running GaiaScript code: {}", gaia_code);
                                        
                                        // Parse and run the GaiaScript
                                        let result = match parser::parse(gaia_code) {
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
                                        
                                        stream.write_all(response.as_bytes()).unwrap_or(());
                                        println!("Ran GaiaScript code");
                                    } else {
                                        // Unknown API endpoint
                                        let response = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\nAPI endpoint not found";
                                        stream.write_all(response.as_bytes()).unwrap_or(());
                                        println!("Unknown API endpoint: {}", api_path);
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
                                    } else {
                                        // Send 404
                                        let response = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\nNot Found";
                                        stream.write_all(response.as_bytes()).unwrap_or(());
                                        println!("404: {}", file_path);
                                    }
                                }
                            },
                            Err(e) => {
                                println!("Connection error: {}", e);
                            }
                        }
                    }
                },
                Err(e) => {
                    println!("Error starting server: {}", e);
                }
            }
        },
        _ => {
            println!("Unknown command: {}", args[1]);
        }
    }
}

fn parse_file(filename: &str) {
    let contents = match fs::read_to_string(filename) {
        Ok(c) => c,
        Err(e) => {
            println!("Error reading file: {}", e);
            return;
        }
    };
    
    match parser::parse(&contents) {
        Ok(ast) => {
            println!("AST: {:#?}", ast);
        },
        Err(e) => {
            println!("Parse error: {}", e);
        }
    }
}

fn run_file(filename: &str) {
    let contents = match fs::read_to_string(filename) {
        Ok(c) => c,
        Err(e) => {
            println!("Error reading file: {}", e);
            return;
        }
    };
    
    match parser::parse(&contents) {
        Ok(ast) => {
            let mut interpreter = Interpreter::new();
            
            match interpreter.interpret(&ast) {
                Ok(result) => {
                    println!("Result: {:?}", result);
                },
                Err(e) => {
                    println!("Runtime error: {}", e);
                }
            }
        },
        Err(e) => {
            println!("Parse error: {}", e);
        }
    }
}

fn compile_file(filename: &str) {
    let contents = match fs::read_to_string(filename) {
        Ok(c) => c,
        Err(e) => {
            println!("Error reading file: {}", e);
            return;
        }
    };
    
    match parser::parse(&contents) {
        Ok(ast) => {
            println!("Compiling to JavaScript...");
            
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
                },
                Err(e) => {
                    println!("Error writing JavaScript file: {}", e);
                }
            }
        },
        Err(e) => {
            println!("Parse error: {}", e);
        }
    }
}

fn compile_to_assembly(filename: &str, target: gaiascript::asm_compiler::AsmTarget) {
    let contents = match fs::read_to_string(filename) {
        Ok(c) => c,
        Err(e) => {
            println!("Error reading file: {}", e);
            return;
        }
    };
    
    match parser::parse(&contents) {
        Ok(ast) => {
            let target_name = match target {
                gaiascript::asm_compiler::AsmTarget::X86_64 => "x86_64",
                gaiascript::asm_compiler::AsmTarget::ARM64 => "arm64",
                gaiascript::asm_compiler::AsmTarget::WASM => "wasm",
            };
            
            println!("Compiling to {} assembly...", target_name);
            
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
                    
                    match target {
                        gaiascript::asm_compiler::AsmTarget::X86_64 => {
                            println!("To assemble: nasm -f elf64 {} -o {}.o", asm_filename, stem);
                            println!("To link: ld {}.o -o {}", stem, stem);
                        },
                        gaiascript::asm_compiler::AsmTarget::ARM64 => {
                            println!("To assemble: as {} -o {}.o", asm_filename, stem);
                            println!("To link: ld {}.o -o {}", stem, stem);
                        },
                        gaiascript::asm_compiler::AsmTarget::WASM => {
                            println!("To convert to binary WebAssembly:");
                            println!("wat2wasm {} -o {}.wasm", asm_filename, stem);
                        },
                    }
                },
                Err(e) => {
                    println!("Error writing assembly file: {}", e);
                }
            }
        },
        Err(e) => {
            println!("Parse error: {}", e);
        }
    }
}

// Very simple JS compilation - in a real implementation, this would be more sophisticated
fn compile_to_js(ast: &gaiascript::ast::ASTNode) -> String {
    let mut compiler = JsCompiler::new();
    match compiler.compile(ast) {
        Ok(js) => js,
        Err(e) => format!("// Compilation error: {}\nconsole.error('Compilation error: {}');", e, e)
    }
}

fn compile_with_llvm(filename: &str, output_name: &str, show_ir: bool) {
    let contents = match fs::read_to_string(filename) {
        Ok(c) => c,
        Err(e) => {
            println!("Error reading file: {}", e);
            return;
        }
    };
    
    match parser::parse(&contents) {
        Ok(ast) => {
            println!("Compiling to native code using LLVM...");
            
            // Create an LLVM compiler
            let mut compiler = LLVMCompiler::new("gaiascript_module");
            let mut symbol_table = SymbolTable::new();
            
            // Compile the AST to LLVM IR
            match compiler.compile(&ast, &mut symbol_table) {
                Ok(_) => {
                    // Create a main function
                    match compiler.create_main_function() {
                        Ok(_) => {
                            // Show the generated LLVM IR if requested
                            if show_ir {
                                println!("Generated LLVM IR:");
                                println!("{}", compiler.print_ir());
                            }
                            
                            // Write the compiled code to an executable file
                            match compiler.write_to_file(output_name) {
                                Ok(_) => {
                                    println!("Successfully compiled to '{}'", output_name);
                                    println!("You can run the executable with: ./{}", output_name);
                                },
                                Err(e) => println!("Error generating executable: {}", e),
                            }
                        },
                        Err(e) => println!("Error creating main function: {}", e),
                    }
                },
                Err(e) => {
                    println!("Compilation error: {}", e);
                    println!("Note: LLVM support is currently disabled. To enable it:");
                    println!("1. Install LLVM 14.0 (brew install llvm@14)");
                    println!("2. Set LLVM_SYS_140_PREFIX environment variable (export LLVM_SYS_140_PREFIX=$(brew --prefix llvm@14))");
                    println!("3. Uncomment inkwell dependency in Cargo.toml");
                    println!("4. Restore LLVM compiler implementation in src/compilers/llvm_compiler.rs");
                },
            }
        },
        Err(e) => {
            println!("Parse error: {}", e);
        }
    }
}

fn compile_to_target(filename: &str, platform: &str) {
    let contents = match fs::read_to_string(filename) {
        Ok(c) => c,
        Err(e) => {
            println!("Error reading file: {}", e);
            return;
        }
    };
    
    match parser::parse(&contents) {
        Ok(ast) => {
            println!("Compiling to {} ...", platform);
            
            // Generate output filename
            let path = Path::new(filename);
            let stem = path.file_stem().unwrap().to_str().unwrap();
            
            let (output_code, extension) = match platform {
                "js" => {
                    let mut compiler = JsCompiler::new();
                    match compiler.compile(&ast) {
                        Ok(code) => (code, "js".to_string()),
                        Err(e) => {
                            println!("Compilation error: {}", e);
                            return;
                        }
                    }
                },
                "kotlin" => {
                    let mut compiler = KotlinCompiler::new();
                    match compiler.compile(&ast) {
                        Ok(code) => (code, "kt".to_string()),
                        Err(e) => {
                            println!("Compilation error: {}", e);
                            return;
                        }
                    }
                },
                "react" => {
                    let mut compiler = ReactCompiler::new();
                    match compiler.compile(&ast) {
                        Ok(code) => (code, "jsx".to_string()),
                        Err(e) => {
                            println!("Compilation error: {}", e);
                            return;
                        }
                    }
                },
                "flutter" => {
                    let mut compiler = FlutterCompiler::new();
                    match compiler.compile(&ast) {
                        Ok(code) => (code, "dart".to_string()),
                        Err(e) => {
                            println!("Compilation error: {}", e);
                            return;
                        }
                    }
                },
                "lynx" => {
                    let mut compiler = LynxCompiler::new();
                    match compiler.compile(&ast) {
                        Ok(code) => (code, "tsx".to_string()),
                        Err(e) => {
                            println!("Compilation error: {}", e);
                            return;
                        }
                    }
                },
                "wasm" => {
                    (gaiascript::asm_compiler::compile_to_asm(&ast, gaiascript::asm_compiler::AsmTarget::WASM), "wat".to_string())
                },
                "x86_64" => {
                    (gaiascript::asm_compiler::compile_to_asm(&ast, gaiascript::asm_compiler::AsmTarget::X86_64), "s".to_string())
                },
                "arm64" => {
                    (gaiascript::asm_compiler::compile_to_asm(&ast, gaiascript::asm_compiler::AsmTarget::ARM64), "s".to_string())
                },
                "llvm" => {
                    // Just add a placeholder here, we'll handle actual LLVM compilation 
                    // in the specific llvm command path
                    ("// LLVM compilation requires the 'llvm' command.".to_string(), "ll".to_string())
                },
                _ => {
                    println!("Unknown platform: {}", platform);
                    println!("Supported platforms: js, kotlin, react, flutter, lynx, wasm, x86_64, arm64, llvm");
                    return;
                }
            };
            
            let output_filename = format!("{}_{}.{}", stem, platform, extension);
            
            // Write to file
            match fs::write(&output_filename, output_code) {
                Ok(_) => {
                    println!("Successfully compiled to {}", output_filename);
                },
                Err(e) => {
                    println!("Error writing file: {}", e);
                }
            }
        },
        Err(e) => {
            println!("Parse error: {}", e);
        }
    }
}