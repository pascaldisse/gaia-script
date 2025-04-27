use crate::ast::{ASTNode, LayerType, NetworkNode};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::process::Command;

/// MacOSCompiler - Compiles GaiaScript directly to native macOS applications
/// using Swift, AppKit/SwiftUI, and direct integration with Apple Developer APIs
pub struct MacOSCompiler {
    output_code: String,
    ui_components: Vec<String>,
    model_implementations: Vec<String>,
    imports: Vec<String>,
    state_variables: HashMap<String, String>,
    event_handlers: Vec<String>,
    indentation_level: usize,
}

impl MacOSCompiler {
    pub fn new() -> Self {
        let mut imports = Vec::new();
        // Core imports required for macOS applications
        imports.push("import Foundation".to_string());
        imports.push("import AppKit".to_string());
        imports.push("import SwiftUI".to_string());
        
        MacOSCompiler {
            output_code: String::new(),
            ui_components: Vec::new(),
            model_implementations: Vec::new(),
            imports,
            state_variables: HashMap::new(),
            event_handlers: Vec::new(),
            indentation_level: 0,
        }
    }
    
    /// Main compilation entry point
    pub fn compile(&mut self, ast: &ASTNode) -> Result<String, String> {
        // Reset state for new compilation
        self.output_code = String::new();
        self.ui_components.clear();
        self.model_implementations.clear();
        self.state_variables.clear();
        self.event_handlers.clear();
        
        // Generate Swift code from AST
        match ast {
            ASTNode::Model(model) => self.compile_model(model)?,
            ASTNode::Network(network) => self.compile_network(network)?,
            ASTNode::UI(ui) => self.compile_ui(ui)?,
            ASTNode::Statement(stmt) => self.compile_statement(stmt)?,
            _ => return Err(format!("Unsupported root AST node type: {:?}", ast)),
        }
        
        // Assemble the final application
        self.assemble_application()
    }
    
    /// Compile a model node to Swift code
    fn compile_model(&mut self, model: &ModelNode) -> Result<(), String> {
        let mut model_code = String::new();
        
        // Start model class definition
        model_code.push_str(&format!("class {} {{\n", self.swift_class_name(&model.name)));
        
        // Add model properties for each layer
        for layer in &model.layers {
            match &layer.layer_type {
                LayerType::Dense(idx) => {
                    model_code.push_str(&format!("    // Dense layer {}\n", idx));
                    model_code.push_str("    var weights: [Float] = []\n");
                    model_code.push_str("    var biases: [Float] = []\n");
                }
                LayerType::Convolutional(idx) => {
                    model_code.push_str(&format!("    // Convolutional layer {}\n", idx));
                    model_code.push_str("    var filters: [[[[Float]]]] = []\n");
                    model_code.push_str("    var biases: [Float] = []\n");
                }
                LayerType::Input => {
                    model_code.push_str("    // Input layer\n");
                    model_code.push_str("    var inputShape: [Int] = []\n");
                }
                LayerType::Output => {
                    model_code.push_str("    // Output layer\n");
                    model_code.push_str("    var outputSize: Int = 0\n");
                }
                _ => {
                    model_code.push_str(&format!("    // Layer: {:?}\n", layer.layer_type));
                }
            }
        }
        
        // Add forward method
        model_code.push_str("\n    func forward(_ input: [Float]) -> [Float] {\n");
        model_code.push_str("        // Implement the forward pass through the model\n");
        model_code.push_str("        // This is a placeholder implementation\n");
        model_code.push_str("        return input\n");
        model_code.push_str("    }\n");
        
        // Close class definition
        model_code.push_str("}\n");
        
        // Add to model implementations
        self.model_implementations.push(model_code);
        
        Ok(())
    }
    
