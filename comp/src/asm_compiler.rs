use crate::ast::*;
use std::fmt::Write;

/// Assembly target architecture
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum AsmTarget {
    X86_64,
    ARM64,
    WASM,      // WebAssembly for backend
    WASMUI,    // WebAssembly for UI components
}

use crate::extensions::ui_extensions::UIComponentNode;

/// Compiler for GaiaScript to assembly
pub struct AsmCompiler {
    target: AsmTarget,
    code: String,
    temp_var_count: usize,
    label_count: usize,
    ui_components: Vec<UIComponentNode>,
}

impl AsmCompiler {
    pub fn new(target: AsmTarget) -> Self {
        let mut compiler = Self {
            target,
            code: String::new(),
            temp_var_count: 0,
            label_count: 0,
            ui_components: Vec::new(),
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
            AsmTarget::WASMUI => {
                writeln!(&mut self.code, ";; GaiaUI WebAssembly Component").unwrap();
                writeln!(&mut self.code, "(module").unwrap();
                writeln!(&mut self.code, "  ;; Import JavaScript environment").unwrap();
                writeln!(&mut self.code, "  (import \"env\" \"memory\" (memory 1))").unwrap();
                writeln!(&mut self.code, "  (import \"env\" \"log_value\" (func $log_value (param i32)))").unwrap();
                writeln!(&mut self.code, "  (import \"env\" \"update_dom\" (func $update_dom (param i32 i32)))").unwrap();
                writeln!(&mut self.code, "").unwrap();
                writeln!(&mut self.code, "  ;; Global state management").unwrap();
                writeln!(&mut self.code, "  (global $next_alloc_ptr (mut i32) (i32.const 1024))").unwrap();
                writeln!(&mut self.code, "  (global $component_counter (mut i32) (i32.const 0))").unwrap();
                writeln!(&mut self.code, "").unwrap();
                // Add memory allocation helper
                writeln!(&mut self.code, "  ;; Memory allocation").unwrap();
                writeln!(&mut self.code, "  (func $allocate (export \"allocate\") (param $size i32) (result i32)").unwrap();
                writeln!(&mut self.code, "    (local $ptr i32)").unwrap();
                writeln!(&mut self.code, "    global.get $next_alloc_ptr").unwrap();
                writeln!(&mut self.code, "    local.set $ptr").unwrap();
                writeln!(&mut self.code, "    global.get $next_alloc_ptr").unwrap();
                writeln!(&mut self.code, "    local.get $size").unwrap();
                writeln!(&mut self.code, "    i32.add").unwrap();
                writeln!(&mut self.code, "    i32.const 7").unwrap();
                writeln!(&mut self.code, "    i32.add").unwrap();
                writeln!(&mut self.code, "    i32.const -8").unwrap();
                writeln!(&mut self.code, "    i32.and").unwrap();
                writeln!(&mut self.code, "    global.set $next_alloc_ptr").unwrap();
                writeln!(&mut self.code, "    local.get $ptr").unwrap();
                writeln!(&mut self.code, "  )").unwrap();
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
            AsmTarget::WASMUI => {
                // Add main entry point (run function)
                writeln!(&mut self.code, "  ;; Main entry point (run function)").unwrap();
                writeln!(&mut self.code, "  (func $run (export \"run\") (result i32)").unwrap();
                writeln!(&mut self.code, "    i32.const 0  ;; Success return code").unwrap();
                writeln!(&mut self.code, "  )").unwrap();
                
                // If we have UI components, add component handling
                if !self.ui_components.is_empty() {
                    // Add component rendering functions
                    self.add_ui_component_functions();
                }
                
                // Close the module
                writeln!(&mut self.code, ")").unwrap();
            },
        }
    }
    
    /// Add WebAssembly functions for UI components
    fn add_ui_component_functions(&mut self) {
        writeln!(&mut self.code, "  ;; Component functions").unwrap();
        
        for (idx, component) in self.ui_components.iter().enumerate() {
            // Create a component name from the component type
            let component_name = format!("{:?}", component.component_type).to_lowercase();
            
            // Create a function for this component
            writeln!(&mut self.code, "  (func $component_{} (export \"component_{}\") (result i32)", idx, component_name).unwrap();
            writeln!(&mut self.code, "    (local $component_id i32)").unwrap();
            
            // Get a new component ID
            writeln!(&mut self.code, "    ;; Get new component ID").unwrap();
            writeln!(&mut self.code, "    global.get $component_counter").unwrap();
            writeln!(&mut self.code, "    local.set $component_id").unwrap();
            writeln!(&mut self.code, "    global.get $component_counter").unwrap();
            writeln!(&mut self.code, "    i32.const 1").unwrap();
            writeln!(&mut self.code, "    i32.add").unwrap();
            writeln!(&mut self.code, "    global.set $component_counter").unwrap();
            
            // Process properties
            writeln!(&mut self.code, "    ;; Initialize component properties").unwrap();
            for (key, value) in &component.properties {
                writeln!(&mut self.code, "    ;; Property: {} = {}", key, value).unwrap();
            }
            
            // Process render function
            writeln!(&mut self.code, "    ;; Component rendering").unwrap();
            // In a real implementation, we would generate code for rendering
            
            // Return the component ID
            writeln!(&mut self.code, "    local.get $component_id").unwrap();
            writeln!(&mut self.code, "  )").unwrap();
        }
        
        // Add helper functions for UI operations
        self.add_ui_helper_functions();
    }
    
    /// Add helper functions for UI operations in WebAssembly
    fn add_ui_helper_functions(&mut self) {
        // String comparison helper
        writeln!(&mut self.code, "  ;; String comparison helper").unwrap();
        writeln!(&mut self.code, "  (func $strcmp (param $str1 i32) (param $str2 i32) (result i32)").unwrap();
        writeln!(&mut self.code, "    (local $char1 i32)").unwrap();
        writeln!(&mut self.code, "    (local $char2 i32)").unwrap();
        writeln!(&mut self.code, "    (local $idx i32)").unwrap();
        writeln!(&mut self.code, "    i32.const 0").unwrap();
        writeln!(&mut self.code, "    local.set $idx").unwrap();
        writeln!(&mut self.code, "    (block $done").unwrap();
        writeln!(&mut self.code, "      (loop $loop").unwrap();
        writeln!(&mut self.code, "        ;; Load bytes from memory").unwrap();
        writeln!(&mut self.code, "        local.get $str1").unwrap();
        writeln!(&mut self.code, "        local.get $idx").unwrap();
        writeln!(&mut self.code, "        i32.add").unwrap();
        writeln!(&mut self.code, "        i32.load8_u").unwrap();
        writeln!(&mut self.code, "        local.set $char1").unwrap();
        writeln!(&mut self.code, "        local.get $str2").unwrap();
        writeln!(&mut self.code, "        local.get $idx").unwrap();
        writeln!(&mut self.code, "        i32.add").unwrap();
        writeln!(&mut self.code, "        i32.load8_u").unwrap();
        writeln!(&mut self.code, "        local.set $char2").unwrap();
        writeln!(&mut self.code, "        ;; If characters don't match, return 0 (false)").unwrap();
        writeln!(&mut self.code, "        local.get $char1").unwrap();
        writeln!(&mut self.code, "        local.get $char2").unwrap();
        writeln!(&mut self.code, "        i32.ne").unwrap();
        writeln!(&mut self.code, "        if").unwrap();
        writeln!(&mut self.code, "          i32.const 0").unwrap();
        writeln!(&mut self.code, "          return").unwrap();
        writeln!(&mut self.code, "        end").unwrap();
        writeln!(&mut self.code, "        ;; If null terminator, strings match - return 1 (true)").unwrap();
        writeln!(&mut self.code, "        local.get $char1").unwrap();
        writeln!(&mut self.code, "        i32.eqz").unwrap();
        writeln!(&mut self.code, "        if").unwrap();
        writeln!(&mut self.code, "          i32.const 1").unwrap();
        writeln!(&mut self.code, "          return").unwrap();
        writeln!(&mut self.code, "        end").unwrap();
        writeln!(&mut self.code, "        ;; Increment index").unwrap();
        writeln!(&mut self.code, "        local.get $idx").unwrap();
        writeln!(&mut self.code, "        i32.const 1").unwrap();
        writeln!(&mut self.code, "        i32.add").unwrap();
        writeln!(&mut self.code, "        local.set $idx").unwrap();
        writeln!(&mut self.code, "        br $loop").unwrap();
        writeln!(&mut self.code, "      )").unwrap();
        writeln!(&mut self.code, "    )").unwrap();
        writeln!(&mut self.code, "    i32.const 1 ;; Default return true").unwrap();
        writeln!(&mut self.code, "  )").unwrap();
        
        // String length helper
        writeln!(&mut self.code, "  ;; String length helper").unwrap();
        writeln!(&mut self.code, "  (func $strlen (param $str i32) (result i32)").unwrap();
        writeln!(&mut self.code, "    (local $len i32)").unwrap();
        writeln!(&mut self.code, "    (local $char i32)").unwrap();
        writeln!(&mut self.code, "    i32.const 0").unwrap();
        writeln!(&mut self.code, "    local.set $len").unwrap();
        writeln!(&mut self.code, "    (block $done").unwrap();
        writeln!(&mut self.code, "      (loop $loop").unwrap();
        writeln!(&mut self.code, "        local.get $str").unwrap();
        writeln!(&mut self.code, "        local.get $len").unwrap();
        writeln!(&mut self.code, "        i32.add").unwrap();
        writeln!(&mut self.code, "        i32.load8_u").unwrap();
        writeln!(&mut self.code, "        local.set $char").unwrap();
        writeln!(&mut self.code, "        local.get $char").unwrap();
        writeln!(&mut self.code, "        i32.eqz").unwrap();
        writeln!(&mut self.code, "        br_if $done").unwrap();
        writeln!(&mut self.code, "        local.get $len").unwrap();
        writeln!(&mut self.code, "        i32.const 1").unwrap();
        writeln!(&mut self.code, "        i32.add").unwrap();
        writeln!(&mut self.code, "        local.set $len").unwrap();
        writeln!(&mut self.code, "        br $loop").unwrap();
        writeln!(&mut self.code, "      )").unwrap();
        writeln!(&mut self.code, "    )").unwrap();
        writeln!(&mut self.code, "    local.get $len").unwrap();
        writeln!(&mut self.code, "  )").unwrap();
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
            // UI and 3D components (not implemented for assembly)
            ASTNode::UIComponent(_) => {}, 
            ASTNode::EventHandler(_) => {},
            ASTNode::DataBinding(_) => {},
            ASTNode::ThreeDComponent(_) => {},
            ASTNode::Asset(_) => {},
            // Raw content (skip in assembly compilation)
            ASTNode::Raw(_) => {},
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
            AsmTarget::WASM | AsmTarget::WASMUI => {
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
            AsmTarget::WASM | AsmTarget::WASMUI => {
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
            AsmTarget::WASM | AsmTarget::WASMUI => {
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
            AsmTarget::WASM | AsmTarget::WASMUI => {
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
                AsmTarget::WASM | AsmTarget::WASMUI => {
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
            AsmTarget::WASM | AsmTarget::WASMUI => {
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
            AsmTarget::WASM | AsmTarget::WASMUI => {
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
            AsmTarget::WASM | AsmTarget::WASMUI => {
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
                AsmTarget::WASM | AsmTarget::WASMUI => {
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
            AsmTarget::WASM | AsmTarget::WASMUI => {
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
            AsmTarget::WASM | AsmTarget::WASMUI => {
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
            AsmTarget::WASM | AsmTarget::WASMUI => {
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
            AsmTarget::WASM | AsmTarget::WASMUI => {
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