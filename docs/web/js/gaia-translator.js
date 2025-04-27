/**
 * GaiaScript Translator
 * Translates between natural language, code, and GaiaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    const sourceText = document.getElementById('source-text');
    const targetText = document.getElementById('target-text');
    const sourceLanguage = document.getElementById('source-language');
    const targetLanguage = document.getElementById('target-language');
    const translateBtn = document.getElementById('translate-btn');
    const swapBtn = document.getElementById('swap-btn');

    // Example translations
    const translations = {
        // Natural language to GaiaScript examples
        "natural_gaiascript": {
            "Create a convolutional neural network with 32 filters and ReLU activation": 
                "N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S",
            "Build a GAN with generator and discriminator": 
                "N〈G⊕D〉\nG: Z 100 → D₁ 256 ρ → D₁ 512 ρ → D₀ 784 τ\nD: I → D₁ 512 ρ → D₁ 256 ρ → D₀ 1 σ\nL: G(Z)⊳D⟿BCE",
            "Make a transformer with attention mechanism":
                "N〈E⊕D〉\nE: I → [E → A{h:8} → N]×6\nD: I → [E → A{h:8} → N]×6 → D₀ V S",
            "Define a simple neural network with two hidden layers":
                "N I → D₁ 128 ρ → D₁ 64 ρ → D₀ 10 → S"
        },
        
        // GaiaScript to JavaScript examples
        "gaiascript_javascript": {
            "N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S": 
                `const model = tf.sequential();
model.add(tf.layers.conv2d({
  filters: 32,
  kernelSize: 3,
  activation: 'relu',
  inputShape: [28, 28, 1]
}));
model.add(tf.layers.maxPooling2d({poolSize: 2}));
model.add(tf.layers.flatten());
model.add(tf.layers.dense({units: 128, activation: 'relu'}));
model.add(tf.layers.dense({units: 10, activation: 'softmax'}));`,
            
            "N〈G⊕D〉\nG: Z 100 → D₁ 256 ρ → D₀ 784 τ": 
                `// Generator
const generator = tf.sequential();
generator.add(tf.layers.dense({
  units: 256,
  activation: 'relu',
  inputShape: [100]
}));
generator.add(tf.layers.dense({
  units: 784,
  activation: 'tanh'
}));`
        },
        
        // GaiaScript to Python examples
        "gaiascript_python": {
            "N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S": 
                `model = Sequential()
model.add(Conv2D(32, kernel_size=(3, 3), activation='relu', input_shape=(28, 28, 1)))
model.add(MaxPooling2D(pool_size=(2, 2)))
model.add(Flatten())
model.add(Dense(128, activation='relu'))
model.add(Dense(10, activation='softmax'))`,
            
            "N〈G⊕D〉\nG: Z 100 → D₁ 256 ρ → D₀ 784 τ":
                `# Generator
generator = Sequential()
generator.add(Dense(256, activation='relu', input_dim=100))
generator.add(Dense(784, activation='tanh'))`
        },
        
        // JavaScript to GaiaScript examples
        "javascript_gaiascript": {
            `const model = tf.sequential();
model.add(tf.layers.dense({units: 128, activation: 'relu', inputShape: [784]}));
model.add(tf.layers.dense({units: 64, activation: 'relu'}));
model.add(tf.layers.dense({units: 10, activation: 'softmax'}));`: 
                "N I → D₁ 128 ρ → D₁ 64 ρ → D₀ 10 → S"
        },
        
        // Python to GaiaScript examples
        "python_gaiascript": {
            `model = Sequential()
model.add(Conv2D(32, kernel_size=(3, 3), activation='relu'))
model.add(MaxPooling2D(pool_size=(2, 2)))
model.add(Flatten())
model.add(Dense(128, activation='relu'))
model.add(Dense(10, activation='softmax'))`: 
                "N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S"
        }
    };

    // Detect language based on input text
    function detectLanguage(text) {
        // If text contains GaiaScript symbols (→, ⊕, ρ, etc.)
        if (/[→⊕ρσ⊳⟿N〈〉I]/.test(text)) {
            return "gaiascript";
        }
        
        // If text contains JavaScript syntax
        else if (/const|let|var|function|=>|\{|\}|\.add\(|tf\./.test(text)) {
            return "javascript";
        }
        
        // If text contains Python syntax
        else if (/def|class|import|from|__|:|\s{4}/.test(text)) {
            return "python";
        }
        
        // Default to natural language
        return "natural";
    }

    // Translate text based on source and target languages
    function translateText(text, from, to) {
        // If auto-detect is selected, detect the language
        if (from === "auto") {
            from = detectLanguage(text);
            // Update the source language dropdown
            sourceLanguage.value = from;
        }
        
        // If source and target are the same, return the text
        if (from === to) {
            return text;
        }
        
        // Get translations for the language pair
        const translationKey = `${from}_${to}`;
        const langTranslations = translations[translationKey];
        
        // If we have an exact match in our examples, use it
        if (langTranslations && langTranslations[text.trim()]) {
            return langTranslations[text.trim()];
        }
        
        // Otherwise, perform a more complex translation based on patterns
        // This is where we would integrate with NLP or LLM APIs in a real implementation
        
        // Placeholder for demonstration
        if (from === "natural" && to === "gaiascript") {
            if (text.toLowerCase().includes("cnn") || text.toLowerCase().includes("convolutional")) {
                return "N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S";
            } else if (text.toLowerCase().includes("gan") || text.toLowerCase().includes("generative")) {
                return "N〈G⊕D〉\nG: Z 100 → D₁ 256 ρ → D₁ 512 ρ → D₀ 784 τ\nD: I → D₁ 512 ρ → D₁ 256 ρ → D₀ 1 σ\nL: G(Z)⊳D⟿BCE";
            } else if (text.toLowerCase().includes("transformer") || text.toLowerCase().includes("attention")) {
                return "N〈E⊕D〉\nE: I → [E → A{h:8} → N]×6\nD: I → [E → A{h:8} → N]×6 → D₀ V S";
            } else {
                return "N I → D₁ 128 ρ → D₁ 64 ρ → D₀ 10 → S";
            }
        }
        
        if (from === "gaiascript") {
            if (to === "javascript") {
                return `// Translated to JavaScript
const model = tf.sequential();
// Add appropriate layers based on the GaiaScript definition
model.compile({optimizer: 'adam', loss: 'categoricalCrossentropy'});`;
            } else if (to === "python") {
                return `# Translated to Python
model = Sequential()
# Add appropriate layers based on the GaiaScript definition
model.compile(optimizer='adam', loss='categorical_crossentropy')`;
            } else if (to === "react") {
                return `// Translated to React component
import React, { useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

const NeuralNetworkComponent = () => {
  useEffect(() => {
    // Initialize model based on GaiaScript definition
    const model = tf.sequential();
    // Add layers here
  }, []);

  return (
    <div className="neural-network-container">
      <h2>Neural Network Model</h2>
      <div className="visualization">
        {/* Network visualization would go here */}
      </div>
    </div>
  );
};

