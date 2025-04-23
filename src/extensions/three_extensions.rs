use crate::ast::ASTNode;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub enum ThreeDComponentType {
    World3D,
    Camera,
    Renderer,
    Light,
    Mesh,
    Texture,
    Material,
    Shader,
    Scene,
    Skybox,
}

#[derive(Debug, Clone)]
pub struct ThreeDComponentNode {
    pub component_type: ThreeDComponentType,
    pub params: HashMap<String, String>,
}

#[derive(Debug, Clone)]
pub struct AssetNode {
    pub path: String,
    pub asset_type: String,
}

impl From<ThreeDComponentNode> for ASTNode {
    fn from(node: ThreeDComponentNode) -> Self {
        ASTNode::ThreeDComponent(node)
    }
}

impl From<AssetNode> for ASTNode {
    fn from(node: AssetNode) -> Self {
        ASTNode::Asset(node)
    }
}