use crate::ast::*;
use std::fmt::Write;

/// Assembly target architecture
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum AsmTarget {
    X86_64,
    ARM64,
    WASM,  // WebAssembly
}

/// Compiler for GaiaScript to assembly
pub struct AsmCompiler {
    target: AsmTarget,
    code: String,
    temp_var_count: usize,
    label_count: usize,
}

impl AsmCompiler {
    pub fn new(target: AsmTarget) -> Self {
        let mut compiler = Self {
            target,
            code: String::new(),
            temp_var_count: 0,
            label_count: 0,
        };
        
        // Add assembly preamble based on target
        compiler.add_preamble();
        
        compiler
    }
    
    /// Generate a new unique label
    fn new_label(&mut self, prefix: &str) -> String {
        let label = format!("{}_L{}", prefix, self.label_count);
        self.label_count += 1;
        label
    }
    
    /// Generate a new temporary variable name
    fn new_temp(&mut self) -> String {
        let temp = format!("temp_{}", self.temp_var_count);
        self.temp_var_count += 1;
        temp
    }
    
    /// Add architecture-specific preamble
    fn add_preamble(&mut self) {
        match self.target {
            AsmTarget::X86_64 => {
                writeln!(&mut self.code, "; GaiaScript X86-64 Assembly").unwrap();
                writeln!(&mut self.code, "section .text").unwrap();
                writeln!(&mut self.code, "global _start").unwrap();
                writeln!(&mut self.code, "_start:").unwrap();
            },
            AsmTarget::ARM64 => {
                writeln!(&mut self.code, "// GaiaScript ARM64 Assembly").unwrap();
                writeln!(&mut self.code, ".text").unwrap();
                writeln!(&mut self.code, ".global _start").unwrap();
                writeln!(&mut self.code, "_start:").unwrap();
            },
            AsmTarget::WASM => {
                writeln!(&mut self.code, ";; GaiaScript WebAssembly").unwrap();
                writeln!(&mut self.code, "(module").unwrap();
                writeln!(&mut self.code, "  (memory (export \"memory\") 1)").unwrap();
                writeln!(&mut self.code, "  (func (export \"run\") (result i32)").unwrap();
            },
        }
    }
    
    /// Add architecture-specific postamble (closing code)
    fn add_postamble(&mut self) {
        match self.target {
            AsmTarget::X86_64 => {
                writeln!(&mut self.code, "    ; Exit system call").unwrap();
                writeln!(&mut self.code, "    mov rax, 60 ; sys_exit").unwrap();
                writeln!(&mut self.code, "    mov rdi, 0  ; exit code 0").unwrap();
                writeln!(&mut self.code, "    syscall").unwrap();
            },
            AsmTarget::ARM64 => {
                writeln!(&mut self.code, "    // Exit").unwrap();
                writeln!(&mut self.code, "    mov x0, #0  // Exit code 0").unwrap();
                writeln!(&mut self.code, "    mov x8, #93 // sys_exit").unwrap();
                writeln!(&mut self.code, "    svc #0").unwrap();
            },
            AsmTarget::WASM => {
                writeln!(&mut self.code, "    i32.const 0 ;; Return value").unwrap();
                writeln!(&mut self.code, "  )").unwrap();
                writeln!(&mut self.code, ")").unwrap();
            },
        }
    }
    
    /// Compile a GaiaScript AST to assembly
    pub fn compile(&mut self, ast: &ASTNode) -> String {
        self.generate_code(ast);
        self.add_postamble();
        self.code.clone()
    }
    
    /// Generate assembly code for an AST node
    fn generate_code(&mut self, node: &ASTNode) {
        match node {
            ASTNode::Network(network) => self.compile_network(network),
            ASTNode::Component(component) => self.compile_component(component),
            ASTNode::Layer(layer) => self.compile_layer(layer),
            ASTNode::Block(block) => self.compile_block(block),
            ASTNode::Input(input) => self.compile_input(input),
            ASTNode::DataFlow(from, to) => self.compile_dataflow(from, to),
            ASTNode::Loss(loss) => self.compile_loss(loss),
            ASTNode::Expression(expr) => self.compile_expression(expr),
        }
    }
    
