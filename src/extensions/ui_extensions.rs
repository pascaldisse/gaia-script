use crate::ast::{ASTNode, SymbolTable};
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub enum UIComponentType {
    Canvas,
    Panel,
    Layout,
    Button,
    Label,
}

#[derive(Debug, Clone)]
pub struct UIComponentNode {
    pub component_type: UIComponentType,
    pub dimensions: Option<(usize, usize)>,
    pub properties: HashMap<String, String>,
}

#[derive(Debug, Clone)]
pub struct EventHandlerNode {
    pub event_type: String,
    pub source: String,
    pub handler: Box<ASTNode>,
}

#[derive(Debug, Clone)]
pub struct DataBindingNode {
    pub target: String,
    pub source: String,
    pub bidirectional: bool,
}

impl From<UIComponentNode> for ASTNode {
    fn from(node: UIComponentNode) -> Self {
        ASTNode::UIComponent(node)
    }
}

impl From<EventHandlerNode> for ASTNode {
    fn from(node: EventHandlerNode) -> Self {
        ASTNode::EventHandler(node)
    }
}

impl From<DataBindingNode> for ASTNode {
    fn from(node: DataBindingNode) -> Self {
        ASTNode::DataBinding(node)
    }
}