export default NeuralNetworkComponent;`;
            }
        }
        
        // Default response for translations we don't have examples for
        return `Translation from ${from} to ${to} not yet implemented for this input.`;
    }

    // Event listener for translate button
    translateBtn.addEventListener('click', function() {
        const text = sourceText.value;
        const from = sourceLanguage.value;
        const to = targetLanguage.value;
        
        if (text.trim() === "") {
            targetText.value = "Please enter text to translate.";
            return;
        }
        
        const translated = translateText(text, from, to);
        targetText.value = translated;
        console.log('Translation performed:', {from, to, text, translated});
    });
    
    // Debug output to console
    console.log("Translator script loaded");

    // Event listener for swap button
    swapBtn.addEventListener('click', function() {
        // Don't swap if source is auto-detect
        if (sourceLanguage.value === "auto") {
            return;
        }
        
        // Swap languages
        const tempLang = sourceLanguage.value;
        sourceLanguage.value = targetLanguage.value;
        targetLanguage.value = tempLang;
        
        // Swap text
        const tempText = sourceText.value;
        sourceText.value = targetText.value;
        targetText.value = tempText;
    });

    // Auto-detect language when typing
    sourceText.addEventListener('input', function() {
        if (sourceLanguage.value === "auto" && sourceText.value.trim() !== "") {
            const detected = detectLanguage(sourceText.value);
            // Just for UI feedback, don't actually change the dropdown
            sourceText.setAttribute('data-detected', detected);
        }
    });
});