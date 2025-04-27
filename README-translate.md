# GaiaScript Translator CLI

A command-line tool for translating between GaiaScript, natural language, and various programming languages.

## Overview

GaiaScript Translator CLI automatically detects the input language and translates between:

- Natural language ↔ GaiaScript
- JavaScript ↔ GaiaScript  
- Python ↔ GaiaScript
- GaiaScript → React

## Installation

The translator is already installed in your Gaia environment. The executable is located at:

```
/Users/pascaldisse/gaia/.gaia/translate
```

You may want to add this directory to your PATH for easier access.

## Usage

```
translate [options] <text>
```

### Options

- `-f, --from <language>` - Source language (auto, natural, gaiascript, javascript, python)
- `-t, --to <language>` - Target language (gaiascript, natural, javascript, python, react)
- `-h, --help` - Show help message

### Examples

Translate from natural language to GaiaScript (default target):
```
translate "Create a neural network with 2 layers"
```

Translate from JavaScript to GaiaScript:
```
translate -f javascript "const model = tf.sequential();"
```

Translate from GaiaScript to Python:
```
translate -f gaiascript -t python "N I → D₁ 128 ρ → D₀ 10 → S"
```

## Symbol Reference

GaiaScript uses a concise symbolic notation for machine learning:

- `N` - Neural Network
- `I` - Input layer
- `D₁` - Dense layer with ReLU activation
- `D₀` - Dense layer with Softmax activation
- `C₁` - Convolutional layer with ReLU activation
- `P` - Pooling layer
- `F` - Flatten layer
- `ρ` - ReLU activation
- `σ` - Sigmoid activation
- `τ` - Tanh activation
- `→` - Connection between layers
- `⊕` - Network composition
- `〈...〉` - Group notation

## Adding Custom Translations

To add your own translations, edit the `translations` object in the `/Users/pascaldisse/gaia/.gaia/translate.js` file.

## Contributing

Expand the translator's capabilities by adding more examples and improving language detection.