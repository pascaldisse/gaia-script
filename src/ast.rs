use std::collections::HashMap;
use std::fmt;

// AST Node types for the AOPL language
#[derive(Debug, Clone)]
pub enum ASTNode {
    Network(NetworkNode),
    Component(ComponentNode),
    Layer(LayerNode),
    Block(BlockNode),
    Input(InputNode),
    DataFlow(Box<ASTNode>, Box<ASTNode>),
    Loss(LossNode),
    Expression(Vec<ASTNode>),
    // Extended UI components
    UIComponent(crate::extensions::ui_extensions::UIComponentNode),
    EventHandler(crate::extensions::ui_extensions::EventHandlerNode),
    DataBinding(crate::extensions::ui_extensions::DataBindingNode),
    // Extended 3D components
    ThreeDComponent(crate::extensions::three_extensions::ThreeDComponentNode),
    Asset(crate::extensions::three_extensions::AssetNode),
}

impl fmt::Display for ASTNode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ASTNode::Network(net) => write!(f, "{}", net),
            ASTNode::Component(comp) => write!(f, "{}", comp),
            ASTNode::Layer(layer) => write!(f, "{}", layer),
            ASTNode::Block(block) => write!(f, "{}", block),
            ASTNode::Input(input) => write!(f, "{}", input),
            ASTNode::DataFlow(from, to) => write!(f, "{} → {}", from, to),
            ASTNode::Loss(loss) => write!(f, "{}", loss),
            ASTNode::Expression(nodes) => {
                for (i, node) in nodes.iter().enumerate() {
                    if i > 0 {
                        write!(f, " ")?;
                    }
                    write!(f, "{}", node)?;
                }
                Ok(())
            },
            ASTNode::UIComponent(_) => write!(f, "UIComponent"),
            ASTNode::EventHandler(_) => write!(f, "EventHandler"),
            ASTNode::DataBinding(_) => write!(f, "DataBinding"),
            ASTNode::ThreeDComponent(_) => write!(f, "ThreeDComponent"),
            ASTNode::Asset(_) => write!(f, "Asset")
        }
    }
}

#[derive(Debug, Clone)]
pub struct NetworkNode {
    pub components: Option<Vec<String>>,
    pub body: Vec<ASTNode>,
}

impl fmt::Display for NetworkNode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "N")?;
        if let Some(components) = &self.components {
            write!(f, "〈")?;
            for (i, comp) in components.iter().enumerate() {
                if i > 0 {
                    write!(f, "⊕")?;
                }
                write!(f, "{}", comp)?;
            }
            write!(f, "〉")?;
        }
        for node in &self.body {
            write!(f, "\n{}", node)?;
        }
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct ComponentNode {
    pub id: String,
    pub expr: Box<ASTNode>,
}

impl fmt::Display for ComponentNode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.id, self.expr)
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum ActivationFunction {
    ReLU,
    Sigmoid,
    Tanh,
    Softmax,
    None,
}

#[derive(Debug, Clone)]
pub enum LayerType {
    Convolutional(usize),
    Dense(usize),
    Pooling,
    Flatten,
    Upsampling,
    LSTM,
    AttentionHeads,
    Reshape,
    Embedding,
    BatchSize,
    TransposeConv,
    Attention,
}

#[derive(Debug, Clone)]
pub struct LayerNode {
    pub layer_type: LayerType,
    pub params: Vec<usize>,
    pub activation: ActivationFunction,
}

impl fmt::Display for LayerNode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match &self.layer_type {
            LayerType::Convolutional(idx) => write!(f, "C₁")?,
            LayerType::Dense(idx) => write!(f, "D₁")?,
            LayerType::Pooling => write!(f, "P")?,
            LayerType::Flatten => write!(f, "F")?,
            LayerType::Upsampling => write!(f, "U")?,
            LayerType::LSTM => write!(f, "L")?,
            LayerType::AttentionHeads => write!(f, "H")?,
            LayerType::Reshape => write!(f, "R")?,
            LayerType::Embedding => write!(f, "E")?,
            LayerType::BatchSize => write!(f, "B")?,
            LayerType::TransposeConv => write!(f, "T")?,
            LayerType::Attention => write!(f, "A")?,
        }
        for param in &self.params {
            write!(f, " {}", param)?;
        }
        match self.activation {
            ActivationFunction::ReLU => write!(f, " ρ")?,
            ActivationFunction::Sigmoid => write!(f, " σ")?,
            ActivationFunction::Tanh => write!(f, " τ")?,
            ActivationFunction::Softmax => write!(f, " S")?,
            ActivationFunction::None => {}
        }
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct BlockNode {
    pub content: Box<ASTNode>,
    pub repetitions: usize,
}

impl fmt::Display for BlockNode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "[{}]×{}", self.content, self.repetitions)
    }
}

#[derive(Debug, Clone)]
pub enum InputType {
    Text,
    Image,
    Sequence,
    Latent,
}

#[derive(Debug, Clone)]
pub struct InputNode {
    pub input_type: InputType,
    pub params: Vec<usize>,
}

impl fmt::Display for InputNode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self.input_type {
            InputType::Text => write!(f, "T")?,
            InputType::Image => write!(f, "I")?,
            InputType::Sequence => write!(f, "S")?,
            InputType::Latent => write!(f, "Z")?,
        }
        for param in &self.params {
            write!(f, " {}", param)?;
        }
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct LossNode {
    pub from: Box<ASTNode>,
    pub to: String,
    pub function: String,
}

impl fmt::Display for LossNode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}⊳{}⟿{}", self.from, self.to, self.function)
    }
}

// Symbol table for resolving components
#[derive(Debug, Default)]
pub struct SymbolTable {
    pub components: HashMap<String, ASTNode>,
}

impl SymbolTable {
    pub fn new() -> Self {
        SymbolTable {
            components: HashMap::new(),
        }
    }

    pub fn add_component(&mut self, name: String, node: ASTNode) {
        self.components.insert(name, node);
    }

    pub fn get_component(&self, name: &str) -> Option<&ASTNode> {
        self.components.get(name)
    }
}