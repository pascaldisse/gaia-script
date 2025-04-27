// Gaia Script React Compiler Helper
// This script extends the standard build.js to properly handle React component output

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check for command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node build_react.js <input.gaia> --output=<output_dir>');
  process.exit(1);
}

const inputFile = args[0];
let outputDir = './build';

// Parse output argument if provided
args.forEach(arg => {
  if (arg.startsWith('--output=')) {
    outputDir = arg.replace('--output=', '');
  }
});

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file ${inputFile} not found`);
  process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get the base name of the input file (without extension)
const baseName = path.basename(inputFile, path.extname(inputFile));

// Prepare output paths
const reactOutputPath = path.join(outputDir, `${baseName}_react`);

console.log(`Compiling ${inputFile} to React...`);

try {
  // First make sure the directory exists
  fs.mkdirSync(reactOutputPath, { recursive: true });

  // Use the universal_compiler with React as the target
  const rootDir = path.resolve(__dirname, '../../');
  const command = `cd "${rootDir}" && ./universal_compile.sh -f react -o "${outputDir}" "${inputFile}"`;
  
  console.log(`Executing: ${command}`);
  const output = execSync(command, { encoding: 'utf-8' });
  console.log(output);

  // Check if the React output was generated
  if (fs.existsSync(reactOutputPath)) {
    console.log(`React output generated at: ${reactOutputPath}`);
    
    // Install dependencies if package.json exists
    const packageJsonPath = path.join(reactOutputPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      console.log('Installing React dependencies...');
      
      try {
        execSync(`cd "${reactOutputPath}" && npm install`, { stdio: 'inherit' });
        console.log('Dependencies installed successfully');
      } catch (error) {
        console.error('Error installing dependencies:', error.message);
      }
    }
    
    console.log(`\nTo run the React application:`);
    console.log(`  cd ${reactOutputPath}`);
    console.log(`  npm start`);
  } else {
    throw new Error('React output directory was not created');
  }

  console.log('Compilation completed successfully!');
} catch (error) {
  console.error('Compilation failed:', error.message);
  process.exit(1);
}
