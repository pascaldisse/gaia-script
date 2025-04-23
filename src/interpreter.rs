use std::collections::HashMap;
use ndarray::{Array, IxDyn};
use thiserror::Error;

use crate::ast::*;

// Runtime error types
#[derive(Error, Debug)]
pub enum RuntimeError {
    #[error("Undefined component: {0}")]
    UndefinedComponent(String),
    
    #[error("Type error: {0}")]
    TypeError(String),
    
    #[error("Execution error: {0}")]
    ExecutionError(String),
}

// Tensor representation for our runtime
#[derive(Debug, Clone)]
pub struct Tensor {
    pub data: Array<f32, IxDyn>,
    pub shape: Vec<usize>,
}

impl Tensor {
    pub fn new(shape: Vec<usize>) -> Self {
        let array = Array::<f32, _>::zeros(IxDyn(&shape));
        Tensor { data: array, shape }
    }
    
    pub fn reshape(&self, new_shape: Vec<usize>) -> Result<Tensor, RuntimeError> {
        let total_elements: usize = self.shape.iter().product();
        let new_total: usize = new_shape.iter().product();
        
        if total_elements != new_total {
            return Err(RuntimeError::TypeError(format!(
                "Cannot reshape tensor from {:?} to {:?}: element count mismatch",
                self.shape, new_shape
            )));
        }
        
        match self.data.clone().into_shape(IxDyn(&new_shape)) {
            Ok(reshaped) => Ok(Tensor {
                data: reshaped,
                shape: new_shape,
            }),
            Err(e) => Err(RuntimeError::ExecutionError(format!("Reshape failed: {}", e))),
        }
    }
}

// Value types for our interpreter
#[derive(Debug, Clone)]
pub enum Value {
    Tensor(Tensor),
    Number(f32),
    Model(NetworkModel),
    Null, // Used for unimplemented features
}

// Runtime environment
#[derive(Debug, Default)]
pub struct Environment {
    variables: HashMap<String, Value>,
    components: HashMap<String, ASTNode>,
}

impl Environment {
    pub fn new() -> Self {
        Environment {
            variables: HashMap::new(),
            components: HashMap::new(),
        }
    }
    
    pub fn set_variable(&mut self, name: &str, value: Value) {
        self.variables.insert(name.to_string(), value);
    }
    
    pub fn get_variable(&self, name: &str) -> Option<&Value> {
        self.variables.get(name)
    }
    
    pub fn add_component(&mut self, name: String, node: ASTNode) {
        self.components.insert(name, node);
    }
    
    pub fn get_component(&self, name: &str) -> Option<&ASTNode> {
        self.components.get(name)
    }
}

// Model representation
#[derive(Debug, Clone)]
pub struct NetworkModel {
    components: HashMap<String, LayerConfig>,
    structure: Vec<String>,
}

impl NetworkModel {
    pub fn new() -> Self {
        NetworkModel {
            components: HashMap::new(),
            structure: Vec::new(),
        }
    }
    
    pub fn add_layer(&mut self, name: String, config: LayerConfig) {
        self.components.insert(name.clone(), config);
        self.structure.push(name);
    }
    
    pub fn get_structure(&self) -> String {
        self.structure.join(" → ")
    }
}

// Layer configuration
#[derive(Debug, Clone)]
pub enum LayerConfig {
    Conv {
        filters: usize,
        kernel_size: usize,
        activation: ActivationFunction,
    },
    Dense {
        units: usize,
        activation: ActivationFunction,
    },
    Pooling {
        size: usize,
    },
    Flatten,
    LSTM {
        units: usize,
    },
    // Add more layer types as needed
}

// Main interpreter
pub struct Interpreter {
    env: Environment,
}

impl Interpreter {
    pub fn new() -> Self {
        Interpreter {
            env: Environment::new(),
        }
    }
    
    // Interpret an AST node
    pub fn interpret(&mut self, node: &ASTNode) -> Result<Value, RuntimeError> {
        match node {
            ASTNode::Network(network) => self.interpret_network(network),
            ASTNode::Component(component) => self.interpret_component(component),
            ASTNode::Layer(layer) => self.interpret_layer(layer),
            ASTNode::Block(block) => self.interpret_block(block),
            ASTNode::Input(input) => self.interpret_input(input),
            ASTNode::DataFlow(from, to) => self.interpret_data_flow(from, to),
            ASTNode::Loss(loss) => self.interpret_loss(loss),
            ASTNode::Expression(nodes) => self.interpret_expression(nodes),
            // Not implemented yet for non-core components
            ASTNode::UIComponent(_) => Ok(Value::Null),
            ASTNode::EventHandler(_) => Ok(Value::Null),
            ASTNode::DataBinding(_) => Ok(Value::Null),
            ASTNode::ThreeDComponent(_) => Ok(Value::Null),
            ASTNode::Asset(_) => Ok(Value::Null),
        }
    }
    
    fn interpret_network(&mut self, network: &NetworkNode) -> Result<Value, RuntimeError> {
        // Process components if defined
        if let Some(components) = &network.components {
            for comp in components {
                // Register components in environment
                if let Some(comp_node) = self.env.get_component(comp) {
                    // Clone to avoid borrowing issues
                    let comp_node_clone = comp_node.clone();
                    self.interpret(&comp_node_clone)?;
                }
            }
        }
        
        // Process the network body
        let mut last_value = Value::Number(0.0);
        for node in &network.body {
            last_value = self.interpret(node)?;
        }
        
        Ok(last_value)
    }
    
