use crate::ast::{ASTNode, LayerType, NetworkNode};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::process::Command;

/// LinuxCompiler - Compiles GaiaScript directly to native Linux applications
/// using GTK for the UI implementation
pub struct LinuxCompiler {
    pub output_code: String,
    ui_components: Vec<String>,
    model_implementations: Vec<String>,
    imports: Vec<String>,
    state_variables: HashMap<String, String>,
    event_handlers: Vec<String>,
    indentation_level: usize,
}

impl LinuxCompiler {
    pub fn new() -> Self {
        let mut imports = Vec::new();
        // Core imports required for Linux applications
        imports.push("#include <gtk/gtk.h>".to_string());
        imports.push("#include <stdio.h>".to_string());
        imports.push("#include <stdlib.h>".to_string());
        imports.push("#include <string.h>".to_string());
        
        LinuxCompiler {
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
        
        // Generate C code from AST
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
    
    /// Compile a model node to C code
    fn compile_model(&mut self, model: &ModelNode) -> Result<(), String> {
        let mut model_code = String::new();
        
        // Model struct definition
        model_code.push_str(&format!("typedef struct {} {{\n", self.c_struct_name(&model.name)));
        
        // Add model properties for each layer
        for layer in &model.layers {
            match &layer.layer_type {
                LayerType::Dense(idx) => {
                    model_code.push_str(&format!("    // Dense layer {}\n", idx));
                    model_code.push_str("    float* weights;\n");
                    model_code.push_str("    size_t weights_size;\n");
                    model_code.push_str("    float* biases;\n");
                    model_code.push_str("    size_t biases_size;\n");
                }
                LayerType::Convolutional(idx) => {
                    model_code.push_str(&format!("    // Convolutional layer {}\n", idx));
                    model_code.push_str("    float* filters;\n");
                    model_code.push_str("    size_t filters_size;\n");
                    model_code.push_str("    float* biases;\n");
                    model_code.push_str("    size_t biases_size;\n");
                }
                LayerType::Input => {
                    model_code.push_str("    // Input layer\n");
                    model_code.push_str("    int* input_shape;\n");
                    model_code.push_str("    size_t input_dims;\n");
                }
                LayerType::Output => {
                    model_code.push_str("    // Output layer\n");
                    model_code.push_str("    size_t output_size;\n");
                }
                _ => {
                    model_code.push_str(&format!("    // Layer: {:?}\n", layer.layer_type));
                }
            }
        }
        
        // Close struct definition
        model_code.push_str("}} {};\n\n", self.c_struct_name(&model.name));
        
        // Forward function prototype
        model_code.push_str(&format!("float* {}_forward({} *model, float* input, size_t input_size);\n\n", 
            self.c_function_name(&model.name), 
            self.c_struct_name(&model.name)));
        
        // Forward function implementation
        model_code.push_str(&format!("float* {}_forward({} *model, float* input, size_t input_size) {{\n", 
            self.c_function_name(&model.name), 
            self.c_struct_name(&model.name)));
        model_code.push_str("    // Implement the forward pass through the model\n");
        model_code.push_str("    // This is a placeholder implementation\n");
        model_code.push_str("    return input;\n");
        model_code.push_str("}\n\n");
        
        // Constructor function
        model_code.push_str(&format!("{} *{}_create() {{\n", 
            self.c_struct_name(&model.name), 
            self.c_function_name(&model.name)));
        model_code.push_str(&format!("    {} *model = malloc(sizeof({}));\n", 
            self.c_struct_name(&model.name), 
            self.c_struct_name(&model.name)));
        model_code.push_str("    if (model == NULL) {\n");
        model_code.push_str("        fprintf(stderr, \"Failed to allocate memory for model\\n\");\n");
        model_code.push_str("        return NULL;\n");
        model_code.push_str("    }\n");
        
        // Initialize fields to default values
        for layer in &model.layers {
            match &layer.layer_type {
                LayerType::Dense(_) => {
                    model_code.push_str("    model->weights = NULL;\n");
                    model_code.push_str("    model->weights_size = 0;\n");
                    model_code.push_str("    model->biases = NULL;\n");
                    model_code.push_str("    model->biases_size = 0;\n");
                }
                LayerType::Convolutional(_) => {
                    model_code.push_str("    model->filters = NULL;\n");
                    model_code.push_str("    model->filters_size = 0;\n");
                    model_code.push_str("    model->biases = NULL;\n");
                    model_code.push_str("    model->biases_size = 0;\n");
                }
                LayerType::Input => {
                    model_code.push_str("    model->input_shape = NULL;\n");
                    model_code.push_str("    model->input_dims = 0;\n");
                }
                LayerType::Output => {
                    model_code.push_str("    model->output_size = 0;\n");
                }
                _ => {}
            }
        }
        
        model_code.push_str("    return model;\n");
        model_code.push_str("}\n\n");
        
        // Destructor function
        model_code.push_str(&format!("void {}_destroy({} *model) {{\n", 
            self.c_function_name(&model.name), 
            self.c_struct_name(&model.name)));
        model_code.push_str("    if (model == NULL) {\n");
        model_code.push_str("        return;\n");
        model_code.push_str("    }\n");
        
        // Free allocated memory
        for layer in &model.layers {
            match &layer.layer_type {
                LayerType::Dense(_) => {
                    model_code.push_str("    free(model->weights);\n");
                    model_code.push_str("    free(model->biases);\n");
                }
                LayerType::Convolutional(_) => {
                    model_code.push_str("    free(model->filters);\n");
                    model_code.push_str("    free(model->biases);\n");
                }
                LayerType::Input => {
                    model_code.push_str("    free(model->input_shape);\n");
                }
                _ => {}
            }
        }
        
        model_code.push_str("    free(model);\n");
        model_code.push_str("}\n\n");
        
        // Add to model implementations
        self.model_implementations.push(model_code);
        
        Ok(())
    }
    
    /// Compile a network node to C code
    fn compile_network(&mut self, network: &NetworkNode) -> Result<(), String> {
        let mut network_code = String::new();
        
        // Network struct definition
        network_code.push_str(&format!("typedef struct {} {{\n", self.c_struct_name(&network.name)));
        
        // Add model references
        for model_ref in &network.models {
            network_code.push_str(&format!("    {} *{};\n", 
                self.c_struct_name(&model_ref.name), 
                self.c_variable_name(&model_ref.name)));
        }
        
        // Close struct definition
        network_code.push_str(&format!("}} {};\n\n", self.c_struct_name(&network.name)));
        
        // Process function
        network_code.push_str(&format!("float* {}_process({} *network, float* input, size_t input_size) {{\n", 
            self.c_function_name(&network.name), 
            self.c_struct_name(&network.name)));
        network_code.push_str("    // Implement network processing logic\n");
        
        if !network.models.is_empty() {
            network_code.push_str(&format!("    return {}_forward(network->{}, input, input_size);\n", 
                self.c_function_name(&network.models[0].name),
                self.c_variable_name(&network.models[0].name)));
        } else {
            network_code.push_str("    return input;\n");
        }
        
        network_code.push_str("}\n\n");
        
        // Constructor function
        network_code.push_str(&format!("{} *{}_create() {{\n", 
            self.c_struct_name(&network.name), 
            self.c_function_name(&network.name)));
        network_code.push_str(&format!("    {} *network = malloc(sizeof({}));\n", 
            self.c_struct_name(&network.name), 
            self.c_struct_name(&network.name)));
        network_code.push_str("    if (network == NULL) {\n");
        network_code.push_str("        fprintf(stderr, \"Failed to allocate memory for network\\n\");\n");
        network_code.push_str("        return NULL;\n");
        network_code.push_str("    }\n");
        
        // Initialize model references
        for model_ref in &network.models {
            network_code.push_str(&format!("    network->{} = {}_create();\n", 
                self.c_variable_name(&model_ref.name),
                self.c_function_name(&model_ref.name)));
            network_code.push_str(&format!("    if (network->{} == NULL) {{\n", self.c_variable_name(&model_ref.name)));
            network_code.push_str("        fprintf(stderr, \"Failed to create model\\n\");\n");
            
            // Clean up previously created models
            for prev_model in network.models.iter() {
                if prev_model.name == model_ref.name {
                    break;
                }
                network_code.push_str(&format!("        {}_destroy(network->{});\n", 
                    self.c_function_name(&prev_model.name),
                    self.c_variable_name(&prev_model.name)));
            }
            
            network_code.push_str("        free(network);\n");
            network_code.push_str("        return NULL;\n");
            network_code.push_str("    }\n");
        }
        
        network_code.push_str("    return network;\n");
        network_code.push_str("}\n\n");
        
        // Destructor function
        network_code.push_str(&format!("void {}_destroy({} *network) {{\n", 
            self.c_function_name(&network.name), 
            self.c_struct_name(&network.name)));
        network_code.push_str("    if (network == NULL) {\n");
        network_code.push_str("        return;\n");
        network_code.push_str("    }\n");
        
        // Free allocated models
        for model_ref in &network.models {
            network_code.push_str(&format!("    {}_destroy(network->{});\n", 
                self.c_function_name(&model_ref.name),
                self.c_variable_name(&model_ref.name)));
        }
        
        network_code.push_str("    free(network);\n");
        network_code.push_str("}\n\n");
        
        // Add to model implementations
        self.model_implementations.push(network_code);
        
        Ok(())
    }
    
    /// Compile a UI node to GTK-based C code
    fn compile_ui(&mut self, ui: &UINode) -> Result<(), String> {
        let mut ui_code = String::new();
        
        // Global variables for widgets
        ui_code.push_str("// Global widget variables\n");
        ui_code.push_str("GtkWidget *window;\n");
        
        // Add global state variables
        for (key, value) in &ui.properties {
            let c_type = self.value_to_c_type(value);
            ui_code.push_str(&format!("{} {};\n", c_type, self.c_variable_name(key)));
            
            // Store state variables for later use
            self.state_variables.insert(key.clone(), c_type.clone());
        }
        ui_code.push_str("\n");
        
        // Forward declarations for callbacks
        ui_code.push_str("// Forward declarations for event handlers\n");
        for (i, handler) in self.event_handlers.iter().enumerate() {
            if handler.starts_with("static void") {
                let handler_name = handler.split_whitespace().nth(2).unwrap_or(&format!("handler_{}", i));
                if let Some(handler_name) = handler_name.split('(').next() {
                    ui_code.push_str(&format!("static void {}(GtkWidget *widget, gpointer data);\n", handler_name));
                }
            }
        }
        ui_code.push_str("\n");
        
        // Main window creation function
        ui_code.push_str("static void create_window(int *argc, char ***argv) {\n");
        ui_code.push_str("    // Initialize GTK\n");
        ui_code.push_str("    gtk_init(argc, argv);\n\n");
        
        ui_code.push_str("    // Create the main window\n");
        ui_code.push_str("    window = gtk_window_new(GTK_WINDOW_TOPLEVEL);\n");
        ui_code.push_str(&format!("    gtk_window_set_title(GTK_WINDOW(window), \"{}App\");\n", ui.name));
        ui_code.push_str("    gtk_window_set_default_size(GTK_WINDOW(window), 800, 600);\n");
        ui_code.push_str("    g_signal_connect(window, \"destroy\", G_CALLBACK(gtk_main_quit), NULL);\n\n");
        
        ui_code.push_str("    // Create a vertical box layout\n");
        ui_code.push_str("    GtkWidget *vbox = gtk_box_new(GTK_ORIENTATION_VERTICAL, 5);\n");
        ui_code.push_str("    gtk_container_add(GTK_CONTAINER(window), vbox);\n\n");
        
        // Create UI components
        if let Some(children) = &ui.children {
            for (i, child) in children.iter().enumerate() {
                let component_code = self.compile_gtk_component(child, "vbox", i)?;
                ui_code.push_str(&component_code);
            }
        }
        
        ui_code.push_str("    // Show all widgets\n");
        ui_code.push_str("    gtk_widget_show_all(window);\n");
        ui_code.push_str("}\n\n");
        
        // Main function
        ui_code.push_str("int main(int argc, char *argv[]) {\n");
        ui_code.push_str("    // Initialize the UI\n");
        ui_code.push_str("    create_window(&argc, &argv);\n\n");
        
        // Initialize state variables
        for (key, value) in &ui.properties {
            if let Some(default_value) = value {
                ui_code.push_str(&format!("    // Initialize {} to {}\n", 
                    self.c_variable_name(key),
                    self.value_to_c_string(default_value)));
            }
        }
        
        ui_code.push_str("    // Start the GTK main loop\n");
        ui_code.push_str("    gtk_main();\n\n");
        ui_code.push_str("    return 0;\n");
        ui_code.push_str("}\n\n");
        
        // Add event handlers
        for handler in &self.event_handlers {
            ui_code.push_str(handler);
            ui_code.push_str("\n");
        }
        
        // Add to UI components
        self.ui_components.push(ui_code);
        
        Ok(())
    }
    
    /// Compile a UI component to GTK
    fn compile_gtk_component(&mut self, node: &ASTNode, parent: &str, index: usize) -> Result<String, String> {
        let mut component_code = String::new();
        
        match node {
            ASTNode::Value(value) => {
                // Simple value rendering (e.g., text)
                match value {
                    Value::String(s) => {
                        component_code.push_str(&format!("    // Add text label {}\n", index));
                        component_code.push_str(&format!("    GtkWidget *label{} = gtk_label_new(\"{}\");\n", index, s));
                        component_code.push_str(&format!("    gtk_box_pack_start(GTK_BOX({}), label{}, FALSE, FALSE, 0);\n\n", parent, index));
                    },
                    _ => {
                        let string_repr = self.value_to_c_string(value);
                        component_code.push_str(&format!("    // Add value label {}\n", index));
                        component_code.push_str(&format!("    GtkWidget *label{} = gtk_label_new(\"{}\");\n", index, string_repr));
                        component_code.push_str(&format!("    gtk_box_pack_start(GTK_BOX({}), label{}, FALSE, FALSE, 0);\n\n", parent, index));
                    }
                }
            },
            ASTNode::UIElement(element) => {
                // Handle UI elements based on their type
                match element.element_type.as_str() {
                    "button" => {
                        let button_text = element.properties.get("text")
                            .map(|v| match v {
                                Value::String(s) => s.clone(),
                                _ => "Button".to_string()
                            })
                            .unwrap_or("Button".to_string());
                        
                        component_code.push_str(&format!("    // Add button {}\n", index));
                        component_code.push_str(&format!("    GtkWidget *button{} = gtk_button_new_with_label(\"{}\");\n", index, button_text));
                        
                        // Check for action/onClick handler
                        if let Some(action) = element.properties.get("onClick") {
                            if let Value::FunctionCall(func_name, _) = action {
                                let handler_name = self.c_function_name(func_name);
                                component_code.push_str(&format!("    g_signal_connect(button{}, \"clicked\", G_CALLBACK({}), NULL);\n", index, handler_name));
                                
                                // Create event handler if not already created
                                let handler_exists = self.event_handlers.iter().any(|h| h.contains(&format!("{} {}", handler_name, "(")));
                                if !handler_exists {
                                    let handler_code = format!("static void {}(GtkWidget *widget, gpointer data) {{\n    // Button click event handler\n    printf(\"Button clicked\\n\");\n}}\n", handler_name);
                                    self.event_handlers.push(handler_code);
                                }
                            }
                        }
                        
                        component_code.push_str(&format!("    gtk_box_pack_start(GTK_BOX({}), button{}, FALSE, FALSE, 0);\n\n", parent, index));
                    },
                    "text" | "label" => {
                        let text = element.properties.get("text")
                            .map(|v| match v {
                                Value::String(s) => s.clone(),
                                _ => "Text".to_string()
                            })
                            .unwrap_or("Text".to_string());
                        
                        component_code.push_str(&format!("    // Add label {}\n", index));
                        component_code.push_str(&format!("    GtkWidget *label{} = gtk_label_new(\"{}\");\n", index, text));
                        
                        // Apply styling if present
                        if let Some(Value::Object(style)) = element.properties.get("style") {
                            // GTK styling would go here, but it's complex in C
                            component_code.push_str(&format!("    // TODO: Apply styling to label{}\n", index));
                        }
                        
                        component_code.push_str(&format!("    gtk_box_pack_start(GTK_BOX({}), label{}, FALSE, FALSE, 0);\n\n", parent, index));
                    },
                    "input" | "textField" => {
                        let placeholder = element.properties.get("placeholder")
                            .map(|v| match v {
                                Value::String(s) => s.clone(),
                                _ => "Enter text...".to_string()
                            })
                            .unwrap_or("Enter text...".to_string());
                        
                        component_code.push_str(&format!("    // Add text entry {}\n", index));
                        component_code.push_str(&format!("    GtkWidget *entry{} = gtk_entry_new();\n", index));
                        component_code.push_str(&format!("    gtk_entry_set_placeholder_text(GTK_ENTRY(entry{}), \"{}\");\n", index, placeholder));
                        component_code.push_str(&format!("    gtk_box_pack_start(GTK_BOX({}), entry{}, FALSE, FALSE, 0);\n\n", parent, index));
                    },
                    "image" => {
                        let src = element.properties.get("src")
                            .map(|v| match v {
                                Value::String(s) => s.clone(),
                                _ => "placeholder.png".to_string()
                            })
                            .unwrap_or("placeholder.png".to_string());
                        
                        component_code.push_str(&format!("    // Add image {}\n", index));
                        component_code.push_str(&format!("    GtkWidget *image{} = gtk_image_new_from_file(\"{}\");\n", index, src));
                        component_code.push_str(&format!("    gtk_box_pack_start(GTK_BOX({}), image{}, TRUE, TRUE, 0);\n\n", parent, index));
                    },
                    "container" | "div" | "view" => {
                        component_code.push_str(&format!("    // Add container {}\n", index));
                        component_code.push_str(&format!("    GtkWidget *box{} = gtk_box_new(GTK_ORIENTATION_VERTICAL, 5);\n", index));
                        
                        // Apply styling if present
                        if let Some(Value::Object(style)) = element.properties.get("style") {
                            // GTK styling would go here
                            component_code.push_str(&format!("    // TODO: Apply styling to box{}\n", index));
                        }
                        
                        component_code.push_str(&format!("    gtk_box_pack_start(GTK_BOX({}), box{}, TRUE, TRUE, 0);\n\n", parent, index));
                        
                        // Process children recursively
                        if let Some(children) = &element.children {
                            for (i, child) in children.iter().enumerate() {
                                let child_code = self.compile_gtk_component(child, &format!("box{}", index), 100 * index + i)?;
                                component_code.push_str(&child_code);
                            }
                        }
                    },
                    _ => {
                        // Default fallback
                        component_code.push_str(&format!("    // Unsupported element: {}\n", element.element_type));
                        component_code.push_str(&format!("    GtkWidget *label{} = gtk_label_new(\"Unsupported component: {}\");\n", index, element.element_type));
                        component_code.push_str(&format!("    gtk_box_pack_start(GTK_BOX({}), label{}, FALSE, FALSE, 0);\n\n", parent, index));
                    }
                }
            },
            _ => {
                // Unsupported node
                component_code.push_str(&format!("    // Unsupported node type: {:?}\n", node));
            }
        }
        
        Ok(component_code)
    }
    
    /// Compile a statement to C code
    fn compile_statement(&mut self, stmt: &Statement) -> Result<(), String> {
        match stmt {
            Statement::VariableDeclaration(name, expr) => {
                // Determine C type
                let c_type = match expr {
                    ASTNode::Value(value) => self.value_to_c_type(value),
                    _ => "void*".to_string(),
                };
                
                // Add variable to state variables
                self.state_variables.insert(name.clone(), c_type);
                
                Ok(())
            },
            Statement::FunctionDefinition(name, params, body) => {
                // Add function implementation
                let func_name = self.c_function_name(name);
                let mut func_code = String::new();
                
                func_code.push_str(&format!("static void {}(", func_name));
                if params.is_empty() {
                    func_code.push_str("void");
                } else {
                    for (i, param) in params.iter().enumerate() {
                        if i > 0 {
                            func_code.push_str(", ");
                        }
                        func_code.push_str(&format!("void* {}", self.c_variable_name(param)));
                    }
                }
                func_code.push_str(") {\n");
                
                // Implement function body
                for statement in body {
                    func_code.push_str(&format!("    // Statement: {:?}\n", statement));
                    // Add actual statement implementation here
                }
                
                func_code.push_str("}\n");
                
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
        app_code.push_str("/* GaiaScript Linux Application */\n");
        app_code.push_str("/* Generated by GaiaScript Linux Compiler */\n\n");
        
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
    
    /// Generate a Makefile and build scripts
    pub fn generate_build_files(&self, app_name: &str, output_dir: &str) -> Result<(), String> {
        // Create project directory
        let project_dir = Path::new(output_dir).join(app_name);
        if !project_dir.exists() {
            fs::create_dir_all(&project_dir).map_err(|e| format!("Failed to create project directory: {}", e))?;
        }
        
        // Create main C file
        let c_path = project_dir.join("main.c");
        fs::write(&c_path, &self.output_code).map_err(|e| format!("Failed to write C file: {}", e))?;
        
        // Create Makefile
        let makefile_content = format!(r#"CC=gcc
CFLAGS=`pkg-config --cflags gtk+-3.0` -Wall -g
LDFLAGS=`pkg-config --libs gtk+-3.0` -lm

all: {}

{}: main.c
	$(CC) main.c -o {} $(CFLAGS) $(LDFLAGS)

clean:
	rm -f {}

.PHONY: all clean
"#, app_name, app_name, app_name, app_name);
        
        let makefile_path = project_dir.join("Makefile");
        fs::write(&makefile_path, makefile_content).map_err(|e| format!("Failed to write Makefile: {}", e))?;
        
        // Create a simple build script
        let build_script = format!(r#"#!/bin/bash
# Build script for {} Linux app

# Check for required packages
if ! pkg-config --exists gtk+-3.0; then
    echo "GTK3 development libraries not found. Please install them:"
    echo "  On Ubuntu/Debian: sudo apt-get install libgtk-3-dev"
    echo "  On Fedora: sudo dnf install gtk3-devel"
    echo "  On Arch: sudo pacman -S gtk3"
    exit 1
fi

# Build the application
make
"#, app_name);
        
        let build_script_path = project_dir.join("build.sh");
        fs::write(&build_script_path, build_script).map_err(|e| format!("Failed to write build script: {}", e))?;
        
        // Make the build script executable
        Command::new("chmod")
            .arg("+x")
            .arg(&build_script_path)
            .output()
            .map_err(|e| format!("Failed to make build script executable: {}", e))?;
        
        // Return success
        Ok(())
    }
    
    /// Helper functions for C naming conventions
    fn c_struct_name(&self, name: &str) -> String {
        let mut struct_name = String::new();
        let mut capitalize_next = true;
        
        for c in name.chars() {
            if !c.is_alphanumeric() {
                capitalize_next = true;
                continue;
            }
            
            if capitalize_next {
                struct_name.push(c.to_ascii_uppercase());
                capitalize_next = false;
            } else {
                struct_name.push(c);
            }
        }
        
        // Ensure the struct name starts with an uppercase letter
        if !struct_name.is_empty() && !struct_name.chars().next().unwrap().is_uppercase() {
            struct_name = format!("{}{}", 
                struct_name.chars().next().unwrap().to_ascii_uppercase(),
                &struct_name[1..]);
        }
        
        // If the struct name is empty, use a default
        if struct_name.is_empty() {
            struct_name = "GaiaModel".to_string();
        }
        
        struct_name
    }
    
    fn c_variable_name(&self, name: &str) -> String {
        // In C, we'll use snake_case
        let mut var_name = String::new();
        let mut prev_is_uppercase = false;
        
        for (i, c) in name.chars().enumerate() {
            if !c.is_alphanumeric() {
                var_name.push('_');
                prev_is_uppercase = false;
                continue;
            }
            
            if c.is_uppercase() {
                if i > 0 && !prev_is_uppercase {
                    var_name.push('_');
                }
                var_name.push(c.to_ascii_lowercase());
                prev_is_uppercase = true;
            } else {
                var_name.push(c);
                prev_is_uppercase = false;
            }
        }
        
        // If the variable name is empty, use a default
        if var_name.is_empty() {
            var_name = "gaia_var".to_string();
        }
        
        var_name
    }
    
    fn c_function_name(&self, name: &str) -> String {
        // Function names are in snake_case in C
        self.c_variable_name(name)
    }
    
    /// Convert a GaiaScript value to a C type
    fn value_to_c_type(&self, value: &Value) -> String {
        match value {
            Value::Integer(_) => "int".to_string(),
            Value::Float(_) => "float".to_string(),
            Value::Boolean(_) => "int".to_string(), // C uses int for boolean
            Value::String(_) => "char*".to_string(),
            Value::Array(_) => "void*".to_string(),
            Value::Object(_) => "void*".to_string(),
            _ => "void*".to_string(),
        }
    }
    
    /// Convert a GaiaScript value to a C literal value
    fn value_to_c_string(&self, value: &Value) -> String {
        match value {
            Value::Integer(i) => i.to_string(),
            Value::Float(f) => f.to_string(),
            Value::Boolean(b) => if *b { "1".to_string() } else { "0".to_string() },
            Value::String(s) => s.replace("\"", "\\\""),
            Value::Array(_) => "NULL /* Array initialization not directly supported */".to_string(),
            Value::Object(_) => "NULL /* Object initialization not directly supported */".to_string(),
            _ => "NULL".to_string(),
        }
    }
}