use std::collections::HashMap;
use crate::ast::*;
use crate::extensions::ui_extensions::*;
use crate::extensions::three_extensions::*;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum FlutterCompilerError {
    #[error("Undefined component: {0}")]
    UndefinedComponent(String),
    
    #[error("Compilation error: {0}")]
    CompilationError(String),
}

pub struct FlutterCompiler {
    symbol_table: SymbolTable,
    dart_classes: HashMap<String, String>,
    dart_functions: HashMap<String, String>,
    unique_id_counter: usize,
}

impl FlutterCompiler {
    pub fn new() -> Self {
        FlutterCompiler {
            symbol_table: SymbolTable::new(),
            dart_classes: HashMap::new(),
            dart_functions: HashMap::new(),
            unique_id_counter: 0,
        }
    }
    
    pub fn compile(&mut self, node: &ASTNode) -> Result<String, FlutterCompilerError> {
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
    
    fn compile_network(&mut self, network: &NetworkNode) -> Result<String, FlutterCompilerError> {
        let mut components_dart = String::new();
        
        // Process components if defined
        if let Some(components) = &network.components {
            for comp in components {
                // Register components in symbol table
                if let Some(comp_node) = self.symbol_table.get_component(comp) {
                    // Clone to avoid borrowing issues
                    let comp_node_clone = comp_node.clone();
                    let comp_dart = self.compile(&comp_node_clone)?;
                    components_dart.push_str(&comp_dart);
                    components_dart.push_str("\n\n");
                }
            }
        }
        
        // Process the network body
        let mut body_dart = String::new();
        for node in &network.body {
            let node_dart = self.compile(node)?;
            body_dart.push_str(&node_dart);
            body_dart.push_str("\n");
        }
        
        // Create a Flutter app with all compiled components
        let result = format!("
import 'package:flutter/material.dart';
import 'package:flutter_tensorflow/flutter_tensorflow.dart';
import 'package:flutter_3d/flutter_3d.dart';

// Generated Flutter from GaiaScript
{components}

void main() {{
  runApp(const GaiaScriptApp());
}}

class GaiaScriptApp extends StatelessWidget {{
  const GaiaScriptApp({{Key? key}}) : super(key: key);

  @override
  Widget build(BuildContext context) {{
    return MaterialApp(
      title: 'GaiaScript App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const GaiaScriptHome(),
    );
  }}
}}

class GaiaScriptHome extends StatefulWidget {{
  const GaiaScriptHome({{Key? key}}) : super(key: key);

  @override
  _GaiaScriptHomeState createState() => _GaiaScriptHomeState();
}}

class _GaiaScriptHomeState extends State<GaiaScriptHome> {{
  // App state
  late final ModelController modelController;
  
  @override
  void initState() {{
    super.initState();
    modelController = ModelController();
    _initializeApp();
  }}
  
  Future<void> _initializeApp() async {{
    // Initialize components
  }}

  @override
  Widget build(BuildContext context) {{
    return Scaffold(
      appBar: AppBar(
        title: const Text('GaiaScript App'),
      ),
      body: {body}
    );
  }}
}}
        ", components = components_dart, body = body_dart);
        
        Ok(result)
    }
    
    fn compile_component(&mut self, component: &ComponentNode) -> Result<String, FlutterCompilerError> {
        // Register the component in the symbol table
        self.symbol_table.add_component(component.id.clone(), *component.expr.clone());
        
        // Compile the component expression
        let expr_dart = self.compile(&component.expr)?;
        
        // Create a Flutter widget class
        let class_name = self.dart_class_name(&component.id);
        let dart_class = format!("
class {} extends StatefulWidget {{
  const {}({{Key? key}}) : super(key: key);

  @override
  _{}State createState() => _{}State();
}}

class _{}State extends State<{}> {{
  // State for this component
  {}
  
  @override
  Widget build(BuildContext context) {{
    return Container(
      // Widget implementation
    );
  }}
}}
        ", class_name, class_name, class_name, class_name, class_name, class_name, expr_dart);
        
        // Store the class
        self.dart_classes.insert(component.id.clone(), dart_class.clone());
        
        Ok(dart_class)
    }
    
    fn dart_class_name(&self, id: &str) -> String {
        match id {
            "γ" => "UIComponent".to_string(),
            "φ" => "GameComponent".to_string(),
            "δ" => "DataComponent".to_string(),
            "α" => "AssetComponent".to_string(),
            _ => format!("{}Component", id),
        }
    }
    
    fn compile_layer(&mut self, layer: &LayerNode) -> Result<String, FlutterCompilerError> {
        // Convert layer type and parameters to Flutter/TensorFlow
        let (layer_class, layer_params) = match &layer.layer_type {
            LayerType::Convolutional(idx) => {
                let filters = if !layer.params.is_empty() { layer.params[0] } else { 32 };
                let kernel_size = if layer.params.len() > 1 { layer.params[1] } else { 3 };
                
                ("Conv2D", format!("filters: {}, kernelSize: {}, index: {}", 
                    filters, kernel_size, idx))
            },
            LayerType::Dense(idx) => {
                let units = if !layer.params.is_empty() { layer.params[0] } else { 128 };
                
                ("Dense", format!("units: {}, index: {}", units, idx))
            },
            LayerType::Pooling => {
                let size = if !layer.params.is_empty() { layer.params[0] } else { 2 };
                
                ("MaxPooling2D", format!("poolSize: {}", size))
            },
            LayerType::Flatten => ("Flatten", "".to_string()),
            LayerType::LSTM => {
                let units = if !layer.params.is_empty() { layer.params[0] } else { 128 };
                
                ("LSTM", format!("units: {}", units))
            },
            _ => ("Layer", "".to_string()),
        };
        
        // Convert activation function to Flutter
        let activation = match layer.activation {
            ActivationFunction::ReLU => "relu",
            ActivationFunction::Sigmoid => "sigmoid",
            ActivationFunction::Tanh => "tanh",
            ActivationFunction::Softmax => "softmax",
            ActivationFunction::None => "none",
        };
        
        // Create a variable for this layer
        let layer_var = self.get_unique_id("layer");
        
        // Generate the Dart code
        let dart_code = format!("final {} = {}({}, activation: '{}');", 
            layer_var, layer_class, layer_params, activation);
        
        Ok(dart_code)
    }
    
    fn compile_block(&mut self, block: &BlockNode) -> Result<String, FlutterCompilerError> {
        // Compile the block content
        let content_dart = self.compile(&block.content)?;
        
        // Create a function for the block to be executed multiple times
        let block_id = self.get_unique_id("block");
        let block_fn = format!("
Widget {}() {{
  return {}
}}

// Repeat the block {} times
List<Widget> {}() {{
  return List.generate({}, (_) => {}());
}}
        ", block_id, content_dart, block.repetitions, self.get_unique_id("repeated"), 
           block.repetitions, block_id);
        
        Ok(block_fn)
    }
    
    fn compile_input(&mut self, input: &InputNode) -> Result<String, FlutterCompilerError> {
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
        let input_class = match input.input_type {
            InputType::Image => "ImageInput",
            InputType::Text => "TextInput",
            InputType::Sequence => "SequenceInput",
            InputType::Latent => "LatentInput",
        };
        
        // Create a variable for this input
        let input_var = self.get_unique_id("input");
        
        // Generate the Dart code
        let dart_code = format!("final {} = {}(shape: {});", 
            input_var, input_class, shape);
        
        Ok(dart_code)
    }
    
    fn compile_data_flow(&mut self, from: &ASTNode, to: &ASTNode) -> Result<String, FlutterCompilerError> {
        // Compile the "from" part
        let from_dart = self.compile(from)?;
        
        // Compile the "to" part
        let to_dart = self.compile(to)?;
        
        // Connect them in Dart
        let from_var = self.get_unique_id("from");
        let to_var = self.get_unique_id("to");
        
        let dart_code = format!("
// From:
final {} = (() {{
  {}
  return lastCreated();
}})();

// To:
final {} = (() {{
  {}
  return lastCreated();
}})();

// Connect from to to
connectLayers({}, {});
        ", from_var, from_dart, to_var, to_dart, from_var, to_var);
        
        Ok(dart_code)
    }
    
    fn compile_loss(&mut self, loss: &LossNode) -> Result<String, FlutterCompilerError> {
        // Compile the "from" part
        let from_dart = self.compile(&loss.from)?;
        
        // Create a variable for this loss
        let loss_var = self.get_unique_id("loss");
        
        // Generate the Dart code
        let dart_code = format!("
// From:
{}

// Loss function
final {} = createLoss('{}', '{}');
        ", from_dart, loss_var, loss.to, loss.function);
        
        Ok(dart_code)
    }
    
    fn compile_expression(&mut self, nodes: &[ASTNode]) -> Result<String, FlutterCompilerError> {
        let mut dart_code = String::new();
        
        for node in nodes {
            let node_dart = self.compile(node)?;
            dart_code.push_str(&node_dart);
            dart_code.push_str("\n");
        }
        
        Ok(dart_code)
    }
    
    fn compile_ui_component(&mut self, component: &UIComponentNode) -> Result<String, FlutterCompilerError> {
        let flutter_widget = match component.component_type {
            UIComponentType::Canvas => "CustomPaint",
            UIComponentType::Panel => "Container",
            UIComponentType::Layout => "Column",
            UIComponentType::Button => "ElevatedButton",
            UIComponentType::Label => "Text",
        };
        
        // Generate dimensions
        let dimensions = if let Some((width, height)) = component.dimensions {
            format!("width: {}.0, height: {}.0", width, height)
        } else {
            "width: double.infinity".to_string()
        };
        
        // Generate properties
        let mut properties = component.properties.clone();
        
        // Handle special properties based on component type
        let additional_properties = match component.component_type {
            UIComponentType::Button => {
                let text = properties.get("text").cloned().unwrap_or_default();
                properties.remove("text");
                format!("child: Text('{}'),", text)
            },
            UIComponentType::Label => {
                let text = properties.get("text").cloned().unwrap_or_default();
                properties.remove("text");
                format!("'{}'", text)
            },
            _ => String::new(),
        };
        
        // Convert properties to Flutter parameters
        let props_entries: Vec<String> = properties
            .iter()
            .map(|(k, v)| format!("{}: '{}',", k, v))
            .collect();
        let properties_str = props_entries.join("\n      ");
        
        // Create component
        let component_var = self.get_unique_id("ui");
        let dart_code = format!("
final {} = {}(
  {}
  {}
  {}
);
        ", component_var, flutter_widget, dimensions, properties_str, additional_properties);
        
        Ok(dart_code)
    }
    
    fn compile_event_handler(&mut self, handler: &EventHandlerNode) -> Result<String, FlutterCompilerError> {
        // Compile the handler body
        let handler_body = self.compile(&handler.handler)?;
        
        // Create event handler function
        let handler_fn = self.get_unique_id("handler");
        let event_method = match handler.event_type.as_str() {
            "click" => "onPressed",
            "hover" => "onHover",
            "change" => "onChanged",
            "input" => "onChanged",
            _ => &handler.event_type,
        };
        
        let dart_code = format!("
// Handler function
void {}() {{
  {}
}}

// Add event handler
{}: {},
        ", handler_fn, handler_body, event_method, handler_fn);
        
        Ok(dart_code)
    }
    
    fn compile_data_binding(&mut self, binding: &DataBindingNode) -> Result<String, FlutterCompilerError> {
        let state_var = if binding.bidirectional {
            "ValueNotifier<dynamic>"
        } else {
            "final"
        };
        
        let dart_code = if binding.bidirectional {
            format!("
// Bidirectional data binding
final {0} = ValueNotifier<dynamic>({1});

// Sync changes
void update{0}(dynamic newValue) {{
  {0}.value = newValue;
  // Update source
  {1} = newValue;
}}

// Widget for binding
ValueListenableBuilder(
  valueListenable: {0},
  builder: (context, value, child) {{
    return /* Widget using value */;
  }}
)
            ", binding.target, binding.source)
        } else {
            format!("
// One-way data binding
{} {} = {};
            ", state_var, binding.target, binding.source)
        };
        
        Ok(dart_code)
    }
    
    fn compile_threed_component(&mut self, component: &ThreeDComponentNode) -> Result<String, FlutterCompilerError> {
        let component_class = match component.component_type {
            ThreeDComponentType::World3D => "Scene3D",
            ThreeDComponentType::Camera => "Camera3D",
            ThreeDComponentType::Renderer => "Renderer3D",
            ThreeDComponentType::Light => "Light3D",
            ThreeDComponentType::Mesh => "Mesh3D",
            ThreeDComponentType::Texture => "Texture3D",
            ThreeDComponentType::Material => "Material3D",
            ThreeDComponentType::Shader => "Shader3D",
            ThreeDComponentType::Scene => "Scene3D",
            ThreeDComponentType::Skybox => "Skybox3D",
        };
        
        // Generate params
        let props_entries: Vec<String> = component.params
            .iter()
            .map(|(k, v)| format!("{}: '{}',", k, v))
            .collect();
        let params = props_entries.join("\n      ");
        
        // Create component
        let component_var = self.get_unique_id("three");
        let dart_code = format!("
final {} = {}(
  {}
);
        ", component_var, component_class, params);
        
        Ok(dart_code)
    }
    
    fn compile_asset(&mut self, asset: &AssetNode) -> Result<String, FlutterCompilerError> {
        let asset_var = self.get_unique_id("asset");
        let asset_class = match asset.asset_type.as_str() {
            "model" => "Model3D",
            "texture" => "Texture3D",
            "audio" => "AudioAsset",
            _ => "Asset",
        };
        
        let dart_code = format!("
final {} = {}(
  path: '{}',
);
        ", asset_var, asset_class, asset.path);
        
        Ok(dart_code)
    }
}