    /// Compile a network node to Swift code
    fn compile_network(&mut self, network: &NetworkNode) -> Result<(), String> {
        let mut network_code = String::new();
        
        // Start network class definition
        network_code.push_str(&format!("class {} {{\n", self.swift_class_name(&network.name)));
        
        // Add references to contained models
        for model_ref in &network.models {
            network_code.push_str(&format!("    let {}: {}\n", 
                self.swift_variable_name(&model_ref.name),
                self.swift_class_name(&model_ref.name)));
        }
        
        // Add initializer
        network_code.push_str("\n    init() {\n");
        for model_ref in &network.models {
            network_code.push_str(&format!("        {} = {}()\n", 
                self.swift_variable_name(&model_ref.name),
                self.swift_class_name(&model_ref.name)));
        }
        network_code.push_str("    }\n");
        
        // Add forward method
        network_code.push_str("\n    func process(_ input: [Float]) -> [Float] {\n");
        network_code.push_str("        // Example network processing logic\n");
        network_code.push_str("        // This is a placeholder implementation\n");
        
        if !network.models.is_empty() {
            network_code.push_str(&format!("        return {}.forward(input)\n", 
                self.swift_variable_name(&network.models[0].name)));
        } else {
            network_code.push_str("        return input\n");
        }
        
        network_code.push_str("    }\n");
        
        // Close class definition
        network_code.push_str("}\n");
        
        // Add to model implementations
        self.model_implementations.push(network_code);
        
        Ok(())
    }
    
    /// Compile a UI node to Swift code using SwiftUI and AppKit
    fn compile_ui(&mut self, ui: &UINode) -> Result<(), String> {
        // Create a SwiftUI view struct
        let mut ui_code = String::new();
        
        // Add needed imports
        if !self.imports.contains(&"import SwiftUI".to_string()) {
            self.imports.push("import SwiftUI".to_string());
        }
        
        // Start view struct definition
        ui_code.push_str(&format!("struct {}View: View {{\n", self.swift_class_name(&ui.name)));
        
        // Add state properties
        for (key, value) in &ui.properties {
            let swift_type = self.value_to_swift_type(value);
            let default_value = self.value_to_swift_string(value);
            ui_code.push_str(&format!("    @State private var {}: {} = {}\n", 
                self.swift_variable_name(key), 
                swift_type,
                default_value));
            
            // Store state variables for later use
            self.state_variables.insert(key.clone(), swift_type.clone());
        }
        
        // Add body implementation
        ui_code.push_str("\n    var body: some View {\n");
        self.indentation_level = 2;
        
        // Implement UI components from children
        if let Some(children) = &ui.children {
            if !children.is_empty() {
                ui_code.push_str("        VStack {\n");
                self.indentation_level = 3;
                
                for (i, child) in children.iter().enumerate() {
                    let component_code = self.compile_ui_component(child, i)?;
                    ui_code.push_str(&component_code);
                }
                
                self.indentation_level = 2;
                ui_code.push_str("        }\n");
            } else {
                ui_code.push_str("        Text(\"Empty View\")\n");
            }
        } else {
            ui_code.push_str("        Text(\"No content\")\n");
        }
        
        // Close body implementation
        ui_code.push_str("    }\n");
        
        // Add methods and event handlers
        for handler in &self.event_handlers {
            ui_code.push_str(handler);
        }
        
        // Close view struct
        ui_code.push_str("}\n");
        
        // Add app main struct
        ui_code.push_str("\n@main\n");
        ui_code.push_str(&format!("struct {}App: App {{\n", self.swift_class_name(&ui.name)));
        ui_code.push_str("    var body: some Scene {\n");
        ui_code.push_str("        WindowGroup {\n");
        ui_code.push_str(&format!("            {}View()\n", self.swift_class_name(&ui.name)));
        ui_code.push_str("        }\n");
        ui_code.push_str("    }\n");
        ui_code.push_str("}\n");
        
        // Add preview provider for SwiftUI previews
        ui_code.push_str("\n#if DEBUG\n");
        ui_code.push_str("struct PreviewProvider: PreviewProvider {\n");
        ui_code.push_str("    static var previews: some View {\n");
        ui_code.push_str(&format!("        {}View()\n", self.swift_class_name(&ui.name)));
        ui_code.push_str("    }\n");
        ui_code.push_str("}\n");
        ui_code.push_str("#endif\n");
        
        // Add to UI components
        self.ui_components.push(ui_code);
        
        Ok(())
    }
    
