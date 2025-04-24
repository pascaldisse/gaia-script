use crate::ast::{ASTNode, LayerType, SymbolTable, NetworkNode};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::process::Command;

/// AndroidCompiler - Compiles GaiaScript directly to Android applications
/// using Kotlin and the Android SDK
pub struct AndroidCompiler {
    pub output_code: String,
    ui_components: Vec<String>,
    model_implementations: Vec<String>,
    imports: Vec<String>,
    state_variables: HashMap<String, String>,
    event_handlers: Vec<String>,
    indentation_level: usize,
}

impl AndroidCompiler {
    pub fn new() -> Self {
        let mut imports = Vec::new();
        // Core imports required for Android applications
        imports.push("import android.app.Activity".to_string());
        imports.push("import android.os.Bundle".to_string());
        imports.push("import android.view.View".to_string());
        imports.push("import android.widget.*".to_string());
        imports.push("import androidx.appcompat.app.AppCompatActivity".to_string());
        imports.push("import androidx.constraintlayout.widget.ConstraintLayout".to_string());
        
        AndroidCompiler {
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
        
        // Generate Kotlin code from AST
        match ast {
            ASTNode::Network(network) => self.compile_network(network)?,
            _ => return Err(format!("Unsupported root AST node type: {:?}", ast)),
        }
        
        // Assemble the final application
        self.assemble_application()
    }
    
    /// Simplified model compilation method
    fn compile_model(&mut self) -> Result<(), String> {
        let mut model_code = String::new();
        
        // Start model class definition
        model_code.push_str("class GaiaModel {\n");
        
        // Add some model properties
        model_code.push_str("    // Dense layer\n");
        model_code.push_str("    var weights: FloatArray = floatArrayOf()\n");
        model_code.push_str("    var biases: FloatArray = floatArrayOf()\n");
        
        // Add forward method
        model_code.push_str("\n    fun forward(input: FloatArray): FloatArray {\n");
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
    
    /// Compile a network node to Kotlin code
    fn compile_network(&mut self, network: &NetworkNode) -> Result<(), String> {
        // First, compile a model we can use
        self.compile_model()?;
        
        // Also compile a UI
        self.compile_ui()?;
        
        let mut network_code = String::new();
        
        // Start network class definition
        network_code.push_str("class GaiaNetwork {\n");
        network_code.push_str("    private val model: GaiaModel = GaiaModel()\n");
        
        // Add processing method
        network_code.push_str("\n    fun process(input: FloatArray): FloatArray {\n");
        network_code.push_str("        // Example network processing logic\n");
        network_code.push_str("        return model.forward(input)\n");
        network_code.push_str("    }\n");
        
        // Close class definition
        network_code.push_str("}\n");
        
        // Add to model implementations
        self.model_implementations.push(network_code);
        
        Ok(())
    }
    
    /// Simplified UI compilation method
    fn compile_ui(&mut self) -> Result<(), String> {
        let mut ui_code = String::new();
        
        // Generate the MainActivity class
        ui_code.push_str("class GaiaActivity : AppCompatActivity() {\n");
        
        // Add view references
        ui_code.push_str("\n    // View references\n");
        ui_code.push_str("    private lateinit var view0: View\n");
        
        // Override onCreate method
        ui_code.push_str("\n    override fun onCreate(savedInstanceState: Bundle?) {\n");
        ui_code.push_str("        super.onCreate(savedInstanceState)\n");
        ui_code.push_str("        \n");
        ui_code.push_str("        // Create main layout\n");
        ui_code.push_str("        val mainLayout = LinearLayout(this)\n");
        ui_code.push_str("        mainLayout.orientation = LinearLayout.VERTICAL\n");
        ui_code.push_str("        \n");
        
        // Add a placeholder component
        let component_code = self.compile_android_component("mainLayout", 0)?;
        ui_code.push_str(&component_code);
        
        ui_code.push_str("        // Set the content view\n");
        ui_code.push_str("        setContentView(mainLayout)\n");
        ui_code.push_str("    }\n");
        
        // Add a placeholder event handler
        ui_code.push_str("\n    private fun handleEvent() {\n");
        ui_code.push_str("        // Placeholder event handler\n");
        ui_code.push_str("    }\n");
        
        // Close activity class
        ui_code.push_str("}\n");
        
        // Add to UI components
        self.ui_components.push(ui_code);
        
        Ok(())
    }
    
    /// Simplified component compilation function
    fn compile_android_component(&mut self, parent: &str, index: usize) -> Result<String, String> {
        let mut component_code = String::new();
        
        // Create a placeholder component
        component_code.push_str(&format!("        // Add text view {}\n", index));
        component_code.push_str(&format!("        val textView{} = TextView(this)\n", index));
        component_code.push_str(&format!("        textView{}.text = \"GaiaScript Component\"\n", index));
        component_code.push_str(&format!("        {}.addView(textView{})\n\n", parent, index));
        component_code.push_str(&format!("        view{} = textView{}\n", index, index));
        
        Ok(component_code)
    }
    
    /// Simplified statement compilation method
    fn compile_statement(&mut self, name: &str) -> Result<(), String> {
        // Add a simple function implementation
        let func_code = format!("\n    private fun {}() {{\n        // Placeholder implementation\n    }}\n", 
            self.kotlin_variable_name(name));
        
        // Add to event handlers
        self.event_handlers.push(func_code);
        
        Ok(())
    }
    
    /// Assemble the final application combining all components
    fn assemble_application(&self) -> Result<String, String> {
        let mut app_code = String::new();
        
        // Add package declaration
        app_code.push_str("package com.gaiascript.app\n\n");
        
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
    
    /// Generate Android project files
    pub fn generate_android_project(&self, app_name: &str, output_dir: &str) -> Result<(), String> {
        // Create project directory
        let project_dir = Path::new(output_dir).join(app_name);
        if !project_dir.exists() {
            fs::create_dir_all(&project_dir).map_err(|e| format!("Failed to create project directory: {}", e))?;
        }
        
        // Create app subdirectory
        let app_dir = project_dir.join("app");
        if !app_dir.exists() {
            fs::create_dir_all(&app_dir).map_err(|e| format!("Failed to create app directory: {}", e))?;
        }
        
        // Create src/main/java/com/gaiascript/app directory
        let java_dir = app_dir.join("src/main/java/com/gaiascript/app");
        if !java_dir.exists() {
            fs::create_dir_all(&java_dir).map_err(|e| format!("Failed to create java directory: {}", e))?;
        }
        
        // Create src/main/res directory
        let res_dir = app_dir.join("src/main/res");
        if !res_dir.exists() {
            fs::create_dir_all(&res_dir).map_err(|e| format!("Failed to create res directory: {}", e))?;
        }
        
        // Create layout directory
        let layout_dir = res_dir.join("layout");
        if !layout_dir.exists() {
            fs::create_dir_all(&layout_dir).map_err(|e| format!("Failed to create layout directory: {}", e))?;
        }
        
        // Create values directory
        let values_dir = res_dir.join("values");
        if !values_dir.exists() {
            fs::create_dir_all(&values_dir).map_err(|e| format!("Failed to create values directory: {}", e))?;
        }
        
        // Create main Kotlin file
        let kotlin_path = java_dir.join("MainActivity.kt");
        fs::write(&kotlin_path, &self.output_code).map_err(|e| format!("Failed to write Kotlin file: {}", e))?;
        
        // Create AndroidManifest.xml
        let manifest_content = format!(r#"<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.gaiascript.app">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>"#);
        
        let manifest_path = app_dir.join("src/main/AndroidManifest.xml");
        fs::write(&manifest_path, manifest_content).map_err(|e| format!("Failed to write AndroidManifest.xml: {}", e))?;
        
        // Create strings.xml
        let strings_content = format!(r#"<resources>
    <string name="app_name">{}</string>
</resources>"#, app_name);
        
        let strings_path = values_dir.join("strings.xml");
        fs::write(&strings_path, strings_content).map_err(|e| format!("Failed to write strings.xml: {}", e))?;
        
        // Create build.gradle (app)
        let app_gradle_content = r#"plugins {
    id 'com.android.application'
    id 'kotlin-android'
}

android {
    compileSdkVersion 33
    
    defaultConfig {
        applicationId "com.gaiascript.app"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0"
        
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    
    kotlinOptions {
        jvmTarget = '1.8'
    }
}

dependencies {
    implementation "org.jetbrains.kotlin:kotlin-stdlib:1.8.10"
    implementation 'androidx.core:core-ktx:1.10.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.8.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}"#;
        
        let app_gradle_path = app_dir.join("build.gradle");
        fs::write(&app_gradle_path, app_gradle_content).map_err(|e| format!("Failed to write app build.gradle: {}", e))?;
        
        // Create build.gradle (project)
        let project_gradle_content = r#"// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath "com.android.tools.build:gradle:7.4.2"
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:1.8.10"
        
        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}"#;
        
        let project_gradle_path = project_dir.join("build.gradle");
        fs::write(&project_gradle_path, project_gradle_content).map_err(|e| format!("Failed to write project build.gradle: {}", e))?;
        
        // Create settings.gradle
        let settings_gradle_content = format!(r#"rootProject.name = "{}"
include ':app'"#, app_name);
        
        let settings_gradle_path = project_dir.join("settings.gradle");
        fs::write(&settings_gradle_path, settings_gradle_content).map_err(|e| format!("Failed to write settings.gradle: {}", e))?;
        
        // Create gradle.properties
        let gradle_properties_content = r#"# Project-wide Gradle settings.
# IDE (e.g. Android Studio) users:
# Settings specified in this file will override any Gradle settings
# configured through the IDE.
# For more details on how to configure your build environment visit
# http://www.gradle.org/docs/current/userguide/build_environment.html
# Specifies the JVM arguments used for the daemon process.
# The setting is particularly useful for tweaking memory settings.
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
# When configured, Gradle will run in incubating parallel mode.
# This option should only be used with decoupled projects. More details, visit
# http://www.gradle.org/docs/current/userguide/multi_project_builds.html#sec:decoupled_projects
# org.gradle.parallel=true
# AndroidX package structure to make it clearer which packages are bundled with the
# Android operating system, and which are packaged with your app"s APK
# https://developer.android.com/topic/libraries/support-library/androidx-rn
android.useAndroidX=true
# Automatically convert third-party libraries to use AndroidX
android.enableJetifier=true
# Kotlin code style for this project: "official" or "obsolete":
kotlin.code.style=official"#;
        
        let gradle_properties_path = project_dir.join("gradle.properties");
        fs::write(&gradle_properties_path, gradle_properties_content).map_err(|e| format!("Failed to write gradle.properties: {}", e))?;
        
        // Create gradlew scripts
        let gradlew_content = "#!/usr/bin/env sh\n# This is a placeholder for the actual gradlew script\n";
        let gradlew_path = project_dir.join("gradlew");
        fs::write(&gradlew_path, gradlew_content).map_err(|e| format!("Failed to write gradlew: {}", e))?;
        
        // Make gradlew executable
        Command::new("chmod")
            .arg("+x")
            .arg(&gradlew_path)
            .output()
            .map_err(|e| format!("Failed to make gradlew executable: {}", e))?;
        
        // Create README with instructions
        let readme_content = format!(r#"# {} Android App

This Android application was generated by GaiaScript Android Compiler.

## Building the Project

### Requirements
- Android Studio 4.2 or newer
- JDK 8 or newer
- Android SDK 21 or newer

### Steps to build
1. Open the project in Android Studio
2. Let Gradle sync and download dependencies
3. Build and run the app on an emulator or device

## Project Structure
- `app/src/main/java/com/gaiascript/app/` - Contains Kotlin code
- `app/src/main/res/` - Contains Android resources
- `app/src/main/AndroidManifest.xml` - App configuration

## Customization
- Modify `app/src/main/java/com/gaiascript/app/MainActivity.kt` to change app behavior
- Add resources in `app/src/main/res/` directories
"#, app_name);
        
        let readme_path = project_dir.join("README.md");
        fs::write(&readme_path, readme_content).map_err(|e| format!("Failed to write README.md: {}", e))?;
        
        // Return success
        Ok(())
    }
    
    /// Helper functions for Kotlin naming conventions
    fn kotlin_class_name(&self, name: &str) -> String {
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
    
    fn kotlin_variable_name(&self, name: &str) -> String {
        let class_name = self.kotlin_class_name(name);
        
        // Convert to camelCase (first letter lowercase)
        if !class_name.is_empty() {
            format!("{}{}", 
                class_name.chars().next().unwrap().to_ascii_lowercase(),
                &class_name[1..])
        } else {
            "gaiaVariable".to_string()
        }
    }
    
    /// Simplified helper for Kotlin type names
    fn value_to_kotlin_type(&self, value_name: &str) -> String {
        match value_name {
            "integer" => "Int".to_string(),
            "float" => "Float".to_string(),
            "boolean" => "Boolean".to_string(),
            "string" => "String".to_string(),
            _ => "Any".to_string(),
        }
    }
    
    /// Simplified helper for Kotlin literal values
    fn value_to_kotlin_string(&self, value: &str) -> String {
        format!("\"{}\"", value)
    }
}