    /// Compile a network node
    fn compile_network(&mut self, network: &NetworkNode) {
        // Generate data section for the network
        match self.target {
            AsmTarget::X86_64 => {
                writeln!(&mut self.code, "    ; Network definition").unwrap();
                writeln!(&mut self.code, "    ; Components: {:?}", network.components).unwrap();
            },
            AsmTarget::ARM64 => {
                writeln!(&mut self.code, "    // Network definition").unwrap();
                writeln!(&mut self.code, "    // Components: {:?}", network.components).unwrap();
            },
            AsmTarget::WASM => {
                writeln!(&mut self.code, "    ;; Network definition").unwrap();
                writeln!(&mut self.code, "    ;; Components: {:?}", network.components).unwrap();
            },
        }
        
        // Compile network body
        for node in &network.body {
            self.generate_code(node);
        }
    }
    
    /// Compile a component node
    fn compile_component(&mut self, component: &ComponentNode) {
        let label = format!("component_{}", component.id);
        
        match self.target {
            AsmTarget::X86_64 => {
                writeln!(&mut self.code, "{}:", label).unwrap();
                writeln!(&mut self.code, "    ; Component: {}", component.id).unwrap();
            },
            AsmTarget::ARM64 => {
                writeln!(&mut self.code, "{}:", label).unwrap();
                writeln!(&mut self.code, "    // Component: {}", component.id).unwrap();
            },
            AsmTarget::WASM => {
                writeln!(&mut self.code, "    ;; Component: {}", component.id).unwrap();
                // In WASM, we'd create a function for each component
                writeln!(&mut self.code, "    ;; (func ${} (param i32) (result i32)", component.id).unwrap();
            },
        }
        
        // Compile component expression
        self.generate_code(&component.expr);
        
        // Return from component function
        match self.target {
            AsmTarget::X86_64 => {
                writeln!(&mut self.code, "    ret").unwrap();
            },
            AsmTarget::ARM64 => {
                writeln!(&mut self.code, "    ret").unwrap();
            },
            AsmTarget::WASM => {
                writeln!(&mut self.code, "    ;; )").unwrap();
            },
        }
    }
    
    /// Compile a layer node
    fn compile_layer(&mut self, layer: &LayerNode) {
        let layer_str = match &layer.layer_type {
            LayerType::Convolutional(_) => "conv",
            LayerType::Dense(_) => "dense",
            LayerType::Pooling => "pooling",
            LayerType::Flatten => "flatten",
            LayerType::Upsampling => "upsampling",
            LayerType::LSTM => "lstm",
            LayerType::AttentionHeads => "attention_heads",
            LayerType::Reshape => "reshape",
            LayerType::Embedding => "embedding",
            LayerType::BatchSize => "batch_size",
            LayerType::TransposeConv => "transpose_conv",
            LayerType::Attention => "attention",
        };
        
        let activation_str = match layer.activation {
            ActivationFunction::ReLU => "relu",
            ActivationFunction::Sigmoid => "sigmoid",
            ActivationFunction::Tanh => "tanh",
            ActivationFunction::Softmax => "softmax",
            ActivationFunction::None => "none",
        };
        
        match self.target {
            AsmTarget::X86_64 => {
                writeln!(&mut self.code, "    ; Layer: {} with activation {}", layer_str, activation_str).unwrap();
                writeln!(&mut self.code, "    call gaia_{}_{}", layer_str, activation_str).unwrap();
            },
            AsmTarget::ARM64 => {
                writeln!(&mut self.code, "    // Layer: {} with activation {}", layer_str, activation_str).unwrap();
                writeln!(&mut self.code, "    bl gaia_{}_{}", layer_str, activation_str).unwrap();
            },
            AsmTarget::WASM => {
                writeln!(&mut self.code, "    ;; Layer: {} with activation {}", layer_str, activation_str).unwrap();
                writeln!(&mut self.code, "    call ${}_{}  ;; Call the layer function", layer_str, activation_str).unwrap();
            },
        }
        
        // Generate parameter setup code
        for (i, param) in layer.params.iter().enumerate() {
            match self.target {
                AsmTarget::X86_64 => {
                    writeln!(&mut self.code, "    mov r{}, {}", i, param).unwrap();
                },
                AsmTarget::ARM64 => {
                    writeln!(&mut self.code, "    mov x{}, #{}", i, param).unwrap();
                },
                AsmTarget::WASM => {
                    writeln!(&mut self.code, "    i32.const {}  ;; Parameter {}", param, i).unwrap();
                },
            }
        }
    }
    