    /// Compile a UI component node
    fn compile_ui_component(&mut self, node: &ASTNode, index: usize) -> Result<String, String> {
        let indent = "    ".repeat(self.indentation_level);
        let mut component_code = String::new();
        
        match node {
            ASTNode::Value(value) => {
                // Simple value rendering (e.g., text)
                match value {
                    Value::String(s) => {
                        component_code.push_str(&format!("{}Text(\"{}\"),\n", indent, s));
                    },
                    _ => {
                        component_code.push_str(&format!("{}Text(\"{}\")\n", indent, self.value_to_swift_string(value)));
                    }
                }
            },
            ASTNode::UIElement(element) => {
                // Handle UI elements based on their type
                match element.element_type.as_str() {
                    "button" => {
                        let button_text = element.properties.get("text")
                            .map(|v| self.value_to_swift_string(v))
                            .unwrap_or("\"Button\"".to_string());
                        
                        component_code.push_str(&format!("{}Button(action: {{\n", indent));
                        component_code.push_str(&format!("{}    // Button action here\n", indent));
                        
                        // Check for action/onClick handler
                        if let Some(action) = element.properties.get("onClick") {
                            if let Value::FunctionCall(func_name, _) = action {
                                component_code.push_str(&format!("{}    {}()\n", indent, self.swift_variable_name(func_name)));
                            }
                        }
                        
                        component_code.push_str(&format!("{}}}) {{\n", indent));
                        component_code.push_str(&format!("{}    Text({})\n", indent, button_text));
                        component_code.push_str(&format!("{}}}\n", indent));
                        
                        // Add style modifiers if present
                        if let Some(Value::Object(style)) = element.properties.get("style") {
                            if let Some(Value::String(color)) = style.get("backgroundColor") {
                                component_code.push_str(&format!("{}.background(Color(\"{}\"))\n", indent, color));
                            }
                            if let Some(Value::Integer(radius)) = style.get("borderRadius") {
                                component_code.push_str(&format!("{}.cornerRadius({})\n", indent, radius));
                            }
                        }
                    },
                    "text" | "label" => {
                        let text = element.properties.get("text")
                            .map(|v| self.value_to_swift_string(v))
                            .unwrap_or("\"Text\"".to_string());
                        
                        component_code.push_str(&format!("{}Text({})\n", indent, text));
                        
                        // Add style modifiers if present
                        if let Some(Value::Object(style)) = element.properties.get("style") {
                            if let Some(Value::String(color)) = style.get("color") {
                                component_code.push_str(&format!("{}.foregroundColor(Color(\"{}\"))\n", indent, color));
                            }
                            if let Some(Value::Integer(size)) = style.get("fontSize") {
                                component_code.push_str(&format!("{}.font(.system(size: {}))\n", indent, size));
                            }
                        }
                    },
                    "input" | "textField" => {
                        let placeholder = element.properties.get("placeholder")
                            .map(|v| self.value_to_swift_string(v))
                            .unwrap_or("\"Enter text...\"".to_string());
                        
                        let binding_var = if let Some(Value::Variable(var_name)) = element.properties.get("value") {
                            self.swift_variable_name(var_name)
                        } else {
                            format!("inputValue{}", index)
                        };
                        
                        component_code.push_str(&format!("{}TextField({}, text: ${{{}}}))\n", indent, placeholder, binding_var));
                        
                        // Add style modifiers
                        component_code.push_str(&format!("{}.textFieldStyle(RoundedBorderTextFieldStyle())\n", indent));
                    },
                    "image" => {
                        let src = element.properties.get("src")
                            .map(|v| self.value_to_swift_string(v))
                            .unwrap_or("\"placeholder\"".to_string());
                        
                        component_code.push_str(&format!("{}Image({})\n", indent, src));
                        component_code.push_str(&format!("{}.resizable()\n", indent));
                        component_code.push_str(&format!("{}.scaledToFit()\n", indent));
                    },
                    "container" | "div" | "view" => {
                        // Container/stack implementation
                        component_code.push_str(&format!("{}VStack {{\n", indent));
                        self.indentation_level += 1;
                        
                        if let Some(children) = &element.children {
                            for (i, child) in children.iter().enumerate() {
                                let child_code = self.compile_ui_component(child, i)?;
                                component_code.push_str(&child_code);
                            }
                        }
                        
                        self.indentation_level -= 1;
                        component_code.push_str(&format!("{}}}\n", indent));
                        
                        // Apply styling
                        if let Some(Value::Object(style)) = element.properties.get("style") {
                            if let Some(Value::String(color)) = style.get("backgroundColor") {
                                component_code.push_str(&format!("{}.background(Color(\"{}\"))\n", indent, color));
                            }
                            if let Some(Value::Integer(padding)) = style.get("padding") {
                                component_code.push_str(&format!("{}.padding({})\n", indent, padding));
                            }
                        }
                    },
                    _ => {
                        // Default fallback
                        component_code.push_str(&format!("{}Text(\"Unsupported component: {}\")\n", indent, element.element_type));
                    }
                }
            },
            ASTNode::Statement(stmt) => {
                // For statements within UI, we likely need to create a handler or computed property
                match stmt {
                    Statement::FunctionDefinition(name, params, body) => {
                        // Create a function
                        let func_name = self.swift_variable_name(name);
                        let mut handler_code = String::new();
                        
                        handler_code.push_str(&format!("\n    func {}({}) {{\n", func_name, 
                            params.iter().map(|p| format!("{}: Any", self.swift_variable_name(p))).collect::<Vec<_>>().join(", ")));
                        
                        // Implement function body
                        handler_code.push_str("        // Function implementation\n");
                        for statement in body {
                            handler_code.push_str(&format!("        // Statement: {:?}\n", statement));
                            // Add actual statement implementation here
                        }
                        
                        handler_code.push_str("    }\n");
                        
                        // Add to event handlers
                        self.event_handlers.push(handler_code);
                        
                        // Just a placeholder in the actual UI code
                        component_code.push_str(&format!("{}// Function: {}\n", indent, name));
                    },
                    _ => {
                        component_code.push_str(&format!("{}// Unsupported statement in UI: {:?}\n", indent, stmt));
                    }
                }
            },
            _ => {
                component_code.push_str(&format!("{}// Unsupported node type in UI: {:?}\n", indent, node));
            }
        }
        
        Ok(component_code)
    }
    
