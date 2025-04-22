mod ast;
mod parser;
mod interpreter;
mod web_server;
mod compiler;

use std::fs;
use std::path::PathBuf;
use std::process;
use std::io;
use clap::{Parser, Subcommand};
use crate::interpreter::Interpreter;
use crate::compiler::JsCompiler;

#[derive(Parser)]
#[clap(name = "gaiascript", about = "AI-Optimized Programming Language (AOPL) interpreter")]
struct Cli {
    #[clap(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Run a GaiaScript program
    Run {
        /// The path to the GaiaScript file to run
        #[clap(value_parser)]
        file: PathBuf,
        
        /// Print the AST instead of executing
        #[clap(short, long)]
        ast: bool,
    },
    
    /// Parse and print the AST of a GaiaScript program
    Parse {
        /// The path to the GaiaScript file to parse
        #[clap(value_parser)]
        file: PathBuf,
    },
    
    /// Compile a GaiaScript program to JavaScript
    Compile {
        /// The path to the GaiaScript file to compile
        #[clap(value_parser)]
        file: PathBuf,
        
        /// The output JavaScript file path
        #[clap(short, long)]
        output: Option<PathBuf>,
    },
    
    /// Interactive REPL mode
    Repl,
    
    /// Start a web server to run the MorphSphere game
    Serve {
        /// The port to listen on
        #[clap(short, long, default_value_t = 8080)]
        port: u16,
    },
}

fn main() -> io::Result<()> {
    let cli = Cli::parse();
    
    match &cli.command {
        Commands::Run { file, ast } => {
            run_file(file, *ast);
        },
        Commands::Parse { file } => {
            parse_file(file);
        },
        Commands::Compile { file, output } => {
            compile_file(file, output);
        },
        Commands::Repl => {
            println!("REPL mode not implemented yet");
        },
        Commands::Serve { port } => {
            return web_server::start_server(*port);
        },
    }
    
    Ok(())
}

fn run_file(file: &PathBuf, print_ast: bool) {
    let content = match fs::read_to_string(file) {
        Ok(content) => content,
        Err(err) => {
            eprintln!("Error reading file {}: {}", file.display(), err);
            process::exit(1);
        }
    };
    
    match parser::parse(&content) {
        Ok(ast) => {
            if print_ast {
                println!("AST: {:?}", ast);
            } else {
                println!("Executing program from {}", file.display());
                let mut interpreter = Interpreter::new();
                match interpreter.interpret(&ast) {
                    Ok(value) => {
                        println!("Program executed successfully");
                        println!("Result: {:?}", value);
                    },
                    Err(err) => {
                        eprintln!("Runtime error: {}", err);
                        process::exit(1);
                    }
                }
            }
        },
        Err(err) => {
            eprintln!("Error parsing file {}: {}", file.display(), err);
            process::exit(1);
        }
    }
}

fn parse_file(file: &PathBuf) {
    let content = match fs::read_to_string(file) {
        Ok(content) => content,
        Err(err) => {
            eprintln!("Error reading file {}: {}", file.display(), err);
            process::exit(1);
        }
    };
    
    match parser::parse(&content) {
        Ok(ast) => {
            println!("AST: {:#?}", ast);
        },
        Err(err) => {
            eprintln!("Error parsing file {}: {}", file.display(), err);
            process::exit(1);
        }
    }
}

fn compile_file(file: &PathBuf, output: &Option<PathBuf>) {
    let content = match fs::read_to_string(file) {
        Ok(content) => content,
        Err(err) => {
            eprintln!("Error reading file {}: {}", file.display(), err);
            process::exit(1);
        }
    };
    
    match parser::parse(&content) {
        Ok(ast) => {
            let mut compiler = JsCompiler::new();
            match compiler.compile(&ast) {
                Ok(js_code) => {
                    // Determine output path
                    let output_path = match output {
                        Some(path) => path.clone(),
                        None => {
                            let mut default_path = file.clone();
                            default_path.set_extension("js");
                            default_path
                        }
                    };
                    
                    // Write to file
                    match fs::write(&output_path, js_code) {
                        Ok(_) => {
                            println!("Successfully compiled to {}", output_path.display());
                        },
                        Err(err) => {
                            eprintln!("Error writing to output file {}: {}", output_path.display(), err);
                            process::exit(1);
                        }
                    }
                },
                Err(err) => {
                    eprintln!("Compilation error: {}", err);
                    process::exit(1);
                }
            }
        },
        Err(err) => {
            eprintln!("Error parsing file {}: {}", file.display(), err);
            process::exit(1);
        }
    }
}