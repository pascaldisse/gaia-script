use std::fs;
use std::path::Path;
use gaiascript::parser;
use gaiascript::asm_compiler::{AsmTarget, compile_to_asm};

fn main() {
    // Read the test file
    let filename = "examples/simple_test.gaia";
    let contents = match fs::read_to_string(filename) {
        Ok(c) => c,
        Err(e) => {
            println!("Error reading file: {}", e);
            return;
        }
    };
    
    // Parse the GaiaScript code
    match parser::parse(&contents) {
        Ok(ast) => {
            // Compile to x86_64 assembly
            let x86_asm = compile_to_asm(&ast, AsmTarget::X86_64);
            
            // Generate output filename
            let path = Path::new(filename);
            let stem = path.file_stem().unwrap().to_str().unwrap();
            let asm_filename = format!("{}_x86_64.s", stem);
            
            // Write assembly to file
            match fs::write(&asm_filename, x86_asm) {
                Ok(_) => {
                    println!("Successfully compiled to x86_64 assembly: {}", asm_filename);
                },
                Err(e) => {
                    println!("Error writing assembly file: {}", e);
                }
            }
            
            // Compile to ARM64 assembly
            let arm_asm = compile_to_asm(&ast, AsmTarget::ARM64);
            let arm_filename = format!("{}_arm64.s", stem);
            
            // Write assembly to file
            match fs::write(&arm_filename, arm_asm) {
                Ok(_) => {
                    println!("Successfully compiled to ARM64 assembly: {}", arm_filename);
                },
                Err(e) => {
                    println!("Error writing assembly file: {}", e);
                }
            }
            
            // Compile to WebAssembly
            let wasm_asm = compile_to_asm(&ast, AsmTarget::WASM);
            let wasm_filename = format!("{}_wasm.wat", stem);
            
            // Write assembly to file
            match fs::write(&wasm_filename, wasm_asm) {
                Ok(_) => {
                    println!("Successfully compiled to WebAssembly text format: {}", wasm_filename);
                },
                Err(e) => {
                    println!("Error writing WebAssembly file: {}", e);
                }
            }
        },
        Err(e) => {
            println!("Parse error: {}", e);
        }
    }
}