    /// Compile a block node (repeated layers)
    fn compile_block(&mut self, block: &BlockNode) {
        let loop_label = self.new_label("block_loop");
        let end_label = self.new_label("block_end");
        let counter_var = self.new_temp();
        
        match self.target {
            AsmTarget::X86_64 => {
                writeln!(&mut self.code, "    ; Block with {} repetitions", block.repetitions).unwrap();
                writeln!(&mut self.code, "    mov rcx, {}", block.repetitions).unwrap();
                writeln!(&mut self.code, "{}:", loop_label).unwrap();
                writeln!(&mut self.code, "    push rcx").unwrap();
            },
            AsmTarget::ARM64 => {
                writeln!(&mut self.code, "    // Block with {} repetitions", block.repetitions).unwrap();
                writeln!(&mut self.code, "    mov x19, #{}", block.repetitions).unwrap();
                writeln!(&mut self.code, "{}:", loop_label).unwrap();
                writeln!(&mut self.code, "    str x19, [sp, #-16]!").unwrap();
            },
            AsmTarget::WASM => {
                writeln!(&mut self.code, "    ;; Block with {} repetitions", block.repetitions).unwrap();
                writeln!(&mut self.code, "    (local ${} i32)  ;; Loop counter", counter_var).unwrap();
                writeln!(&mut self.code, "    i32.const {}", block.repetitions).unwrap();
                writeln!(&mut self.code, "    local.set ${}", counter_var).unwrap();
                writeln!(&mut self.code, "    (block ${}", end_label).unwrap();
                writeln!(&mut self.code, "      (loop ${}", loop_label).unwrap();
            },
        }
        
        // Generate the block content
        self.generate_code(&block.content);
        
        // End the loop
        match self.target {
            AsmTarget::X86_64 => {
                writeln!(&mut self.code, "    pop rcx").unwrap();
                writeln!(&mut self.code, "    dec rcx").unwrap();
                writeln!(&mut self.code, "    jnz {}", loop_label).unwrap();
            },
            AsmTarget::ARM64 => {
                writeln!(&mut self.code, "    ldr x19, [sp], #16").unwrap();
                writeln!(&mut self.code, "    subs x19, x19, #1").unwrap();
                writeln!(&mut self.code, "    bne {}", loop_label).unwrap();
            },
            AsmTarget::WASM => {
                writeln!(&mut self.code, "        local.get ${}", counter_var).unwrap();
                writeln!(&mut self.code, "        i32.const 1").unwrap();
                writeln!(&mut self.code, "        i32.sub").unwrap();
                writeln!(&mut self.code, "        local.tee ${}", counter_var).unwrap();
                writeln!(&mut self.code, "        i32.const 0").unwrap();
                writeln!(&mut self.code, "        i32.gt_s").unwrap();
                writeln!(&mut self.code, "        br_if ${}", loop_label).unwrap();
                writeln!(&mut self.code, "      )").unwrap();
                writeln!(&mut self.code, "    )").unwrap();
            },
        }
    }
    
