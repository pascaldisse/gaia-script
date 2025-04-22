use pest::Parser;
use pest::error::Error;
use pest::iterators::{Pair, Pairs};
use pest_derive::Parser;

use crate::ast::*;

#[derive(Parser)]
#[grammar = "aopl.pest"]
pub struct AoplParser;

pub fn parse(input: &str) -> Result<ASTNode, Error<Rule>> {
    let pairs = AoplParser::parse(Rule::main, input)?;
    let mut symbol_table = SymbolTable::new();
    
    // Process the parsed pairs to construct the AST
    let ast = process_main(pairs, &mut symbol_table)?;
    
    Ok(ast)
}

fn process_main(pairs: Pairs<Rule>, symbol_table: &mut SymbolTable) -> Result<ASTNode, Error<Rule>> {
    // The main rule contains just the network_def rule
    let pair = pairs.into_iter().next().unwrap();
    match pair.as_rule() {
        Rule::main => {
            let inner = pair.into_inner().next().unwrap();
            process_network_def(inner, symbol_table)
        },
        _ => unreachable!(),
    }
}

fn process_network_def(pair: Pair<Rule>, symbol_table: &mut SymbolTable) -> Result<ASTNode, Error<Rule>> {
    let mut components = None;
    let mut body = Vec::new();
    
    for inner_pair in pair.into_inner() {
        match inner_pair.as_rule() {
            Rule::network_components => {
                components = Some(process_network_components(inner_pair));
            },
            Rule::component_def => {
                let component = process_component_def(inner_pair, symbol_table)?;
                if let ASTNode::Component(comp_node) = &component {
                    // Add component to symbol table
                    symbol_table.add_component(comp_node.id.clone(), *comp_node.expr.clone());
                }
                body.push(component);
            },
            Rule::network_expr => {
                let expr = process_network_expr(inner_pair, symbol_table)?;
                body.push(expr);
            },
            Rule::loss_expr => {
                let loss = process_loss_expr(inner_pair, symbol_table)?;
                body.push(loss);
            },
            _ => {}
        }
    }
    
    Ok(ASTNode::Network(NetworkNode { components, body }))
}

fn process_network_components(pair: Pair<Rule>) -> Vec<String> {
    let mut components = Vec::new();
    
    for inner_pair in pair.into_inner() {
        if inner_pair.as_rule() == Rule::component_id {
            components.push(inner_pair.as_str().to_string());
        }
    }
    
    components
}

fn process_component_def(pair: Pair<Rule>, symbol_table: &mut SymbolTable) -> Result<ASTNode, Error<Rule>> {
    let mut id = String::new();
    let mut expr = None;
    
    for inner_pair in pair.into_inner() {
        match inner_pair.as_rule() {
            Rule::component_id => {
                id = inner_pair.as_str().to_string();
            },
            Rule::network_expr => {
                expr = Some(process_network_expr(inner_pair, symbol_table)?);
            },
            _ => {}
        }
    }
    
    if let Some(expr_node) = expr {
        Ok(ASTNode::Component(ComponentNode {
            id,
            expr: Box::new(expr_node),
        }))
    } else {
        // This should never happen with a valid parse
        panic!("Component definition missing expression")
    }
}

fn process_network_expr(pair: Pair<Rule>, symbol_table: &mut SymbolTable) -> Result<ASTNode, Error<Rule>> {
    let mut parts = Vec::new();
    
    for inner_pair in pair.into_inner() {
        match inner_pair.as_rule() {
            Rule::input_spec => {
                parts.push(process_input_spec(inner_pair));
            },
            Rule::layer_expr => {
                parts.push(process_layer_expr(inner_pair));
            },
            Rule::block_expr => {
                parts.push(process_block_expr(inner_pair, symbol_table)?);
            },
            Rule::component_ref => {
                parts.push(process_component_ref(inner_pair, symbol_table)?);
            },
            Rule::network_expr => {
                parts.push(process_network_expr(inner_pair, symbol_table)?);
            },
            _ => {}
        }
    }
    
    // If there are multiple parts, create a data flow between them
    if parts.len() > 1 {
        let mut result = parts[0].clone();
        for i in 1..parts.len() {
            result = ASTNode::DataFlow(
                Box::new(result),
                Box::new(parts[i].clone()),
            );
        }
        Ok(result)
    } else if parts.len() == 1 {
        Ok(parts[0].clone())
    } else {
        // Empty expression - shouldn't happen with valid input
        panic!("Empty network expression")
    }
}

fn process_input_spec(pair: Pair<Rule>) -> ASTNode {
    let mut input_type = None;
    let mut params = Vec::new();
    
    for inner_pair in pair.into_inner() {
        match inner_pair.as_rule() {
            Rule::text_input => {
                input_type = Some(InputType::Text);
            },
            Rule::image_input => {
                input_type = Some(InputType::Image);
            },
            Rule::sequence_input => {
                input_type = Some(InputType::Sequence);
            },
            Rule::latent_input => {
                input_type = Some(InputType::Latent);
            },
            Rule::layer_params => {
                // Process params
                for param_pair in inner_pair.into_inner() {
                    if param_pair.as_rule() == Rule::number {
                        if let Ok(num) = param_pair.as_str().parse::<usize>() {
                            params.push(num);
                        }
                    }
                }
            },
            _ => {}
        }
    }
    
    if let Some(input_type) = input_type {
        ASTNode::Input(InputNode {
            input_type,
            params,
        })
    } else {
        // This shouldn't happen with valid input
        panic!("Input type not specified")
    }
}

