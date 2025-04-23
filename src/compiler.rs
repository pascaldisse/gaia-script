use std::collections::HashMap;

use crate::ast::*;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CompilerError {
    #[error("Undefined component: {0}")]
    UndefinedComponent(String),
    
    #[error("Compilation error: {0}")]
    CompilationError(String),
}

pub struct JsCompiler {
    symbol_table: SymbolTable,
    js_functions: HashMap<String, String>,
    js_variables: HashMap<String, String>,
    unique_id_counter: usize,
}

impl JsCompiler {
    pub fn new() -> Self {
        JsCompiler {
            symbol_table: SymbolTable::new(),
            js_functions: HashMap::new(),
            js_variables: HashMap::new(),
            unique_id_counter: 0,
        }
    }
    
    pub fn compile(&mut self, node: &ASTNode) -> Result<String, CompilerError> {
        match node {
            ASTNode::Network(network) => self.compile_network(network),
            ASTNode::Component(component) => self.compile_component(component),
            ASTNode::Layer(layer) => self.compile_layer(layer),
            ASTNode::Block(block) => self.compile_block(block),
            ASTNode::Input(input) => self.compile_input(input),
            ASTNode::DataFlow(from, to) => self.compile_data_flow(from, to),
            ASTNode::Loss(loss) => self.compile_loss(loss),
            ASTNode::Expression(nodes) => self.compile_expression(nodes),
            ASTNode::UIComponent(component) => self.compile_ui_component(component),
            ASTNode::EventHandler(handler) => self.compile_event_handler(handler),
            ASTNode::DataBinding(binding) => self.compile_data_binding(binding),
            ASTNode::ThreeDComponent(component) => self.compile_threed_component(component),
            ASTNode::Asset(asset) => self.compile_asset(asset),
        }
    }
    
    fn compile_ui_component(&mut self, component: &crate::extensions::ui_extensions::UIComponentNode) -> Result<String, CompilerError> {
        let component_type = match component.component_type {
            crate::extensions::ui_extensions::UIComponentType::Canvas => "createCanvas",
            crate::extensions::ui_extensions::UIComponentType::Panel => "createPanel",
            crate::extensions::ui_extensions::UIComponentType::Layout => "createLayout",
            crate::extensions::ui_extensions::UIComponentType::Button => "createButton",
            crate::extensions::ui_extensions::UIComponentType::Label => "createLabel",
        };
        
        // Generate dimensions
        let dimensions = if let Some((width, height)) = component.dimensions {
            format!("{}, {}", width, height)
        } else {
            "null, null".to_string()
        };
        
        // Generate properties
        let properties = self.compile_property_map(&component.properties);
        
        // Create component
        let component_var = self.get_unique_id("ui");
        let js_code = format!(
            "const {} = {}({}, {});",
            component_var, component_type, dimensions, properties
        );
        
        self.js_variables.insert(component_var.clone(), js_code.clone());
        Ok(js_code)
    }
    
    fn compile_property_map(&self, props: &std::collections::HashMap<String, String>) -> String {
        // Convert properties to JS object
        let props_entries: Vec<String> = props
            .iter()
            .map(|(k, v)| format!("{}: \"{}\"", k, v))
            .collect();
        
        format!("{{ {} }}", props_entries.join(", "))
    }
    
    fn compile_event_handler(&mut self, handler: &crate::extensions::ui_extensions::EventHandlerNode) -> Result<String, CompilerError> {
        // Compile the handler body
        let handler_body = self.compile(&handler.handler)?;
        
        // Create event handler function
        let handler_fn = self.get_unique_id("handler");
        let js_code = format!(
            "const {} = function(event) {{\n{}\n}};\n{}.addEventListener('{}', {});",
            handler_fn, handler_body, handler.source, handler.event_type, handler_fn
        );
        
        self.js_functions.insert(handler_fn.clone(), js_code.clone());
        Ok(js_code)
    }
    
    fn compile_data_binding(&mut self, binding: &crate::extensions::ui_extensions::DataBindingNode) -> Result<String, CompilerError> {
        let binding_type = if binding.bidirectional { "bindBidirectional" } else { "bindOneWay" };
        
        let js_code = format!(
            "{}('{}', '{}');",
            binding_type, binding.target, binding.source
        );
        
        Ok(js_code)
    }
    