    fn interpret_component(&mut self, component: &ComponentNode) -> Result<Value, RuntimeError> {
        // Register the component in the environment
        self.env.add_component(component.id.clone(), *component.expr.clone());
        
        // Create a placeholder for the component
        let model = NetworkModel::new();
        let value = Value::Model(model);
        
        // Store in variables
        self.env.set_variable(&component.id, value.clone());
        
        Ok(value)
    }
    
    fn interpret_layer(&mut self, layer: &LayerNode) -> Result<Value, RuntimeError> {
        // Create a model with just this layer
        let mut model = NetworkModel::new();
        
        // Configure layer based on type
        match &layer.layer_type {
            LayerType::Convolutional(idx) => {
                let filters = if !layer.params.is_empty() { layer.params[0] } else { 32 };
                let kernel_size = if layer.params.len() > 1 { layer.params[1] } else { 3 };
                
                let config = LayerConfig::Conv {
                    filters,
                    kernel_size,
                    activation: layer.activation.clone(),
                };
                
                model.add_layer(format!("conv_{}", idx), config);
            },
            LayerType::Dense(idx) => {
                let units = if !layer.params.is_empty() { layer.params[0] } else { 128 };
                
                let config = LayerConfig::Dense {
                    units,
                    activation: layer.activation.clone(),
                };
                
                model.add_layer(format!("dense_{}", idx), config);
            },
            LayerType::Pooling => {
                let size = if !layer.params.is_empty() { layer.params[0] } else { 2 };
                
                let config = LayerConfig::Pooling { size };
                
                model.add_layer("pooling".to_string(), config);
            },
            LayerType::Flatten => {
                model.add_layer("flatten".to_string(), LayerConfig::Flatten);
            },
            LayerType::LSTM => {
                let units = if !layer.params.is_empty() { layer.params[0] } else { 128 };
                
                let config = LayerConfig::LSTM { units };
                
                model.add_layer("lstm".to_string(), config);
            },
            // Implement other layer types
            _ => {
                return Err(RuntimeError::ExecutionError(
                    format!("Layer type not implemented yet: {:?}", layer.layer_type)
                ));
            }
        }
        
        Ok(Value::Model(model))
    }
    
    fn interpret_block(&mut self, block: &BlockNode) -> Result<Value, RuntimeError> {
        // Interpret the block content
        let content_value = self.interpret(&block.content)?;
        
        // If the content is a model, replicate it
        if let Value::Model(mut model) = content_value {
            let original_structure = model.structure.clone();
            
            // For repetitions > 1, replicate the structure
            for i in 1..block.repetitions {
                for layer_name in &original_structure {
                    if let Some(config) = model.components.get(layer_name) {
                        model.add_layer(format!("{}_{}", layer_name, i), config.clone());
                    }
                }
            }
            
            Ok(Value::Model(model))
        } else {
            Err(RuntimeError::TypeError("Block content must be a model".to_string()))
        }
    }
    
    fn interpret_input(&mut self, input: &InputNode) -> Result<Value, RuntimeError> {
        // Create a placeholder tensor for the input
        let shape = if input.params.is_empty() {
            match input.input_type {
                InputType::Image => vec![1, 224, 224, 3],  // Default image size
                InputType::Text => vec![1, 128],           // Default sequence length
                InputType::Sequence => vec![1, 100],       // Default sequence length
                InputType::Latent => vec![1, 100],         // Default latent dim
            }
        } else {
            input.params.clone()
        };
        
        let tensor = Tensor::new(shape);
        Ok(Value::Tensor(tensor))
    }
    
    fn interpret_data_flow(&mut self, from: &ASTNode, to: &ASTNode) -> Result<Value, RuntimeError> {
        // Interpret the "from" part
        let from_value = self.interpret(from)?;
        
        // Interpret the "to" part, potentially using the from_value
        match &from_value {
            Value::Tensor(tensor) => {
                // Store the tensor as an input variable
                self.env.set_variable("_input", Value::Tensor(tensor.clone()));
            },
            Value::Model(model) => {
                // Store the model as the current model
                self.env.set_variable("_current_model", Value::Model(model.clone()));
            },
            _ => {}
        }
        
        // Now interpret the "to" part
        let to_value = self.interpret(to)?;
        
        // Combine the models if both are models
        if let (Value::Model(from_model), Value::Model(mut to_model)) = (from_value, to_value.clone()) {
            // Concatenate the two models
            for (name, config) in from_model.components {
                to_model.components.insert(name.clone(), config);
                // Add to the beginning of the structure
                to_model.structure.insert(0, name);
            }
            
            return Ok(Value::Model(to_model));
        }
        
        // Otherwise just return the "to" value
        Ok(to_value)
    }
    
    fn interpret_loss(&mut self, loss: &LossNode) -> Result<Value, RuntimeError> {
        // Interpret the "from" part
        let from_value = self.interpret(&loss.from)?;
        
        // Get the "to" component
        if let Some(to_component) = self.env.get_component(&loss.to) {
            // Clone to avoid borrowing issues
            let to_component_clone = to_component.clone();
            let to_value = self.interpret(&to_component_clone)?;
            
            // Placeholder for loss calculation
            println!("Loss function: {} with {}", loss.function, loss.to);
            
            // In a real implementation, you would compute the loss here
            Ok(Value::Number(0.0))
        } else {
            Err(RuntimeError::UndefinedComponent(loss.to.clone()))
        }
    }
    
    fn interpret_expression(&mut self, nodes: &[ASTNode]) -> Result<Value, RuntimeError> {
        let mut last_value = Value::Number(0.0);
        
        for node in nodes {
            last_value = self.interpret(node)?;
        }
        
        Ok(last_value)
    }
}