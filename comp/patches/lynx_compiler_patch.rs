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
            ASTNode::Raw(raw) => Ok(raw.content.clone()), // Passthrough for raw content
        }
    }