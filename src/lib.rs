pub mod ast;
pub mod parser;
pub mod interpreter;
pub mod asm_compiler;
pub mod compiler;
pub mod web_server;
pub mod extensions {
    pub mod ui_extensions;
    pub mod three_extensions;
}
pub mod compilers {
    pub mod kotlin_compiler;
    pub mod react_compiler;
    pub mod flutter_compiler;
    pub mod lynx_compiler;
    pub mod llvm_compiler;
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
}