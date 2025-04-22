mod ast;
mod parser;
mod interpreter;

use std::fs;
use std::path::PathBuf;
use std::process;
use clap::{Parser, Subcommand};
use crate::interpreter::Interpreter;

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
    
    /// Interactive REPL mode
    Repl,
}

fn main() {
    let cli = Cli::parse();
    
    match &cli.command {
        Commands::Run { file, ast } => {
            run_file(file, *ast);
        },
        Commands::Parse { file } => {
            parse_file(file);
        },
        Commands::Repl => {
            println!("REPL mode not implemented yet");
        },
    }
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