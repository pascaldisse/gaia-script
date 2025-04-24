use gaiascript::ast::*;
use gaiascript::asm_compiler::*;
use gaiascript::parser::parse as parse_gaiascript;
use std::env;
use std::fs;
use std::io::{self, Write};
use std::path::Path;

fn main() -> io::Result<()> {
    // Get arguments
    let args: Vec<String> = env::args().collect();
    
    if args.len() < 2 {
        println!("Usage: build_gaiaui_wasm <input_gaia_file> [output_wasm_file]");
        return Ok(());
    }
    
    let input_file = &args[1];
    let output_file = if args.len() >= 3 {
        args[2].clone()
    } else {
        // Default output file is in web directory
        let input_path = Path::new(input_file);
        let file_stem = input_path.file_stem().unwrap_or_default().to_string_lossy();
        format!("web/gaiaui.wasm")
    };
    
    println!("Building GaiaUI WebAssembly module from: {}", input_file);
    println!("Output file: {}", output_file);
    
    // Read input file
    let source = fs::read_to_string(input_file)?;
    
    // Parse GaiaScript source
    println!("Parsing GaiaScript source...");
    let ast = match parse_gaiascript(&source) {
        Ok(ast) => ast,
        Err(e) => {
            eprintln!("Failed to parse GaiaScript source: {}", e);
            return Err(io::Error::new(io::ErrorKind::InvalidData, "Failed to parse GaiaScript"));
        }
    };
    
    // Compile to WebAssembly
    println!("Compiling to WebAssembly...");
    let wasm_wat = compile_to_asm(&ast, AsmTarget::WASMUI);
    
    // Save the WAT file first
    let wat_file = format!("{}.wat", output_file);
    fs::write(&wat_file, wasm_wat.clone())?;
    println!("WebAssembly text format saved to: {}", wat_file);
    
    // Check if wat2wasm is installed
    if which::which("wat2wasm").is_err() {
        println!("Warning: wat2wasm not found in PATH. Please install WebAssembly Binary Toolkit (WABT).");
        println!("You can install it with: brew install wabt (on macOS) or npm install -g wabt");
        println!("Then run: wat2wasm {} -o {}", wat_file, output_file);
        return Ok(());
    }
    
    // Convert WAT to WASM using wat2wasm
    println!("Converting WAT to WASM binary...");
    
    // Create output directory if it doesn't exist
    if let Some(parent) = Path::new(&output_file).parent() {
        fs::create_dir_all(parent)?;
    }
    
    let output = std::process::Command::new("wat2wasm")
        .arg(&wat_file)
        .arg("-o")
        .arg(&output_file)
        .output()?;
    
    if !output.status.success() {
        eprintln!("Error converting WAT to WASM:");
        io::stderr().write_all(&output.stderr)?;
        return Err(io::Error::new(io::ErrorKind::Other, "wat2wasm failed"));
    }
    
    // Try to optimize with wasm-opt if available
    if which::which("wasm-opt").is_ok() {
        println!("Optimizing WASM with wasm-opt...");
        
        let opt_output = std::process::Command::new("wasm-opt")
            .arg("-Oz")
            .arg(&output_file)
            .arg("-o")
            .arg(format!("{}.opt", output_file))
            .output()?;
            
        if opt_output.status.success() {
            // Replace original with optimized version
            fs::rename(format!("{}.opt", output_file), &output_file)?;
            println!("Optimized WASM with wasm-opt");
        } else {
            println!("Warning: wasm-opt optimization failed, using unoptimized version");
        }
    } else {
        println!("Note: Install binaryen for smaller builds: npm install -g binaryen");
    }
    
    // Get file size
    let wasm_size = fs::metadata(&output_file)?.len();
    println!("WebAssembly compiled successfully! Size: {} bytes", wasm_size);
    
    Ok(())
}