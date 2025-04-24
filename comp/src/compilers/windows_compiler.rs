use crate::ast::{ASTNode, LayerType, NetworkNode};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::process::Command;

/// WindowsCompiler - Compiles GaiaScript directly to native Windows applications
/// using C# and WPF for the UI implementation
pub struct WindowsCompiler {
    pub output_code: String,
    ui_components: Vec<String>,
    model_implementations: Vec<String>,
    imports: Vec<String>,
    state_variables: HashMap<String, String>,
    event_handlers: Vec<String>,
    indentation_level: usize,
}

impl WindowsCompiler {
    pub fn new() -> Self {
        let mut imports = Vec::new();
        // Core imports required for Windows applications
        imports.push("using System;".to_string());
        imports.push("using System.Windows;".to_string());
        imports.push("using System.Windows.Controls;".to_string());
        imports.push("using System.Windows.Media;".to_string());
        
        WindowsCompiler {
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
        
        // Generate C# code from AST
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
    
    /// Compile a model node to C# code
    fn compile_model(&mut self, model: &ModelNode) -> Result<(), String> {
        let mut model_code = String::new();
        
        // Start model class definition
        model_code.push_str(&format!("public class {} {{\n", self.csharp_class_name(&model.name)));
        
        // Add model properties for each layer
        for layer in &model.layers {
            match &layer.layer_type {
                LayerType::Dense(idx) => {
                    model_code.push_str(&format!("    // Dense layer {}\n", idx));
                    model_code.push_str("    public float[] Weights { get; set; } = new float[0];\n");
                    model_code.push_str("    public float[] Biases { get; set; } = new float[0];\n");
                }
                LayerType::Convolutional(idx) => {
                    model_code.push_str(&format!("    // Convolutional layer {}\n", idx));
                    model_code.push_str("    public float[][][][] Filters { get; set; } = new float[0][][][];\n");
                    model_code.push_str("    public float[] Biases { get; set; } = new float[0];\n");
                }
                LayerType::Input => {
                    model_code.push_str("    // Input layer\n");
                    model_code.push_str("    public int[] InputShape { get; set; } = new int[0];\n");
                }
                LayerType::Output => {
                    model_code.push_str("    // Output layer\n");
                    model_code.push_str("    public int OutputSize { get; set; } = 0;\n");
                }
                _ => {
                    model_code.push_str(&format!("    // Layer: {:?}\n", layer.layer_type));
                }
            }
        }
        
        // Add forward method
        model_code.push_str("\n    public float[] Forward(float[] input) {\n");
        model_code.push_str("        // Implement the forward pass through the model\n");
        model_code.push_str("        // This is a placeholder implementation\n");
        model_code.push_str("        return input;\n");
        model_code.push_str("    }\n");
        
        // Close class definition
        model_code.push_str("}\n");
        
        // Add to model implementations
        self.model_implementations.push(model_code);
        
        Ok(())
    }
    
    /// Compile a network node to C# code
    fn compile_network(&mut self, network: &NetworkNode) -> Result<(), String> {
        let mut network_code = String::new();
        
        // Start network class definition
        network_code.push_str(&format!("public class {} {{\n", self.csharp_class_name(&network.name)));
        
        // Add references to contained models
        for model_ref in &network.models {
            network_code.push_str(&format!("    private readonly {} {} = new {}();\n", 
                self.csharp_class_name(&model_ref.name),
                self.csharp_variable_name(&model_ref.name),
                self.csharp_class_name(&model_ref.name)));
        }
        
        // Add processing method
        network_code.push_str("\n    public float[] Process(float[] input) {\n");
        network_code.push_str("        // Example network processing logic\n");
        network_code.push_str("        // This is a placeholder implementation\n");
        
        if !network.models.is_empty() {
            network_code.push_str(&format!("        return {}.Forward(input);\n", 
                self.csharp_variable_name(&network.models[0].name)));
        } else {
            network_code.push_str("        return input;\n");
        }
        
        network_code.push_str("    }\n");
        
        // Close class definition
        network_code.push_str("}\n");
        
        // Add to model implementations
        self.model_implementations.push(network_code);
        
        Ok(())
    }
    
    /// Compile a UI node to C# code using WPF
    fn compile_ui(&mut self, ui: &UINode) -> Result<(), String> {
        // Create the main WPF application class
        let mut ui_code = String::new();
        
        // Add main application class
        ui_code.push_str(&format!("public class {}App : Application {{\n", self.csharp_class_name(&ui.name)));
        ui_code.push_str("    protected override void OnStartup(StartupEventArgs e) {\n");
        ui_code.push_str("        base.OnStartup(e);\n");
        ui_code.push_str(&format!("        var mainWindow = new {}Window();\n", self.csharp_class_name(&ui.name)));
        ui_code.push_str("        mainWindow.Show();\n");
        ui_code.push_str("    }\n");
        ui_code.push_str("\n");
        ui_code.push_str("    [STAThread]\n");
        ui_code.push_str("    public static void Main() {\n");
        ui_code.push_str(&format!("        var app = new {}App();\n", self.csharp_class_name(&ui.name)));
        ui_code.push_str("        app.Run();\n");
        ui_code.push_str("    }\n");
        ui_code.push_str("}\n");
        
        // Add main window class
        ui_code.push_str("\n");
        ui_code.push_str(&format!("public class {}Window : Window {{\n", self.csharp_class_name(&ui.name)));
        
        // Add properties for state variables
        for (key, value) in &ui.properties {
            let csharp_type = self.value_to_csharp_type(value);
            let default_value = self.value_to_csharp_string(value);
            ui_code.push_str(&format!("    public {} {} {{ get; set; }} = {};\n", 
                csharp_type, 
                self.csharp_property_name(key), 
                default_value));
            
            // Store state variables for later use
            self.state_variables.insert(key.clone(), csharp_type.clone());
        }
        
        // Add constructor
        ui_code.push_str("\n    public {}Window() {{\n", self.csharp_class_name(&ui.name));
        ui_code.push_str("        Title = \"GaiaScript Windows Application\";\n");
        ui_code.push_str("        Width = 800;\n");
        ui_code.push_str("        Height = 600;\n");
        ui_code.push_str("        WindowStartupLocation = WindowStartupLocation.CenterScreen;\n");
        ui_code.push_str("\n");
        ui_code.push_str("        // Set up the main layout\n");
        ui_code.push_str("        var mainGrid = new Grid();\n");
        ui_code.push_str("        Content = mainGrid;\n");
        ui_code.push_str("\n");
        ui_code.push_str("        var mainStackPanel = new StackPanel();\n");
        ui_code.push_str("        mainGrid.Children.Add(mainStackPanel);\n");
        
        // Add UI components
        if let Some(children) = &ui.children {
            for (idx, child) in children.iter().enumerate() {
                self.compile_wpf_component(&mut ui_code, child, &format!("mainStackPanel"), idx)?;
            }
        }
        
        ui_code.push_str("    }\n");
        
        // Add event handlers
        for handler in &self.event_handlers {
            ui_code.push_str(handler);
        }
        
        // Close window class
        ui_code.push_str("}\n");
        
        // Add to UI components
        self.ui_components.push(ui_code);
        
        Ok(())
    }
    
    /// Compile a UI component to WPF
    fn compile_wpf_component(&mut self, ui_code: &mut String, node: &ASTNode, parent: &str, index: usize) -> Result<(), String> {
        match node {
            ASTNode::Value(value) => {
                // Simple value rendering (e.g., text)
                match value {
                    Value::String(s) => {
                        ui_code.push_str(&format!("        var text{} = new TextBlock();\n", index));
                        ui_code.push_str(&format!("        text{}.Text = \"{}\";\n", index, s));
                        ui_code.push_str(&format!("        {}.Children.Add(text{});\n\n", parent, index));
                    },
                    _ => {
                        ui_code.push_str(&format!("        var text{} = new TextBlock();\n", index));
                        ui_code.push_str(&format!("        text{}.Text = \"{}\";\n", index, self.value_to_csharp_string(value)));
                        ui_code.push_str(&format!("        {}.Children.Add(text{});\n\n", parent, index));
                    }
                }
            },
            ASTNode::UIElement(element) => {
                // Handle UI elements based on their type
                match element.element_type.as_str() {
                    "button" => {
                        let button_text = element.properties.get("text")
                            .map(|v| self.value_to_csharp_string(v))
                            .unwrap_or("\"Button\"".to_string());
                        
                        ui_code.push_str(&format!("        var button{} = new Button();\n", index));
                        ui_code.push_str(&format!("        button{}.Content = {};\n", index, button_text));
                        
                        // Check for action/onClick handler
                        if let Some(action) = element.properties.get("onClick") {
                            if let Value::FunctionCall(func_name, _) = action {
                                let handler_name = self.csharp_variable_name(func_name);
                                ui_code.push_str(&format!("        button{}.Click += {};\n", index, handler_name));
                                
                                // Create event handler if not already created
                                let handler_exists = self.event_handlers.iter().any(|h| h.contains(&format!("void {}(", handler_name)));
                                if !handler_exists {
                                    let handler_code = format!("\n    private void {}(object sender, RoutedEventArgs e) {{\n        // Button click event handler\n    }}\n", handler_name);
                                    self.event_handlers.push(handler_code);
                                }
                            }
                        }
                        
                        // Add style if present
                        if let Some(Value::Object(style)) = element.properties.get("style") {
                            if let Some(Value::String(color)) = style.get("backgroundColor") {
                                ui_code.push_str(&format!("        button{}.Background = new SolidColorBrush(Color.FromRgb(255, 0, 0)); // Placeholder color\n", index));
                            }
                            if let Some(Value::Integer(margin)) = style.get("margin") {
                                ui_code.push_str(&format!("        button{}.Margin = new Thickness({});\n", index, margin));
                            }
                        }
                        
                        ui_code.push_str(&format!("        {}.Children.Add(button{});\n\n", parent, index));
                    },
                    "text" | "label" => {
                        let text = element.properties.get("text")
                            .map(|v| self.value_to_csharp_string(v))
                            .unwrap_or("\"Text\"".to_string());
                        
                        ui_code.push_str(&format!("        var textBlock{} = new TextBlock();\n", index));
                        ui_code.push_str(&format!("        textBlock{}.Text = {};\n", index, text));
                        
                        // Add style if present
                        if let Some(Value::Object(style)) = element.properties.get("style") {
                            if let Some(Value::String(color)) = style.get("color") {
                                ui_code.push_str(&format!("        textBlock{}.Foreground = new SolidColorBrush(Color.FromRgb(0, 0, 0)); // Placeholder color\n", index));
                            }
                            if let Some(Value::Integer(size)) = style.get("fontSize") {
                                ui_code.push_str(&format!("        textBlock{}.FontSize = {};\n", index, size));
                            }
                        }
                        
                        ui_code.push_str(&format!("        {}.Children.Add(textBlock{});\n\n", parent, index));
                    },
                    "input" | "textField" => {
                        let placeholder = element.properties.get("placeholder")
                            .map(|v| self.value_to_csharp_string(v))
                            .unwrap_or("\"Enter text...\"".to_string());
                        
                        ui_code.push_str(&format!("        var textBox{} = new TextBox();\n", index));
                        ui_code.push_str(&format!("        textBox{}.Text = \"\";\n", index));
                        ui_code.push_str(&format!("        textBox{}.Width = 250;\n", index));
                        ui_code.push_str(&format!("        {}.Children.Add(textBox{});\n\n", parent, index));
                    },
                    "image" => {
                        let src = element.properties.get("src")
                            .map(|v| self.value_to_csharp_string(v))
                            .unwrap_or("\"placeholder.png\"".to_string());
                        
                        ui_code.push_str(&format!("        var image{} = new Image();\n", index));
                        ui_code.push_str(&format!("        // Set image source - placeholder for now\n"));
                        ui_code.push_str(&format!("        // image{}.Source = new BitmapImage(new Uri({}));\n", index, src));
                        ui_code.push_str(&format!("        {}.Children.Add(image{});\n\n", parent, index));
                    },
                    "container" | "div" | "view" => {
                        ui_code.push_str(&format!("        var stackPanel{} = new StackPanel();\n", index));
                        
                        // Apply styling
                        if let Some(Value::Object(style)) = element.properties.get("style") {
                            if let Some(Value::String(color)) = style.get("backgroundColor") {
                                ui_code.push_str(&format!("        stackPanel{}.Background = new SolidColorBrush(Color.FromRgb(240, 240, 240)); // Placeholder color\n", index));
                            }
                            if let Some(Value::Integer(margin)) = style.get("margin") {
                                ui_code.push_str(&format!("        stackPanel{}.Margin = new Thickness({});\n", index, margin));
                            }
                        }
                        
                        ui_code.push_str(&format!("        {}.Children.Add(stackPanel{});\n\n", parent, index));
                        
                        // Process children recursively
                        if let Some(children) = &element.children {
                            for (i, child) in children.iter().enumerate() {
                                self.compile_wpf_component(ui_code, child, &format!("stackPanel{}", index), 100 * index + i)?;
                            }
                        }
                    },
                    _ => {
                        // Default fallback
                        ui_code.push_str(&format!("        var text{} = new TextBlock();\n", index));
                        ui_code.push_str(&format!("        text{}.Text = \"Unsupported component: {}\";\n", index, element.element_type));
                        ui_code.push_str(&format!("        {}.Children.Add(text{});\n\n", parent, index));
                    }
                }
            },
            _ => {
                // Unsupported node
                ui_code.push_str(&format!("        // Unsupported node: {:?}\n", node));
            }
        }
        
        Ok(())
    }
    
    /// Compile a statement node to C# code
    fn compile_statement(&mut self, stmt: &Statement) -> Result<(), String> {
        match stmt {
            Statement::VariableDeclaration(name, expr) => {
                // Determine C# type
                let csharp_type = match expr {
                    ASTNode::Value(value) => self.value_to_csharp_type(value),
                    _ => "object".to_string(),
                };
                
                // Add variable to state variables
                self.state_variables.insert(name.clone(), csharp_type);
                
                Ok(())
            },
            Statement::FunctionDefinition(name, params, body) => {
                // Add function implementation to event handlers
                let mut func_code = String::new();
                
                func_code.push_str(&format!("\n    private void {}({}) {{\n", 
                    self.csharp_variable_name(name),
                    params.iter().map(|p| format!("object {}", self.csharp_variable_name(p))).collect::<Vec<_>>().join(", ")));
                
                // Implement function body
                for statement in body {
                    func_code.push_str(&format!("        // Statement: {:?}\n", statement));
                    // Add actual statement implementation here
                }
                
                func_code.push_str("    }\n");
                
                // Add to event handlers
                self.event_handlers.push(func_code);
                
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
        
        // Add header comment
        app_code.push_str("// GaiaScript Windows Application\n");
        app_code.push_str("// Generated by GaiaScript Windows Compiler\n\n");
        
        // Add imports
        for import in &self.imports {
            app_code.push_str(&format!("{}\n", import));
        }
        app_code.push_str("\n");
        
        // Add namespace
        app_code.push_str("namespace GaiaScript {\n\n");
        
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
        
        // Close namespace
        app_code.push_str("}\n");
        
        Ok(app_code)
    }
    
    /// Generate a Visual Studio project
    pub fn generate_vs_project(&self, app_name: &str, output_dir: &str) -> Result<(), String> {
        // Create project directory
        let project_dir = Path::new(output_dir).join(app_name);
        if !project_dir.exists() {
            fs::create_dir_all(&project_dir).map_err(|e| format!("Failed to create project directory: {}", e))?;
        }
        
        // Create main C# file
        let cs_path = project_dir.join("Program.cs");
        fs::write(&cs_path, &self.output_code).map_err(|e| format!("Failed to write C# file: {}", e))?;
        
        // Create .csproj file
        let csproj_content = format!(r#"<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net7.0-windows</TargetFramework>
    <UseWPF>true</UseWPF>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
"#);
        
        let csproj_path = project_dir.join(format!("{}.csproj", app_name));
        fs::write(&csproj_path, csproj_content).map_err(|e| format!("Failed to write csproj file: {}", e))?;
        
        // Create a build script (batch file)
        let build_script = format!(r#"@echo off
REM Build script for {} Windows app

dotnet build
"#, app_name);
        
        let build_script_path = project_dir.join("build.bat");
        fs::write(&build_script_path, build_script).map_err(|e| format!("Failed to write build script: {}", e))?;
        
        // Return success
        Ok(())
    }
    
    /// Helper functions for C# naming conventions
    fn csharp_class_name(&self, name: &str) -> String {
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
    
    fn csharp_variable_name(&self, name: &str) -> String {
        let class_name = self.csharp_class_name(name);
        
        // Convert to camelCase (first letter lowercase)
        if !class_name.is_empty() {
            format!("{}{}", 
                class_name.chars().next().unwrap().to_ascii_lowercase(),
                &class_name[1..])
        } else {
            "gaiaVariable".to_string()
        }
    }
    
    fn csharp_property_name(&self, name: &str) -> String {
        // For properties, use PascalCase in C#
        self.csharp_class_name(name)
    }
    
    /// Convert a GaiaScript value to a C# type
    fn value_to_csharp_type(&self, value: &Value) -> String {
        match value {
            Value::Integer(_) => "int".to_string(),
            Value::Float(_) => "double".to_string(),
            Value::Boolean(_) => "bool".to_string(),
            Value::String(_) => "string".to_string(),
            Value::Array(_) => "object[]".to_string(),
            Value::Object(_) => "Dictionary<string, object>".to_string(),
            _ => "object".to_string(),
        }
    }
    
    /// Convert a GaiaScript value to a C# literal value
    fn value_to_csharp_string(&self, value: &Value) -> String {
        match value {
            Value::Integer(i) => i.to_string(),
            Value::Float(f) => f.to_string(),
            Value::Boolean(b) => if *b { "true".to_string() } else { "false".to_string() },
            Value::String(s) => format!("\"{}\"", s.replace("\"", "\\\"")),
            Value::Array(arr) => {
                format!("new object[] {{{}}}", arr.iter()
                    .map(|v| self.value_to_csharp_string(v))
                    .collect::<Vec<_>>()
                    .join(", "))
            },
            Value::Object(obj) => {
                format!("new Dictionary<string, object>() {{{}}}", obj.iter()
                    .map(|(k, v)| format!("{{ \"{}\", {} }}", k, self.value_to_csharp_string(v)))
                    .collect::<Vec<_>>()
                    .join(", "))
            },
            _ => "null".to_string(),
        }
    }
}