    fn compile_threed_component(&mut self, component: &crate::extensions::three_extensions::ThreeDComponentNode) -> Result<String, CompilerError> {
        let component_type = match component.component_type {
            crate::extensions::three_extensions::ThreeDComponentType::World3D => "createWorld3D",
            crate::extensions::three_extensions::ThreeDComponentType::Camera => "createCamera",
            crate::extensions::three_extensions::ThreeDComponentType::Renderer => "createRenderer",
            crate::extensions::three_extensions::ThreeDComponentType::Light => "createLight",
            crate::extensions::three_extensions::ThreeDComponentType::Mesh => "createMesh",
            crate::extensions::three_extensions::ThreeDComponentType::Texture => "createTexture",
            crate::extensions::three_extensions::ThreeDComponentType::Material => "createMaterial",
            crate::extensions::three_extensions::ThreeDComponentType::Shader => "createShader",
            crate::extensions::three_extensions::ThreeDComponentType::Scene => "createScene",
            crate::extensions::three_extensions::ThreeDComponentType::Skybox => "createSkybox",
        };
        
        // Generate params
        let params = self.compile_property_map(&component.params);
        
        // Create component
        let component_var = self.get_unique_id("three");
        let js_code = format!(
            "const {} = {}({});",
            component_var, component_type, params
        );
        
        self.js_variables.insert(component_var.clone(), js_code.clone());
        Ok(js_code)
    }
    
    fn compile_asset(&mut self, asset: &crate::extensions::three_extensions::AssetNode) -> Result<String, CompilerError> {
        let asset_var = self.get_unique_id("asset");
        let js_code = format!(
            "const {} = loadAsset('{}', '{}');",
            asset_var, asset.path, asset.asset_type
        );
        
        self.js_variables.insert(asset_var.clone(), js_code.clone());
        Ok(js_code)
    }
    
    fn get_unique_id(&mut self, prefix: &str) -> String {
        let id = format!("{}_{}", prefix, self.unique_id_counter);
        self.unique_id_counter += 1;
        id
    }
    
