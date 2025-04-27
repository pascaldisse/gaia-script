#!/bin/bash

# GaiaScript Installer
# This script installs GaiaScript on Unix-based systems (macOS, Linux)

echo "GaiaScript Installer"
echo "===================="

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js is required but not installed. Installing..."
    
    # Detect OS
    if [[ "$(uname)" == "Darwin" ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install node
        else
            echo "Homebrew not found. Please install Homebrew first: https://brew.sh"
            echo "Or install Node.js manually: https://nodejs.org"
            exit 1
        fi
    elif [[ -f /etc/debian_version ]]; then
        # Debian/Ubuntu
        sudo apt-get update
        sudo apt-get install -y nodejs npm
    elif [[ -f /etc/redhat-release ]]; then
        # CentOS/RHEL/Fedora
        sudo yum install -y nodejs npm
    else
        echo "Please install Node.js manually: https://nodejs.org"
        exit 1
    fi
fi

# Create installation directory
INSTALL_DIR="$HOME/.gaiascript"
echo "Installing to: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

# Copy files
cp gaia "$INSTALL_DIR/"
cp pkg.gaia "$INSTALL_DIR/"
cp main.gaia "$INSTALL_DIR/"
cp README.md "$INSTALL_DIR/"
cp -r docs "$INSTALL_DIR/"

# Make executable
chmod +x "$INSTALL_DIR/gaia"

# Create symlink in PATH
if [[ "$(uname)" == "Darwin" ]]; then
    # macOS
    LINK_DIR="/usr/local/bin"
else
    # Linux
    LINK_DIR="$HOME/.local/bin"
    mkdir -p "$LINK_DIR"
fi

# Create symlink (if directory is in PATH)
ln -sf "$INSTALL_DIR/gaia" "$LINK_DIR/gaia"

echo ""
echo "GaiaScript installed successfully!"
echo "Run 'gaia --help' to get started"
echo "Or try 'gaia run main.gaia' to run the default example"