    /// Compile an input node
    fn compile_input(&mut self, input: &InputNode) {
        let input_type = match input.input_type {
            InputType::Text => "text",
            InputType::Image => "image",
            InputType::Sequence => "sequence",
            InputType::Latent => "latent",
        };
        
        match self.target {
            AsmTarget::X86_64 => {
                writeln!(&mut self.code, "    ; Input: {} with params {:?}", input_type, input.params).unwrap();
                writeln!(&mut self.code, "    call gaia_input_{}", input_type).unwrap();
            },
            AsmTarget::ARM64 => {
                writeln!(&mut self.code, "    // Input: {} with params {:?}", input_type, input.params).unwrap();
                writeln!(&mut self.code, "    bl gaia_input_{}", input_type).unwrap();
            },
            AsmTarget::WASM => {
                writeln!(&mut self.code, "    ;; Input: {} with params {:?}", input_type, input.params).unwrap();
                writeln!(&mut self.code, "    call $input_{}", input_type).unwrap();
            },
        }
        
        // Set up input parameters
        for (i, param) in input.params.iter().enumerate() {
            match self.target {
                AsmTarget::X86_64 => {
                    writeln!(&mut self.code, "    mov r{}, {}", i, param).unwrap();
                },
                AsmTarget::ARM64 => {
                    writeln!(&mut self.code, "    mov x{}, #{}", i, param).unwrap();
                },
                AsmTarget::WASM => {
                    writeln!(&mut self.code, "    i32.const {}  ;; Input parameter {}", param, i).unwrap();
                },
            }
        }
    }
    
    /// Compile a data flow (connecting layers)
    fn compile_dataflow(&mut self, from: &ASTNode, to: &ASTNode) {
        // First compile the 'from' node
        self.generate_code(from);
        
        match self.target {
            AsmTarget::X86_64 => {
                writeln!(&mut self.code, "    ; Connect layers (dataflow)").unwrap();
                writeln!(&mut self.code, "    push rax  ; Save output from previous layer").unwrap();
            },
            AsmTarget::ARM64 => {
                writeln!(&mut self.code, "    // Connect layers (dataflow)").unwrap();
                writeln!(&mut self.code, "    str x0, [sp, #-16]!  // Save output from previous layer").unwrap();
            },
            AsmTarget::WASM => {
                writeln!(&mut self.code, "    ;; Connect layers (dataflow)").unwrap();
                writeln!(&mut self.code, "    ;; Previous layer result is on stack").unwrap();
            },
        }
        
        // Then compile the 'to' node
        self.generate_code(to);
        
        match self.target {
            AsmTarget::X86_64 => {
                writeln!(&mut self.code, "    pop rbx  ; Get input from previous layer").unwrap();
                writeln!(&mut self.code, "    ; Connect layers and continue processing").unwrap();
            },
            AsmTarget::ARM64 => {
                writeln!(&mut self.code, "    ldr x1, [sp], #16  // Get input from previous layer").unwrap();
                writeln!(&mut self.code, "    // Connect layers and continue processing").unwrap();
            },
            AsmTarget::WASM => {
                writeln!(&mut self.code, "    ;; Connect layers and continue processing").unwrap();
            },
        }
    }
    
    /// Compile a loss node
    fn compile_loss(&mut self, loss: &LossNode) {
        match self.target {
            AsmTarget::X86_64 => {
                writeln!(&mut self.code, "    ; Loss function: {} for component {}", loss.function, loss.to).unwrap();
            },
            AsmTarget::ARM64 => {
                writeln!(&mut self.code, "    // Loss function: {} for component {}", loss.function, loss.to).unwrap();
            },
            AsmTarget::WASM => {
                writeln!(&mut self.code, "    ;; Loss function: {} for component {}", loss.function, loss.to).unwrap();
            },
        }
        
        // Compile the 'from' expression
        self.generate_code(&loss.from);
        
        // Generate loss function call
        match self.target {
            AsmTarget::X86_64 => {
                writeln!(&mut self.code, "    call gaia_loss_{}", loss.function).unwrap();
            },
            AsmTarget::ARM64 => {
                writeln!(&mut self.code, "    bl gaia_loss_{}", loss.function).unwrap();
            },
            AsmTarget::WASM => {
                writeln!(&mut self.code, "    call $loss_{}", loss.function).unwrap();
            },
        }
    }
    
    /// Compile an expression (sequence of nodes)
    fn compile_expression(&mut self, expr: &Vec<ASTNode>) {
        for node in expr {
            self.generate_code(node);
        }
    }
}

/// Helper function to compile an AST to assembly for a specific target
pub fn compile_to_asm(ast: &ASTNode, target: AsmTarget) -> String {
    let mut compiler = AsmCompiler::new(target);
    compiler.compile(ast)
}