    fn compile_network(&mut self, network: &NetworkNode) -> Result<String, CompilerError> {
        let mut components_js = String::new();
        
        // Process components if defined
        if let Some(components) = &network.components {
            for comp in components {
                // Register components in symbol table
                if let Some(comp_node) = self.symbol_table.get_component(comp) {
                    // Clone to avoid borrowing issues
                    let comp_node_clone = comp_node.clone();
                    let comp_js = self.compile(&comp_node_clone)?;
                    components_js.push_str(&comp_js);
                    components_js.push_str("\n");
                }
            }
        }
        
        // Process the network body
        let mut body_js = String::new();
        for node in &network.body {
            let node_js = self.compile(node)?;
            body_js.push_str(&node_js);
            body_js.push_str("\n");
        }
        
        // Create a JavaScript module with all compiled components
        let result = format!("
// Generated JavaScript from GaiaScript
{components}

// Network initialization
{body}

// Export the network
export default function initNetwork() {{
  // Return the network object
  return {{ initialize }};
}}
        ", components = components_js, body = body_js);
        
        Ok(result)
    }
    
    fn compile_component(&mut self, component: &ComponentNode) -> Result<String, CompilerError> {
        // Register the component in the symbol table
        self.symbol_table.add_component(component.id.clone(), *component.expr.clone());
        
        // Compile the component expression
        let expr_js = self.compile(&component.expr)?;
        
        // Create a JavaScript function for this component
        let js_function = format!("
// Component: {}
function {}() {{
  {}
  return {{ id: '{}' }};
}}
        ", component.id, component.id, expr_js, component.id);
        
        // Store the function in the map
        self.js_functions.insert(component.id.clone(), js_function.clone());
        
        Ok(js_function)
    }
    
    fn compile_layer(&mut self, layer: &LayerNode) -> Result<String, CompilerError> {
        // Convert layer type and parameters to JavaScript
        let (layer_type, layer_params) = match &layer.layer_type {
            LayerType::Convolutional(idx) => {
                let filters = if !layer.params.is_empty() { layer.params[0] } else { 32 };
                let kernel_size = if layer.params.len() > 1 { layer.params[1] } else { 3 };
                
                ("conv", format!("{{ filters: {}, kernelSize: {}, index: {} }}", 
                    filters, kernel_size, idx))
            },
            LayerType::Dense(idx) => {
                let units = if !layer.params.is_empty() { layer.params[0] } else { 128 };
                
                ("dense", format!("{{ units: {}, index: {} }}", units, idx))
            },
            LayerType::Pooling => {
                let size = if !layer.params.is_empty() { layer.params[0] } else { 2 };
                
                ("pooling", format!("{{ size: {} }}", size))
            },
            LayerType::Flatten => ("flatten", "{}".to_string()),
            LayerType::LSTM => {
                let units = if !layer.params.is_empty() { layer.params[0] } else { 128 };
                
                ("lstm", format!("{{ units: {} }}", units))
            },
            LayerType::Upsampling => ("upsampling", "{}".to_string()),
            LayerType::AttentionHeads => {
                let heads = if !layer.params.is_empty() { layer.params[0] } else { 8 };
                
                ("attention_heads", format!("{{ heads: {} }}", heads))
            },
            LayerType::Reshape => {
                let shape_str = if !layer.params.is_empty() {
                    let shapes: Vec<String> = layer.params.iter().map(|p| p.to_string()).collect();
                    format!("[{}]", shapes.join(", "))
                } else {
                    "[]".to_string()
                };
                
                ("reshape", format!("{{ shape: {} }}", shape_str))
            },
            LayerType::Embedding => {
                let dim = if !layer.params.is_empty() { layer.params[0] } else { 128 };
                
                ("embedding", format!("{{ dim: {} }}", dim))
            },
            LayerType::BatchSize => {
                let size = if !layer.params.is_empty() { layer.params[0] } else { 32 };
                
                ("batch", format!("{{ size: {} }}", size))
            },
            LayerType::TransposeConv => {
                let filters = if !layer.params.is_empty() { layer.params[0] } else { 32 };
                
                ("transpose_conv", format!("{{ filters: {} }}", filters))
            },
            LayerType::Attention => ("attention", "{}".to_string()),
        };
        
        // Convert activation function to JavaScript
        let activation = match layer.activation {
            ActivationFunction::ReLU => "relu",
            ActivationFunction::Sigmoid => "sigmoid",
            ActivationFunction::Tanh => "tanh",
            ActivationFunction::Softmax => "softmax",
            ActivationFunction::None => "none",
        };
        
        // Create a variable for this layer
        let layer_var = self.get_unique_id("layer");
        
        // Generate the JavaScript code
        let js_code = format!("const {} = createLayer('{}', {}, '{}');", 
            layer_var, layer_type, layer_params, activation);
        
        // Store the variable
        self.js_variables.insert(layer_var.clone(), js_code.clone());
        
        Ok(js_code)
    }
    
    fn compile_block(&mut self, block: &BlockNode) -> Result<String, CompilerError> {
        // Compile the block content
        let content_js = self.compile(&block.content)?;
        
        // Create a function for the block to be executed multiple times
        let block_id = self.get_unique_id("block");
        let block_fn = format!("
function {}() {{
  {}
}}

// Repeat the block {} times
for (let i = 0; i < {}; i++) {{
  {}();
}}
        ", block_id, content_js, block.repetitions, block.repetitions, block_id);
        
        Ok(block_fn)
    }
    
    fn compile_input(&mut self, input: &InputNode) -> Result<String, CompilerError> {
        // Determine input shape based on type
        let shape = if input.params.is_empty() {
            match input.input_type {
                InputType::Image => "[1, 224, 224, 3]".to_string(),  // Default image size
                InputType::Text => "[1, 128]".to_string(),           // Default sequence length
                InputType::Sequence => "[1, 100]".to_string(),       // Default sequence length
                InputType::Latent => "[1, 100]".to_string(),         // Default latent dim
            }
        } else {
            let shape_str: Vec<String> = input.params.iter().map(|p| p.to_string()).collect();
            format!("[{}]", shape_str.join(", "))
        };
        
        // Determine input type
        let input_type = match input.input_type {
            InputType::Image => "image",
            InputType::Text => "text",
            InputType::Sequence => "sequence",
            InputType::Latent => "latent",
        };
        
        // Create a variable for this input
        let input_var = self.get_unique_id("input");
        
        // Generate the JavaScript code
        let js_code = format!("const {} = createInput('{}', {});", 
            input_var, input_type, shape);
        
        // Store the variable
        self.js_variables.insert(input_var.clone(), js_code.clone());
        
        Ok(js_code)
    }
    
    fn compile_data_flow(&mut self, from: &ASTNode, to: &ASTNode) -> Result<String, CompilerError> {
        // Compile the "from" part
        let from_js = self.compile(from)?;
        
        // Compile the "to" part
        let to_js = self.compile(to)?;
        
        // Connect them in JavaScript
        let from_var = self.get_unique_id("from");
        let to_var = self.get_unique_id("to");
        
        let js_code = format!("
// From:
const {} = (() => {{
  {}
  return lastCreated();
}})();

// To:
const {} = (() => {{
  {}
  return lastCreated();
}})();

// Connect from to to
connectLayers({}, {});
        ", from_var, from_js, to_var, to_js, from_var, to_var);
        
        Ok(js_code)
    }
    
    fn compile_loss(&mut self, loss: &LossNode) -> Result<String, CompilerError> {
        // Compile the "from" part
        let from_js = self.compile(&loss.from)?;
        
        // Create a variable for this loss
        let loss_var = self.get_unique_id("loss");
        
        // Generate the JavaScript code
        let js_code = format!("
// From:
{}

// Loss function
const {} = createLoss('{}', '{}');
        ", from_js, loss_var, loss.to, loss.function);
        
        Ok(js_code)
    }
    
    fn compile_expression(&mut self, nodes: &[ASTNode]) -> Result<String, CompilerError> {
        let mut js_code = String::new();
        
        for node in nodes {
            let node_js = self.compile(node)?;
            js_code.push_str(&node_js);
            js_code.push_str("\n");
        }
        
        Ok(js_code)
    }
}