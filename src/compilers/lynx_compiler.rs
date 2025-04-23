use std::collections::HashMap;
use crate::ast::*;
use crate::extensions::ui_extensions::*;
use crate::extensions::three_extensions::*;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum LynxCompilerError {
    #[error("Undefined component: {0}")]
    UndefinedComponent(String),
    
    #[error("Compilation error: {0}")]
    CompilationError(String),
}

pub struct LynxCompiler {
    symbol_table: SymbolTable,
    lynx_components: HashMap<String, String>,
    lynx_functions: HashMap<String, String>,
    unique_id_counter: usize,
}

impl LynxCompiler {
    pub fn new() -> Self {
        LynxCompiler {
            symbol_table: SymbolTable::new(),
            lynx_components: HashMap::new(),
            lynx_functions: HashMap::new(),
            unique_id_counter: 0,
        }
    }
    
    pub fn compile(&mut self, node: &ASTNode) -> Result<String, LynxCompilerError> {
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
    
    fn compile_network(&mut self, network: &NetworkNode) -> Result<String, LynxCompilerError> {
        let mut components_lynx = String::new();
        
        // Process components if defined
        if let Some(components) = &network.components {
            for comp in components {
                // Register components in symbol table
                if let Some(comp_node) = self.symbol_table.get_component(comp) {
                    // Clone to avoid borrowing issues
                    let comp_node_clone = comp_node.clone();
                    let comp_lynx = self.compile(&comp_node_clone)?;
                    components_lynx.push_str(&comp_lynx);
                    components_lynx.push_str("\n\n");
                }
            }
        }
        
        // Process the network body
        let mut body_lynx = String::new();
        for node in &network.body {
            let node_lynx = self.compile(node)?;
            body_lynx.push_str(&node_lynx);
            body_lynx.push_str("\n");
        }
        
        // Create a LynxJS application with all compiled components
        let result = format!("
// Generated LynxJS from GaiaScript
import {{ Component, State, h }} from '@lynx/core';
import {{ Neural }} from '@lynx/neural';
import {{ Renderer, Scene, Camera, Light, Mesh }} from '@lynx/3d';

// Components
{components}

// App definition
@Component({{
  tag: 'gaia-app',
  styleUrl: 'gaia-app.css',
  shadow: true
}})
export class GaiaApp {{
  // State declarations
  @State() appState: any = {{}};
  
  // Lifecycle hooks
  componentWillLoad() {{
    this.initialize();
  }}
  
  initialize() {{
    // Initialize components
  }}
  
  // Render method
  render() {{
    return (
      <div class=\"gaia-app-container\">
        {body}
      </div>
    );
  }}
}}
        ", components = components_lynx, body = body_lynx);
        
        Ok(result)
    }
    
    fn compile_component(&mut self, component: &ComponentNode) -> Result<String, LynxCompilerError> {
        // Register the component in the symbol table
        self.symbol_table.add_component(component.id.clone(), *component.expr.clone());
        
        // Compile the component expression
        let expr_lynx = self.compile(&component.expr)?;
        
        // Create a LynxJS component class
        let class_name = self.lynx_component_name(&component.id);
        let lynx_component = format!("
@Component({{
  tag: '{}',
  styleUrl: '{}.css',
  shadow: true
}})
export class {} {{
  // Component properties and state
  @State() state: any = {{}};
  
  // Component implementation
  {}
  
  // Render method
  render() {{
    return (
      <div class=\"{}-container\">
        {{/* Component content */}}
      </div>
    );
  }}
}}
        ", class_name.to_lowercase(), class_name.to_lowercase(), class_name, expr_lynx, class_name.to_lowercase());
        
        // Store the component
        self.lynx_components.insert(component.id.clone(), lynx_component.clone());
        
        Ok(lynx_component)
    }
    
    fn lynx_component_name(&self, id: &str) -> String {
        match id {
            "γ" => "UiComponent".to_string(),
            "φ" => "GameComponent".to_string(),
            "δ" => "DataComponent".to_string(),
            "α" => "AssetComponent".to_string(),
            _ => format!("{}Component", id),
        }
    }
    
    fn compile_layer(&mut self, layer: &LayerNode) -> Result<String, LynxCompilerError> {
        // Convert layer type and parameters to LynxJS neural
        let (layer_type, layer_params) = match &layer.layer_type {
            LayerType::Convolutional(idx) => {
                let filters = if !layer.params.is_empty() { layer.params[0] } else { 32 };
                let kernel_size = if layer.params.len() > 1 { layer.params[1] } else { 3 };
                
                ("Neural.Conv2D", format!("{{ filters: {}, kernelSize: [3, 3], activation: '{}' }}", 
                    filters, self.get_activation_name(&layer.activation)))
            },
            LayerType::Dense(idx) => {
                let units = if !layer.params.is_empty() { layer.params[0] } else { 128 };
                
                ("Neural.Dense", format!("{{ units: {}, activation: '{}' }}", 
                    units, self.get_activation_name(&layer.activation)))
            },
            LayerType::Pooling => {
                let size = if !layer.params.is_empty() { layer.params[0] } else { 2 };
                
                ("Neural.MaxPooling2D", format!("{{ poolSize: [{}, {}] }}", size, size))
            },
            LayerType::Flatten => ("Neural.Flatten", "{}".to_string()),
            LayerType::LSTM => {
                let units = if !layer.params.is_empty() { layer.params[0] } else { 128 };
                
                ("Neural.LSTM", format!("{{ units: {}, returnSequences: true }}", units))
            },
            _ => ("Neural.Layer", "{}".to_string()),
        };
        
        // Create a variable for this layer
        let layer_var = self.get_unique_id("layer");
        
        // Generate the LynxJS code
        let lynx_code = format!("const {} = new {}({});", layer_var, layer_type, layer_params);
        
        Ok(lynx_code)
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
    
    fn compile_block(&mut self, block: &BlockNode) -> Result<String, LynxCompilerError> {
        // Compile the block content
        let content_lynx = self.compile(&block.content)?;
        
        // Create a function for the block to be executed multiple times
        let block_id = self.get_unique_id("block");
        let block_fn = format!("
// Function to repeat
const {}Fn = () => {{
  {}
}};

// Repeat the block {} times
{{{Array({})}}.map((_, i) => (
  <Fragment key={{i}}>
    {{{}Fn()}}
  </Fragment>
))}
        ", block_id, content_lynx, block.repetitions, block.repetitions, block_id);
        
        Ok(block_fn)
    }
    
    fn compile_input(&mut self, input: &InputNode) -> Result<String, LynxCompilerError> {
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
        
        // Determine input type
        let input_type = match input.input_type {
            InputType::Image => "Neural.ImageInput",
            InputType::Text => "Neural.TextInput",
            InputType::Sequence => "Neural.SequenceInput",
            InputType::Latent => "Neural.LatentInput",
        };
        
        // Create a variable for this input
        let input_var = self.get_unique_id("input");
        
        // Generate the LynxJS code
        let lynx_code = format!("const {} = new {}({{ shape: {} }});", input_var, input_type, shape);
        
        Ok(lynx_code)
    }
    
    fn compile_data_flow(&mut self, from: &ASTNode, to: &ASTNode) -> Result<String, LynxCompilerError> {
        // Compile the "from" part
        let from_lynx = self.compile(from)?;
        
        // Compile the "to" part
        let to_lynx = self.compile(to)?;
        
        // Connect them in LynxJS
        let from_var = self.get_unique_id("from");
        let to_var = self.get_unique_id("to");
        
        let lynx_code = format!("
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
Neural.connect({}, {});
        ", from_var, from_lynx, to_var, to_lynx, from_var, to_var);
        
        Ok(lynx_code)
    }
    
    fn compile_loss(&mut self, loss: &LossNode) -> Result<String, LynxCompilerError> {
        // Compile the "from" part
        let from_lynx = self.compile(&loss.from)?;
        
        // Create a variable for this loss
        let loss_var = self.get_unique_id("loss");
        
        // Generate the LynxJS code
        let lynx_code = format!("
// From:
{}

// Loss function
const {} = Neural.createLoss('{}', '{}');
        ", from_lynx, loss_var, loss.to, loss.function);
        
        Ok(lynx_code)
    }
    
    fn compile_expression(&mut self, nodes: &[ASTNode]) -> Result<String, LynxCompilerError> {
        let mut lynx_code = String::new();
        
        for node in nodes {
            let node_lynx = self.compile(node)?;
            lynx_code.push_str(&node_lynx);
            lynx_code.push_str("\n");
        }
        
        Ok(lynx_code)
    }
    
    fn compile_ui_component(&mut self, component: &UIComponentNode) -> Result<String, LynxCompilerError> {
        let lynx_component = match component.component_type {
            UIComponentType::Canvas => "lynx-canvas",
            UIComponentType::Panel => "div",
            UIComponentType::Layout => "div",
            UIComponentType::Button => "lynx-button",
            UIComponentType::Label => "lynx-text",
        };
        
        // Generate dimensions style
        let style = if let Some((width, height)) = component.dimensions {
            format!("{{ width: '{}px', height: '{}px' }}", width, height)
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
        properties.insert("class".to_string(), class_name.to_string());
        
        // Convert properties to JSX attributes
        let attributes = properties
            .iter()
            .map(|(k, v)| {
                if k == "text" {
                    String::new() // text will be handled as children
                } else {
                    format!("{}=\"{}\"", k, v)
                }
            })
            .filter(|s| !s.is_empty())
            .collect::<Vec<String>>()
            .join(" ");
        
        // Handle text content
        let children = properties.get("text").map_or(String::new(), |text| text.clone());
        
        // Create component
        let component_var = self.get_unique_id("ui");
        let lynx_code = format!("
const {} = (
  <{} style={{{}}} {}>
    {}
  </{}>
);
        ", component_var, lynx_component, style, attributes, children, lynx_component);
        
        Ok(lynx_code)
    }
    
    fn compile_event_handler(&mut self, handler: &EventHandlerNode) -> Result<String, LynxCompilerError> {
        // Compile the handler body
        let handler_body = self.compile(&handler.handler)?;
        
        // Create event handler function
        let handler_fn = self.get_unique_id("handler");
        let event_type = format!("on{}", handler.event_type);
        
        let lynx_code = format!("
// Handler function
const {} = (event) => {{
  {}
}};

// Add event handler
<{} {{...props}} {}={{{}}} />
        ", handler_fn, handler_body, handler.source, event_type, handler_fn);
        
        Ok(lynx_code)
    }
    
    fn compile_data_binding(&mut self, binding: &DataBindingNode) -> Result<String, LynxCompilerError> {
        // Create data binding
        let binding_code = if binding.bidirectional {
            format!("
// Bidirectional data binding
@Prop() {} = {};
@Watch('{}')
{}Changed(newValue) {{
  // Update source
  this.{} = newValue;
}}
            ", binding.target, binding.source, binding.target, binding.target, binding.source)
        } else {
            format!("
// One-way data binding
@Prop() {} = {};
            ", binding.target, binding.source)
        };
        
        Ok(binding_code)
    }
    
    fn compile_threed_component(&mut self, component: &ThreeDComponentNode) -> Result<String, LynxCompilerError> {
        let component_type = match component.component_type {
            ThreeDComponentType::World3D => "lynx-scene",
            ThreeDComponentType::Camera => "lynx-camera",
            ThreeDComponentType::Renderer => "lynx-renderer",
            ThreeDComponentType::Light => "lynx-light",
            ThreeDComponentType::Mesh => "lynx-mesh",
            ThreeDComponentType::Texture => "lynx-texture",
            ThreeDComponentType::Material => "lynx-material",
            ThreeDComponentType::Shader => "lynx-shader",
            ThreeDComponentType::Scene => "lynx-scene",
            ThreeDComponentType::Skybox => "lynx-skybox",
        };
        
        // Convert params to JSX props
        let props = component.params
            .iter()
            .map(|(k, v)| format!("{}=\"{}\"", k, v))
            .collect::<Vec<String>>()
            .join(" ");
        
        // Create component
        let component_var = self.get_unique_id("three");
        let lynx_code = format!("
const {} = (
  <{} {}>
    {{/* 3D component children */}}
  </{}>
);
        ", component_var, component_type, props, component_type);
        
        Ok(lynx_code)
    }
    
    fn compile_asset(&mut self, asset: &AssetNode) -> Result<String, LynxCompilerError> {
        let asset_var = self.get_unique_id("asset");
        let asset_tag = match asset.asset_type.as_str() {
            "model" => "lynx-model",
            "texture" => "lynx-texture",
            "audio" => "lynx-audio",
            _ => "lynx-asset",
        };
        
        let lynx_code = format!("
const {} = (
  <{} src=\"{}\">
  </{}>
);
        ", asset_var, asset_tag, asset.path, asset_tag);
        
        Ok(lynx_code)
    }
}