    /// Compile a statement node to Swift code
    fn compile_statement(&mut self, stmt: &Statement) -> Result<(), String> {
        match stmt {
            Statement::VariableDeclaration(name, expr) => {
                // Determine Swift type
                let swift_type = match expr {
                    ASTNode::Value(value) => self.value_to_swift_type(value),
                    _ => "Any".to_string(),
                };
                
                // Add variable to state variables
                self.state_variables.insert(name.clone(), swift_type);
                
                Ok(())
            },
            Statement::FunctionDefinition(name, params, body) => {
                // Add function implementation to models
                let mut func_code = String::new();
                
                func_code.push_str(&format!("func {}({}) {{\n", 
                    self.swift_variable_name(name),
                    params.iter().map(|p| format!("{}: Any", self.swift_variable_name(p))).collect::<Vec<_>>().join(", ")));
                
                // Implement function body
                for statement in body {
                    func_code.push_str(&format!("    // Statement: {:?}\n", statement));
                    // Add actual statement implementation here
                }
                
                func_code.push_str("}\n");
                
                // Add to model implementations
                self.model_implementations.push(func_code);
                
                Ok(())
            },
            _ => {
                // Other statement types
                Ok(())
            }
        }
    }
    
    /// Assemble the final application combining all components
    fn assemble_application(&self) -> Result<String, String> {
        let mut app_code = String::new();
        
        // Add imports
        for import in &self.imports {
            app_code.push_str(&format!("{}\n", import));
        }
        app_code.push_str("\n");
        
        // Add model implementations
        for model in &self.model_implementations {
            app_code.push_str(model);
            app_code.push_str("\n");
        }
        
        // Add UI components
        for component in &self.ui_components {
            app_code.push_str(component);
            app_code.push_str("\n");
        }
        
        Ok(app_code)
    }
    
