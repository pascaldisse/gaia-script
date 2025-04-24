// Core language components
pub mod ast;
pub mod parser;
pub mod interpreter;
pub mod compiler;
pub mod asm_compiler;

// Platform support
pub mod platform_detector;
pub mod universal_compiler;

// Web server
pub mod web_server;

// Extensions
pub mod extensions {
    pub mod ui_extensions;
    pub mod three_extensions;
}

// Target-specific compilers
pub mod compilers {
    // Mobile platforms
    pub mod android_compiler;
    pub mod flutter_compiler;
    
    // Desktop platforms
    pub mod macos_compiler;
    pub mod windows_compiler;
    pub mod linux_compiler;
    
    // Web platforms
    pub mod react_compiler;
    pub mod lynx_compiler;
    
    // Native compilation
    pub mod llvm_compiler;
    
    // JVM platforms
    pub mod kotlin_compiler;
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_parse_simple_network() {
        let input = "N";
        let result = parser::parse(input);
        assert!(result.is_ok(), "Failed to parse: {:?}", result.err());
    }
    
    #[test]
    fn test_asm_compilation() {
        let input = "N I → C₁ 32 → D₁ 10";
        let ast = parser::parse(input).unwrap();
        
        // X86_64 compilation
        let x86_asm = asm_compiler::compile_to_asm(&ast, asm_compiler::AsmTarget::X86_64);
        assert!(x86_asm.contains("section .text"));
        assert!(x86_asm.contains("global _start"));
        
        // ARM64 compilation
        let arm_asm = asm_compiler::compile_to_asm(&ast, asm_compiler::AsmTarget::ARM64);
        assert!(arm_asm.contains(".global _start"));
        
        // WebAssembly compilation
        let wasm_asm = asm_compiler::compile_to_asm(&ast, asm_compiler::AsmTarget::WASM);
        assert!(wasm_asm.contains("(module"));
        assert!(wasm_asm.contains("(func (export \"run\")"));
    }
    
    #[test]
    fn test_platform_detection() {
        // This just tests that the function runs, actual platform will vary
        let platform = platform_detector::detect_platform();
        println!("Detected platform: {:?}", platform);
        assert!(platform_detector::platform_name(platform) != "", "Platform name should not be empty");
    }
}