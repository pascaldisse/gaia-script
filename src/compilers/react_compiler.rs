use std::collections::HashMap;
use crate::ast::*;
use crate::extensions::ui_extensions::*;
use crate::extensions::three_extensions::*;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ReactCompilerError {
    #[error("Undefined component: {0}")]
    UndefinedComponent(String),
    
    #[error("Compilation error: {0}")]
    CompilationError(String),
}

pub struct ReactCompiler {
    symbol_table: SymbolTable,
    react_components: HashMap<String, String>,
    react_hooks: HashMap<String, String>,
    unique_id_counter: usize,
}

impl ReactCompiler {
    pub fn new() -> Self {
        ReactCompiler {
            symbol_table: SymbolTable::new(),
            react_components: HashMap::new(),
            react_hooks: HashMap::new(),
            unique_id_counter: 0,
        }
    }
    
    pub fn compile(&mut self, node: &ASTNode) -> Result<String, ReactCompilerError> {
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
    
    fn get_unique_id(&mut self, prefix: &str) -> String {
        let id = format!("{}_{}", prefix, self.unique_id_counter);
        self.unique_id_counter += 1;
        id
    }
    
    fn compile_network(&mut self, network: &NetworkNode) -> Result<String, ReactCompilerError> {
        let mut components_jsx = String::new();
        
        // Process components if defined
        if let Some(components) = &network.components {
            for comp in components {
                // Register components in symbol table
                if let Some(comp_node) = self.symbol_table.get_component(comp) {
                    // Clone to avoid borrowing issues
                    let comp_node_clone = comp_node.clone();
                    let comp_jsx = self.compile(&comp_node_clone)?;
                    components_jsx.push_str(&comp_jsx);
                    components_jsx.push_str("\n\n");
                }
            }
        }
        
        // Process the network body
        let mut body_jsx = String::new();
        for node in &network.body {
            let node_jsx = self.compile(node)?;
            body_jsx.push_str(&node_jsx);
            body_jsx.push_str("\n");
        }
        
        // Create a React app with all compiled components
        let result = format!("
import React, {{ useState, useEffect, useRef }} from 'react';
import {{ Canvas }} from '@react-three/fiber';
import {{ OrbitControls, useGLTF }} from '@react-three/drei';
import * as tf from '@tensorflow/tfjs';

// Generated React from GaiaScript
{components}

export default function GaiaScriptApp() {{
  return (
    <div className=\"gaia-app\">
      {body}
    </div>
  );
}}
        ", components = components_jsx, body = body_jsx);
        
        Ok(result)
    }
    
    fn compile_component(&mut self, component: &ComponentNode) -> Result<String, ReactCompilerError> {
        // Register the component in the symbol table
        self.symbol_table.add_component(component.id.clone(), *component.expr.clone());
        
        // Compile the component expression
        let expr_jsx = self.compile(&component.expr)?;
        
        // Create a React component
        let component_name = self.react_component_name(&component.id);
        let jsx_component = format!("
function {}(props) {{
  // Component state
  const [state, setState] = useState({{}});
  
  // Component implementation
  {}
  
  // Return JSX
  return (
    <div className=\"gaia-component\">
      {{/* Component content */}}
    </div>
  );
}}
        ", component_name, expr_jsx);
        
        // Store the component
        self.react_components.insert(component.id.clone(), jsx_component.clone());
        
        Ok(jsx_component)
    }
    
    fn react_component_name(&self, id: &str) -> String {
        match id {
            "γ" => "UIComponent".to_string(),
            "φ" => "GameComponent".to_string(),
            "δ" => "DataComponent".to_string(),
            "α" => "AssetComponent".to_string(),
            _ => format!("{}Component", id),
        }
    }
    
    fn compile_layer(&mut self, layer: &LayerNode) -> Result<String, ReactCompilerError> {
        // Convert layer type and parameters to React/TensorFlow.js
        let (layer_type, layer_params) = match &layer.layer_type {
            LayerType::Convolutional(idx) => {
                let filters = if !layer.params.is_empty() { layer.params[0] } else { 32 };
                let kernel_size = if layer.params.len() > 1 { layer.params[1] } else { 3 };
                
                ("tf.layers.conv2d", format!("{{ filters: {}, kernelSize: [3, 3], activation: '{}' }}", 
                    filters, self.get_activation_name(&layer.activation)))
            },
            LayerType::Dense(idx) => {
                let units = if !layer.params.is_empty() { layer.params[0] } else { 128 };
                
                ("tf.layers.dense", format!("{{ units: {}, activation: '{}' }}", 
                    units, self.get_activation_name(&layer.activation)))
            },
            LayerType::Pooling => {
                let size = if !layer.params.is_empty() { layer.params[0] } else { 2 };
                
                ("tf.layers.maxPooling2d", format!("{{ poolSize: [{}, {}] }}", size, size))
            },
            LayerType::Flatten => ("tf.layers.flatten", "{}".to_string()),
            LayerType::LSTM => {
                let units = if !layer.params.is_empty() { layer.params[0] } else { 128 };
                
                ("tf.layers.lstm", format!("{{ units: {}, returnSequences: true }}", units))
            },
            _ => ("tf.layers.layer", "{}".to_string()),
        };
        
        // Create a variable for this layer
        let layer_var = self.get_unique_id("layer");
        
        // Generate the React code
        let jsx_code = format!("const {} = {}({})", layer_var, layer_type, layer_params);
        
        Ok(jsx_code)
    }
    
    fn get_activation_name(&self, activation: &ActivationFunction) -> &str {
        match activation {
            ActivationFunction::ReLU => "relu",
            ActivationFunction::Sigmoid => "sigmoid",
            ActivationFunction::Tanh => "tanh",
            ActivationFunction::Softmax => "softmax",
            ActivationFunction::None => "linear",
        }
    }
    
    fn compile_block(&mut self, block: &BlockNode) -> Result<String, ReactCompilerError> {
        // Compile the block content
        let content_jsx = self.compile(&block.content)?;
        
        // Create a function for the block to be executed multiple times
        let block_id = self.get_unique_id("block");
        let block_fn = format!("
// Function to repeat
const {}Fn = () => {{
  {}
}};

// Repeat the block {} times
{Array.from({{ length: {} }}).map((_, index) => (
  <React.Fragment key={{index}}>
    {{{block_id}Fn()}}
  </React.Fragment>
))}
        ", block_id, content_jsx, block.repetitions, block.repetitions);
        
        Ok(block_fn)
    }
    
    fn compile_input(&mut self, input: &InputNode) -> Result<String, ReactCompilerError> {
        // Determine input shape based on type
        let shape = if input.params.is_empty() {
            match input.input_type {
                InputType::Image => "[1, 224, 224, 3]".to_string(),
                InputType::Text => "[1, 128]".to_string(),
                InputType::Sequence => "[1, 100]".to_string(),
                InputType::Latent => "[1, 100]".to_string(),
            }
        } else {
            let shape_str: Vec<String> = input.params.iter().map(|p| p.to_string()).collect();
            format!("[{}]", shape_str.join(", "))
        };
        
        // Generate input component based on type
        let component = match input.input_type {
            InputType::Image => "ImageInput",
            InputType::Text => "TextInput",
            InputType::Sequence => "SequenceInput",
            InputType::Latent => "LatentInput",
        };
        
        // Create a variable for this input
        let input_var = self.get_unique_id("input");
        
        // Generate the React code
        let jsx_code = format!("const {} = <{} shape={{{}}} />", input_var, component, shape);
        
        Ok(jsx_code)
    }
    
    fn compile_data_flow(&mut self, from: &ASTNode, to: &ASTNode) -> Result<String, ReactCompilerError> {
        // Compile the "from" part
        let from_jsx = self.compile(from)?;
        
        // Compile the "to" part
        let to_jsx = self.compile(to)?;
        
        // Connect them in React
        let from_var = self.get_unique_id("from");
        let to_var = self.get_unique_id("to");
        
        let jsx_code = format!("
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
<DataFlow from={{{}}} to={{{}}} />
        ", from_var, from_jsx, to_var, to_jsx, from_var, to_var);
        
        Ok(jsx_code)
    }
    
    fn compile_loss(&mut self, loss: &LossNode) -> Result<String, ReactCompilerError> {
        // Compile the "from" part
        let from_jsx = self.compile(&loss.from)?;
        
        // Create a variable for this loss
        let loss_var = self.get_unique_id("loss");
        
        // Generate the React code
        let jsx_code = format!("
// From:
{}

// Loss function
const {} = {{ from: lastCreated(), to: '{}', function: '{}' }};
        ", from_jsx, loss_var, loss.to, loss.function);
        
        Ok(jsx_code)
    }
    
    fn compile_expression(&mut self, nodes: &[ASTNode]) -> Result<String, ReactCompilerError> {
        let mut jsx_code = String::new();
        
        for node in nodes {
            let node_jsx = self.compile(node)?;
            jsx_code.push_str(&node_jsx);
            jsx_code.push_str("\n");
        }
        
        Ok(jsx_code)
    }
    
    fn compile_ui_component(&mut self, component: &UIComponentNode) -> Result<String, ReactCompilerError> {
        let react_component = match component.component_type {
            UIComponentType::Canvas => "canvas",
            UIComponentType::Panel => "div",
            UIComponentType::Layout => "div",
            UIComponentType::Button => "button",
            UIComponentType::Label => "span",
        };
        
        // Generate dimensions style
        let style = if let Some((width, height)) = component.dimensions {
            format!("{{ width: {}, height: {} }}", width, height)
        } else {
            "{{ width: '100%' }}".to_string()
        };
        
        // Generate properties
        let mut properties = component.properties.clone();
        let class_name = match component.component_type {
            UIComponentType::Canvas => "gaia-canvas",
            UIComponentType::Panel => "gaia-panel",
            UIComponentType::Layout => "gaia-layout",
            UIComponentType::Button => "gaia-button",
            UIComponentType::Label => "gaia-label",
        };
        properties.insert("className".to_string(), class_name.to_string());
        
        // Convert properties to JSX attributes
        let attributes = properties
            .iter()
            .map(|(k, v)| {
                if k == "text" {
                    String::new() // text will be handled as children
                } else {
                    format!("{k}=\"{v}\"")
                }
            })
            .filter(|s| !s.is_empty())
            .collect::<Vec<String>>()
            .join(" ");
        
        // Handle text content
        let children = properties.get("text").map_or(String::new(), |text| text.clone());
        
        // Create component
        let component_var = self.get_unique_id("ui");
        let jsx_code = format!("
const {} = (
  <{} style={{{}}} {}>
    {}
  </{}>
);
        ", component_var, react_component, style, attributes, children, react_component);
        
        Ok(jsx_code)
    }
    
    fn compile_event_handler(&mut self, handler: &EventHandlerNode) -> Result<String, ReactCompilerError> {
        // Compile the handler body
        let handler_body = self.compile(&handler.handler)?;
        
        // Create event handler function
        let handler_fn = self.get_unique_id("handler");
        let event_type = match handler.event_type.as_str() {
            "click" => "onClick",
            "hover" => "onMouseOver",
            "change" => "onChange",
            "input" => "onInput",
            _ => &handler.event_type,
        };
        
        let jsx_code = format!("
// Handler function
const {} = (event) => {{
  {}
}};

// Add event handler to component
<{} {...props} {}={{{}}} />
        ", handler_fn, handler_body, handler.source, event_type, handler_fn);
        
        Ok(jsx_code)
    }
    
    fn compile_data_binding(&mut self, binding: &DataBindingNode) -> Result<String, ReactCompilerError> {
        let hook_type = if binding.bidirectional { 
            "const [, set] = useState" 
        } else { 
            "const = useMemo(() => " 
        };
        
        let jsx_code = if binding.bidirectional {
            format!("
// Bidirectional data binding
const [{}, set{}] = useState({});
useEffect(() => {{
  // Sync changes back to source
  on{}Change = (newValue) => {{
    set{}(newValue);
  }};
}}, []);
            ", binding.target, binding.target, binding.source, binding.source, binding.target)
        } else {
            format!("
// One-way data binding
const {} = useMemo(() => {}, [{}]);
            ", binding.target, binding.source, binding.source)
        };
        
        Ok(jsx_code)
    }
    
    fn compile_threed_component(&mut self, component: &ThreeDComponentNode) -> Result<String, ReactCompilerError> {
        let component_type = match component.component_type {
            ThreeDComponentType::World3D => "Canvas",
            ThreeDComponentType::Camera => "PerspectiveCamera",
            ThreeDComponentType::Renderer => "Renderer",
            ThreeDComponentType::Light => "PointLight",
            ThreeDComponentType::Mesh => "Mesh",
            ThreeDComponentType::Texture => "Texture",
            ThreeDComponentType::Material => "MeshStandardMaterial",
            ThreeDComponentType::Shader => "Shader",
            ThreeDComponentType::Scene => "Scene",
            ThreeDComponentType::Skybox => "Sky",
        };
        
        // Convert params to JSX props
        let props = component.params
            .iter()
            .map(|(k, v)| format!("{}=\"{}\"", k, v))
            .collect::<Vec<String>>()
            .join(" ");
        
        // Create component
        let component_var = self.get_unique_id("three");
        let jsx_code = format!("
const {} = (
  <{} {}>
    {{/* 3D component children */}}
  </{}>
);
        ", component_var, component_type, props, component_type);
        
        Ok(jsx_code)
    }
    
    fn compile_asset(&mut self, asset: &AssetNode) -> Result<String, ReactCompilerError> {
        let asset_var = self.get_unique_id("asset");
        let asset_hook = match asset.asset_type.as_str() {
            "model" => "useGLTF",
            "texture" => "useTexture",
            "audio" => "useAudio",
            _ => "useLoader",
        };
        
        let jsx_code = format!("
const {} = {}('{}');
        ", asset_var, asset_hook, asset.path);
        
        Ok(jsx_code)
    }
}