    /// Generate Xcode project structure
    pub fn generate_xcode_project(&self, app_name: &str, output_dir: &str) -> Result<(), String> {
        // Create project directory
        let project_dir = Path::new(output_dir).join(app_name);
        if !project_dir.exists() {
            fs::create_dir_all(&project_dir).map_err(|e| format!("Failed to create project directory: {}", e))?;
        }
        
        // Create main Swift file
        let swift_path = project_dir.join("main.swift");
        fs::write(&swift_path, &self.output_code).map_err(|e| format!("Failed to write Swift file: {}", e))?;
        
        // Create project structure
        let sources_dir = project_dir.join("Sources");
        if !sources_dir.exists() {
            fs::create_dir_all(&sources_dir).map_err(|e| format!("Failed to create Sources directory: {}", e))?;
        }
        
        // Create a basic Info.plist file
        let info_plist = format!(r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>{}</string>
    <key>CFBundleIdentifier</key>
    <string>com.gaiascript.{}</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleExecutable</key>
    <string>{}</string>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>NSHumanReadableCopyright</key>
    <string>Copyright © 2025 GaiaScript. All rights reserved.</string>
    <key>NSPrincipalClass</key>
    <string>NSApplication</string>
    <key>NSMainStoryboardFile</key>
    <string>Main</string>
</dict>
</plist>"#, app_name, app_name.to_lowercase(), app_name);
        
        let info_plist_path = project_dir.join("Info.plist");
        fs::write(&info_plist_path, info_plist).map_err(|e| format!("Failed to write Info.plist: {}", e))?;
        
        // Create a simple build script
        let build_script = format!(r#"#!/bin/sh
# Build script for {} macOS app

swiftc -o {} main.swift -framework AppKit -framework Foundation -framework SwiftUI
"#, app_name, app_name);
        
        let build_script_path = project_dir.join("build.sh");
        fs::write(&build_script_path, build_script).map_err(|e| format!("Failed to write build script: {}", e))?;
        
        // Make the build script executable
        Command::new("chmod")
            .arg("+x")
            .arg(build_script_path)
            .output()
            .map_err(|e| format!("Failed to make build script executable: {}", e))?;
        
        // Return success
        Ok(())
    }
    
    /// Compile and build a native macOS application
    pub fn build_app(&self, app_name: &str, output_dir: &str) -> Result<(), String> {
        // First generate the Xcode project
        self.generate_xcode_project(app_name, output_dir)?;
        
        // Then run the build script
        let project_dir = Path::new(output_dir).join(app_name);
        let build_output = Command::new("./build.sh")
            .current_dir(&project_dir)
            .output()
            .map_err(|e| format!("Failed to run build script: {}", e))?;
        
        if !build_output.status.success() {
            let error = String::from_utf8_lossy(&build_output.stderr);
            return Err(format!("Build failed: {}", error));
        }
        
        println!("Successfully built {} at {}", app_name, project_dir.display());
        
        // Return success
        Ok(())
    }
    
    /// Convert a GaiaScript name to a Swift class name (PascalCase)
    fn swift_class_name(&self, name: &str) -> String {
        let mut class_name = String::new();
        let mut capitalize_next = true;
        
        for c in name.chars() {
            if !c.is_alphanumeric() {
                capitalize_next = true;
                continue;
            }
            
            if capitalize_next {
                class_name.push(c.to_ascii_uppercase());
                capitalize_next = false;
            } else {
                class_name.push(c);
            }
        }
        
        // Ensure the class name starts with an uppercase letter
        if !class_name.is_empty() && !class_name.chars().next().unwrap().is_uppercase() {
            class_name = format!("{}{}", 
                class_name.chars().next().unwrap().to_ascii_uppercase(),
                &class_name[1..]);
        }
        
        // If the class name is empty, use a default
        if class_name.is_empty() {
            class_name = "GaiaModel".to_string();
        }
        
        class_name
    }
    
    /// Convert a GaiaScript name to a Swift variable name (camelCase)
    fn swift_variable_name(&self, name: &str) -> String {
        let class_name = self.swift_class_name(name);
        
        // Convert to camelCase (first letter lowercase)
        if !class_name.is_empty() {
            format!("{}{}", 
                class_name.chars().next().unwrap().to_ascii_lowercase(),
                &class_name[1..])
        } else {
            "gaiaVariable".to_string()
        }
    }
    
    /// Convert a GaiaScript value to a Swift type
    fn value_to_swift_type(&self, value: &Value) -> String {
        match value {
            Value::Integer(_) => "Int".to_string(),
            Value::Float(_) => "Double".to_string(),
            Value::Boolean(_) => "Bool".to_string(),
            Value::String(_) => "String".to_string(),
            Value::Array(_) => "[Any]".to_string(),
            Value::Object(_) => "[String: Any]".to_string(),
            _ => "Any".to_string(),
        }
    }
    
    /// Convert a GaiaScript value to a Swift literal value
    fn value_to_swift_string(&self, value: &Value) -> String {
        match value {
            Value::Integer(i) => i.to_string(),
            Value::Float(f) => f.to_string(),
            Value::Boolean(b) => if *b { "true".to_string() } else { "false".to_string() },
            Value::String(s) => format!("\"{}\"", s.replace("\"", "\\\"")),
            Value::Array(arr) => {
                format!("[{}]", arr.iter()
                    .map(|v| self.value_to_swift_string(v))
                    .collect::<Vec<_>>()
                    .join(", "))
            },
            Value::Object(obj) => {
                format!("[{}]", obj.iter()
                    .map(|(k, v)| format!("\"{}\": {}", k, self.value_to_swift_string(v)))
                    .collect::<Vec<_>>()
                    .join(", "))
            },
            _ => "nil".to_string(),
        }
    }
}