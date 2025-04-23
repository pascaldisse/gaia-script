#!/usr/bin/env node

/**
 * GaiaScript Test Environment Setup
 * 
 * Sets up the GaiaScript testing environment by:
 * 1. Creating necessary directories
 * 2. Setting up example tests
 * 3. Making run.js executable
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Base directory
const baseDir = __dirname;

// Directories to create
const directories = [
  'examples',
  'reports',
  'outputs',
];

// Make run.js executable
function makeExecutable(filePath) {
  try {
    fs.chmodSync(filePath, '755');
    console.log(`Made ${filePath} executable`);
  } catch (error) {
    console.error(`Failed to make ${filePath} executable:`, error.message);
  }
}

// Create directories
function createDirectories() {
  for (const dir of directories) {
    const dirPath = path.join(baseDir, dir);
    
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
      } catch (error) {
        console.error(`Failed to create directory ${dirPath}:`, error.message);
      }
    } else {
      console.log(`Directory already exists: ${dirPath}`);
    }
  }
}

// Install dependencies
function installDependencies() {
  try {
    console.log('Installing dependencies...');
    execSync('npm install', { cwd: baseDir, stdio: 'inherit' });
    console.log('Dependencies installed successfully');
  } catch (error) {
    console.error('Failed to install dependencies:', error.message);
  }
}

// Validate installation
function validateInstallation() {
  let success = true;
  
  // Check if required files exist
  const requiredFiles = [
    'index.js',
    'run.js',
    'package.json',
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(baseDir, file);
    
    if (!fs.existsSync(filePath)) {
      console.error(`Required file not found: ${filePath}`);
      success = false;
    }
  }
  
  // Check if test examples exist
  const examplesDir = path.join(baseDir, 'examples');
  
  if (fs.existsSync(examplesDir)) {
    const examples = fs.readdirSync(examplesDir);
    
    if (examples.length === 0) {
      console.warn('No test examples found in examples directory');
    } else {
      console.log(`Found ${examples.length} test examples`);
    }
  }
  
  return success;
}

// Main function
function main() {
  console.log('Setting up GaiaScript Test Environment...');
  
  createDirectories();
  makeExecutable(path.join(baseDir, 'run.js'));
  installDependencies();
  
  const success = validateInstallation();
  
  if (success) {
    console.log('\nGaiaScript Test Environment setup completed successfully!');
    console.log('\nYou can now run tests with:');
    console.log('  node run.js test --file=examples/basic-tests.gaia');
    console.log('\nOr see all available commands with:');
    console.log('  node run.js help');
  } else {
    console.error('\nGaiaScript Test Environment setup completed with errors.');
    console.error('Please check the logs above and fix any issues before running tests.');
  }
}

// Run main function
main();