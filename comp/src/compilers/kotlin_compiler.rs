use std::collections::HashMap;
use crate::ast::*;
use crate::extensions::ui_extensions::*;
use crate::extensions::three_extensions::*;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum KotlinCompilerError {
    #[error("Undefined component: {0}")]
    UndefinedComponent(String),
    
    #[error("Compilation error: {0}")]
    CompilationError(String),
}

pub struct KotlinCompiler {
    symbol_table: SymbolTable,
    kotlin_classes: HashMap<String, String>,
    kotlin_functions: HashMap<String, String>,
    unique_id_counter: usize,
}

impl KotlinCompiler {
    pub fn new() -> Self {
        KotlinCompiler {
            symbol_table: SymbolTable::new(),
            kotlin_classes: HashMap::new(),
            kotlin_functions: HashMap::new(),
            unique_id_counter: 0,
        }
    }
    
    pub fn compile(&mut self, node: &ASTNode) -> Result<String, KotlinCompilerError> {
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
            ASTNode::Raw(raw) => Ok(raw.content.clone()),
        }
    }
    
    fn get_unique_id(&mut self, prefix: &str) -> String {
        let id = format!("{}_{}", prefix, self.unique_id_counter);
        self.unique_id_counter += 1;
        id
    }
    
    fn compile_network(&mut self, network: &NetworkNode) -> Result<String, KotlinCompilerError> {
        let mut components_kt = String::new();
        
        // Process components if defined
        if let Some(components) = &network.components {
            for comp in components {
                // Register components in symbol table
                if let Some(comp_node) = self.symbol_table.get_component(comp) {
                    // Clone to avoid borrowing issues
                    let comp_node_clone = comp_node.clone();
                    let comp_kt = self.compile(&comp_node_clone)?;
                    components_kt.push_str(&comp_kt);
                    components_kt.push_str("\n\n");
                }
            }
        }
        
        // Process the network body
        let mut body_kt = String::new();
        for node in &network.body {
            let node_kt = self.compile(node)?;
            body_kt.push_str(&node_kt);
            body_kt.push_str("\n");
        }
        
        // Create a Kotlin class with all compiled components
        let result = format!("
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import org.tensorflow.lite.Interpreter
import java.nio.ByteBuffer

// Generated Kotlin from GaiaScript
{components}

class GaiaScriptApp : ComponentActivity() {{
    override fun onCreate(savedInstanceState: Bundle?) {{
        super.onCreate(savedInstanceState)
        setContent {{
            MaterialTheme {{
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {{
                    GaiaScriptContent()
                }}
            }}
        }}
    }}
}}

@Composable
fun GaiaScriptContent() {{
    {body}
}}
        ", components = components_kt, body = body_kt);
        
        Ok(result)
    }
    
    fn compile_component(&mut self, component: &ComponentNode) -> Result<String, KotlinCompilerError> {
        // Register the component in the symbol table
        self.symbol_table.add_component(component.id.clone(), *component.expr.clone());
        
        // Compile the component expression
        let expr_kt = self.compile(&component.expr)?;
        
        // Create a Kotlin class for this component
        let kt_class = format!("
// Component: {}
class {} {{
    {}
    
    fun initialize() {{
        // Component initialization
    }}
}}
        ", component.id, self.kotlin_class_name(&component.id), expr_kt);
        
        // Store the class in the map
        self.kotlin_classes.insert(component.id.clone(), kt_class.clone());
        
        Ok(kt_class)
    }
    
    fn kotlin_class_name(&self, id: &str) -> String {
        match id {
            "γ" => "UIComponent".to_string(),
            "φ" => "GameComponent".to_string(),
            "δ" => "DataComponent".to_string(),
            "α" => "AssetComponent".to_string(),
            _ => format!("{}Component", id),
        }
    }
    
    fn compile_layer(&mut self, layer: &LayerNode) -> Result<String, KotlinCompilerError> {
        // Convert layer type and parameters to Kotlin
        let (layer_type, layer_params) = match &layer.layer_type {
            LayerType::Convolutional(idx) => {
                let filters = if !layer.params.is_empty() { layer.params[0] } else { 32 };
                let kernel_size = if layer.params.len() > 1 { layer.params[1] } else { 3 };
                
                ("Conv2D", format!("filters = {}, kernelSize = {}, index = {}", 
                    filters, kernel_size, idx))
            },
            LayerType::Dense(idx) => {
                let units = if !layer.params.is_empty() { layer.params[0] } else { 128 };
                
                ("Dense", format!("units = {}, index = {}", units, idx))
            },
            LayerType::Pooling => {
                let size = if !layer.params.is_empty() { layer.params[0] } else { 2 };
                
                ("MaxPooling", format!("size = {}", size))
            },
            LayerType::Flatten => ("Flatten", "".to_string()),
            LayerType::LSTM => {
                let units = if !layer.params.is_empty() { layer.params[0] } else { 128 };
                
                ("LSTM", format!("units = {}", units))
            },
            _ => ("Layer", "".to_string()),
        };
        
        // Convert activation function to Kotlin
        let activation = match layer.activation {
            ActivationFunction::ReLU => "ReLU",
            ActivationFunction::Sigmoid => "Sigmoid",
            ActivationFunction::Tanh => "Tanh",
            ActivationFunction::Softmax => "Softmax",
            ActivationFunction::None => "None",
        };
        
        // Create a variable for this layer
        let layer_var = self.get_unique_id("layer");
        
        // Generate the Kotlin code
        let kt_code = format!("val {} = {}Layer({}, activation = \"{}\")", 
            layer_var, layer_type, layer_params, activation);
        
        Ok(kt_code)
    }
    
    fn compile_block(&mut self, block: &BlockNode) -> Result<String, KotlinCompilerError> {
        // Compile the block content
        let content_kt = self.compile(&block.content)?;
        
        // Create a function for the block to be executed multiple times
        let block_id = self.get_unique_id("block");
        let block_fn = format!("
fun {}() {{
    {}
}}

// Repeat the block {} times
val {} = (1..{}).map {{ {}() }}
        ", block_id, content_kt, block.repetitions, 
           self.get_unique_id("repeated"), block.repetitions, block_id);
        
        Ok(block_fn)
    }
    
    fn compile_input(&mut self, input: &InputNode) -> Result<String, KotlinCompilerError> {
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
            InputType::Image => "ImageInput",
            InputType::Text => "TextInput",
            InputType::Sequence => "SequenceInput",
            InputType::Latent => "LatentInput",
        };
        
        // Create a variable for this input
        let input_var = self.get_unique_id("input");
        
        // Generate the Kotlin code
        let kt_code = format!("val {} = {}(shape = intArrayOf{})", 
            input_var, input_type, shape);
        
        Ok(kt_code)
    }
    
    fn compile_data_flow(&mut self, from: &ASTNode, to: &ASTNode) -> Result<String, KotlinCompilerError> {
        // Compile the "from" part
        let from_kt = self.compile(from)?;
        
        // Compile the "to" part
        let to_kt = self.compile(to)?;
        
        // Connect them in Kotlin
        let from_var = self.get_unique_id("from");
        let to_var = self.get_unique_id("to");
        
        let kt_code = format!("
// From:
val {} = run {{
    {}
    lastCreated()
}}

// To:
val {} = run {{
    {}
    lastCreated()
}}

// Connect from to to
connectLayers({}, {})
        ", from_var, from_kt, to_var, to_kt, from_var, to_var);
        
        Ok(kt_code)
    }
    
    fn compile_loss(&mut self, loss: &LossNode) -> Result<String, KotlinCompilerError> {
        // Compile the "from" part
        let from_kt = self.compile(&loss.from)?;
        
        // Create a variable for this loss
        let loss_var = self.get_unique_id("loss");
        
        // Generate the Kotlin code
        let kt_code = format!("
// From:
{}

// Loss function
val {} = createLoss(\"{}\", \"{}\")
        ", from_kt, loss_var, loss.to, loss.function);
        
        Ok(kt_code)
    }
    
    fn compile_expression(&mut self, nodes: &[ASTNode]) -> Result<String, KotlinCompilerError> {
        let mut kt_code = String::new();
        
        for node in nodes {
            let node_kt = self.compile(node)?;
            kt_code.push_str(&node_kt);
            kt_code.push_str("\n");
        }
        
        Ok(kt_code)
    }
    
    fn compile_ui_component(&mut self, component: &UIComponentNode) -> Result<String, KotlinCompilerError> {
        let compose_component = match component.component_type {
            UIComponentType::Canvas => "@Composable\nfun DrawCanvas",
            UIComponentType::Panel => "@Composable\nfun Panel",
            UIComponentType::Layout => "@Composable\nfun Layout",
            UIComponentType::Button => "@Composable\nfun Button",
            UIComponentType::Label => "@Composable\nfun Text",
        };
        
        // Generate dimensions
        let dimensions = if let Some((width, height)) = component.dimensions {
            format!("modifier = Modifier.size({}dp, {}dp)", width, height)
        } else {
            "modifier = Modifier.fillMaxWidth()".to_string()
        };
        
        // Generate properties
        let properties = self.compile_property_map(&component.properties);
        
        // Create component
        let _component_var = self.get_unique_id("ui");
        let kt_code = format!("
{}(
    {},
    {}
)
        ", compose_component, dimensions, properties);
        
        Ok(kt_code)
    }
    
    fn compile_property_map(&self, props: &HashMap<String, String>) -> String {
        // Convert properties to Kotlin parameters
        let props_entries: Vec<String> = props
            .iter()
            .map(|(k, v)| format!("{} = \"{}\"", k, v))
            .collect();
        
        props_entries.join(",\n    ")
    }
    
    fn compile_event_handler(&mut self, handler: &EventHandlerNode) -> Result<String, KotlinCompilerError> {
        // Compile the handler body
        let handler_body = self.compile(&handler.handler)?;
        
        // Create event handler function
        let handler_fn = self.get_unique_id("handler");
        let kt_code = format!("
val {} = {{
    {}
}}

// Add event handler
{}.{} = {}
        ", handler_fn, handler_body, handler.source, handler.event_type, handler_fn);
        
        Ok(kt_code)
    }
    
    fn compile_data_binding(&mut self, binding: &DataBindingNode) -> Result<String, KotlinCompilerError> {
        let binding_type = if binding.bidirectional { 
            "by remember { mutableStateOf" 
        } else { 
            "by derivedStateOf" 
        };
        
        let kt_code = format!("
val {} {} {{ {} }}
        ", binding.target, binding_type, binding.source);
        
        Ok(kt_code)
    }
    
    fn compile_threed_component(&mut self, component: &ThreeDComponentNode) -> Result<String, KotlinCompilerError> {
        let component_type = match component.component_type {
            ThreeDComponentType::World3D => "World3D",
            ThreeDComponentType::Camera => "Camera",
            ThreeDComponentType::Renderer => "Renderer",
            ThreeDComponentType::Light => "Light",
            ThreeDComponentType::Mesh => "Mesh",
            ThreeDComponentType::Texture => "Texture",
            ThreeDComponentType::Material => "Material",
            ThreeDComponentType::Shader => "Shader",
            ThreeDComponentType::Scene => "Scene",
            ThreeDComponentType::Skybox => "Skybox",
        };
        
        // Generate params
        let params = self.compile_property_map(&component.params);
        
        // Create component
        let component_var = self.get_unique_id("three");
        let kt_code = format!("
val {} = {}(
    {}
)
        ", component_var, component_type, params);
        
        Ok(kt_code)
    }
    
    fn compile_asset(&mut self, asset: &AssetNode) -> Result<String, KotlinCompilerError> {
        let asset_var = self.get_unique_id("asset");
        let kt_code = format!("
val {} = loadAsset(
    path = \"{}\",
    type = \"{}\"
)
        ", asset_var, asset.path, asset.asset_type);
        
        Ok(kt_code)
    }
}