fn process_layer_expr(pair: Pair<Rule>) -> ASTNode {
    let mut layer_type = None;
    let mut params = Vec::new();
    let mut activation = ActivationFunction::None;
    
    for inner_pair in pair.into_inner() {
        match inner_pair.as_rule() {
            Rule::conv_layer => {
                let mut idx = 0;
                for sub_pair in inner_pair.into_inner() {
                    if sub_pair.as_rule() == Rule::subscript {
                        if let Ok(num) = sub_pair.as_str().parse::<usize>() {
                            idx = num;
                        }
                    }
                }
                layer_type = Some(LayerType::Convolutional(idx));
            },
            Rule::dense_layer => {
                let mut idx = 0;
                for sub_pair in inner_pair.into_inner() {
                    if sub_pair.as_rule() == Rule::subscript {
                        if let Ok(num) = sub_pair.as_str().parse::<usize>() {
                            idx = num;
                        }
                    }
                }
                layer_type = Some(LayerType::Dense(idx));
            },
            Rule::pooling => {
                layer_type = Some(LayerType::Pooling);
            },
            Rule::flatten => {
                layer_type = Some(LayerType::Flatten);
            },
            Rule::upsampling => {
                layer_type = Some(LayerType::Upsampling);
            },
            Rule::lstm => {
                layer_type = Some(LayerType::LSTM);
            },
            Rule::attention_heads => {
                layer_type = Some(LayerType::AttentionHeads);
            },
            Rule::reshape => {
                layer_type = Some(LayerType::Reshape);
            },
            Rule::embedding => {
                layer_type = Some(LayerType::Embedding);
            },
            Rule::batch_size => {
                layer_type = Some(LayerType::BatchSize);
            },
            Rule::transpose_conv => {
                layer_type = Some(LayerType::TransposeConv);
            },
            Rule::attention => {
                layer_type = Some(LayerType::Attention);
            },
            Rule::layer_params => {
                // Process params and activation
                for param_pair in inner_pair.into_inner() {
                    match param_pair.as_rule() {
                        Rule::number => {
                            if let Ok(num) = param_pair.as_str().parse::<usize>() {
                                params.push(num);
                            }
                        },
                        Rule::relu => activation = ActivationFunction::ReLU,
                        Rule::sigmoid => activation = ActivationFunction::Sigmoid,
                        Rule::tanh => activation = ActivationFunction::Tanh,
                        Rule::softmax => activation = ActivationFunction::Softmax,
                        _ => {}
                    }
                }
            },
            _ => {}
        }
    }
    
    if let Some(layer_type) = layer_type {
        ASTNode::Layer(LayerNode {
            layer_type,
            params,
            activation,
        })
    } else {
        // This shouldn't happen with valid input
        panic!("Layer type not specified")
    }
}

fn process_block_expr(pair: Pair<Rule>, symbol_table: &mut SymbolTable) -> Result<ASTNode, Error<Rule>> {
    let mut content = None;
    let mut repetitions = 1;
    
    for inner_pair in pair.into_inner() {
        match inner_pair.as_rule() {
            Rule::network_expr => {
                content = Some(process_network_expr(inner_pair, symbol_table)?);
            },
            Rule::repetition => {
                let num_str = inner_pair.into_inner().next().unwrap().as_str();
                if let Ok(num) = num_str.parse::<usize>() {
                    repetitions = num;
                }
            },
            _ => {}
        }
    }
    
    if let Some(content_node) = content {
        Ok(ASTNode::Block(BlockNode {
            content: Box::new(content_node),
            repetitions,
        }))
    } else {
        // This shouldn't happen with valid input
        panic!("Block missing content")
    }
}

fn process_component_ref(pair: Pair<Rule>, symbol_table: &mut SymbolTable) -> Result<ASTNode, Error<Rule>> {
    let component_id = pair.into_inner().next().unwrap().as_str();
    
    // Look up component in symbol table
    if let Some(component) = symbol_table.get_component(component_id) {
        Ok(component.clone())
    } else {
        // Component not found - create placeholder
        // In a real implementation, you might want to report an error
        Ok(ASTNode::Expression(vec![]))
    }
}

fn process_loss_expr(pair: Pair<Rule>, symbol_table: &mut SymbolTable) -> Result<ASTNode, Error<Rule>> {
    let mut from = None;
    let mut to = String::new();
    let mut function = String::new();
    
    let inner_pairs: Vec<Pair<Rule>> = pair.into_inner().collect();
    
    // First is the network expression
    if !inner_pairs.is_empty() {
        from = Some(process_network_expr(inner_pairs[0].clone(), symbol_table)?);
    }
    
    // Second is the component ID
    if inner_pairs.len() > 1 {
        to = inner_pairs[1].as_str().to_string();
    }
    
    // Third is the loss function
    if inner_pairs.len() > 2 {
        function = inner_pairs[2].as_str().to_string();
    }
    
    if let Some(from_node) = from {
        Ok(ASTNode::Loss(LossNode {
            from: Box::new(from_node),
            to,
            function,
        }))
    } else {
        // This shouldn't happen with valid input
        panic!("Loss expression missing source")
    }
}