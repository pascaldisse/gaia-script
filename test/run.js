#!/usr/bin/env node

/**
 * GaiaScript Test Runner
 * 
 * Command-line interface for running the GaiaScript testing environment
 */

const fs = require('fs');
const path = require('path');
const { 
  GaiaParser, 
  GaiaInterpreter, 
  GaiaCompiler,
  GaiaMutator,
  GaiaUISimulator,
  GaiaTestRunner,
  GaiaEvolution,
  config
} = require('./index');

// Parse command line arguments
const args = process.argv.slice(2);
const options = parseArgs(args);

// Main function
async function main() {
  try {
    console.log('GaiaScript Testing Environment');
    console.log('-----------------------------');
    
    // Handle different commands
    switch (options.command) {
      case 'test':
        await runTests();
        break;
        
      case 'parse':
        runParser();
        break;
        
      case 'compile':
        runCompiler();
        break;
        
      case 'execute':
        runInterpreter();
        break;
        
      case 'mutate':
        runMutator();
        break;
        
      case 'evolve':
        await runEvolution();
        break;
        
      case 'ui':
        await runUITest();
        break;
        
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

/**
 * Run tests
 */
async function runTests() {
  if (!options.file) {
    throw new Error('Test file required. Use --file option.');
  }
  
  console.log(`Running tests from ${options.file}`);
  
  const testRunner = new GaiaTestRunner();
  const results = await testRunner.runTests(options.file, {
    target: options.target,
    ui: options.ui === 'true'
  });
  
  // Print results
  console.log(`\nTest Results: ${results.passed}/${results.total} passed`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Skipped: ${results.skipped}`);
  
  // Print details for failed tests
  if (results.failed > 0) {
    console.log('\nFailed Tests:');
    
    for (const test of results.tests) {
      if (test.status === 'failed') {
        console.log(`- ${test.name}: ${test.error}`);
      }
    }
  }
  
  // Generate report if requested
  if (options.report) {
    const report = {
      timestamp: new Date().toISOString(),
      results
    };
    
    fs.writeFileSync(options.report, JSON.stringify(report, null, 2));
    console.log(`\nTest report written to ${options.report}`);
  }
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

/**
 * Run parser on input
 */
function runParser() {
  if (!options.input && !options.file) {
    throw new Error('Input required. Use --input or --file option.');
  }
  
  const code = options.input || fs.readFileSync(options.file, 'utf-8');
  
  console.log('Parsing GaiaScript code...');
  
  const parser = new GaiaParser();
  const startTime = performance.now();
  const ast = parser.parse(code);
  const endTime = performance.now();
  
  console.log(`Parsed in ${(endTime - startTime).toFixed(2)}ms`);
  
  if (options.output) {
    fs.writeFileSync(options.output, JSON.stringify(ast, null, 2));
    console.log(`AST written to ${options.output}`);
  } else {
    console.log('AST:', JSON.stringify(ast, null, 2));
  }
}

/**
 * Run compiler on input
 */
function runCompiler() {
  if (!options.input && !options.file) {
    throw new Error('Input required. Use --input or --file option.');
  }
  
  const code = options.input || fs.readFileSync(options.file, 'utf-8');
  const target = options.target || 'js';
  
  console.log(`Compiling GaiaScript code to ${target}...`);
  
  const compiler = new GaiaCompiler();
  const result = compiler.compile(code, target);
  
  if (!result.success) {
    throw new Error(`Compilation failed: ${result.error}`);
  }
  
  console.log(`Compiled in ${result.compileTime.toFixed(2)}ms`);
  
  if (options.output) {
    fs.writeFileSync(options.output, result.result);
    console.log(`Compiled output written to ${options.output}`);
  } else {
    console.log('Compiled output:', result.result);
  }
}

/**
 * Run interpreter on input
 */
function runInterpreter() {
  if (!options.input && !options.file) {
    throw new Error('Input required. Use --input or --file option.');
  }
  
  const code = options.input || fs.readFileSync(options.file, 'utf-8');
  
  console.log('Executing GaiaScript code...');
  
  const interpreter = new GaiaInterpreter();
  const result = interpreter.execute(code);
  
  if (!result.success) {
    throw new Error(`Execution failed: ${result.error}`);
  }
  
  console.log(`Executed in ${result.executionTime.toFixed(2)}ms`);
  
  if (options.output) {
    fs.writeFileSync(options.output, JSON.stringify(result.result, null, 2));
    console.log(`Execution result written to ${options.output}`);
  } else {
    console.log('Execution result:', JSON.stringify(result.result, null, 2));
  }
}

/**
 * Run mutator on input
 */
function runMutator() {
  if (!options.input && !options.file) {
    throw new Error('Input required. Use --input or --file option.');
  }
  
  const code = options.input || fs.readFileSync(options.file, 'utf-8');
  const rate = options.rate ? parseFloat(options.rate) : config.mutationRate;
  
  console.log(`Mutating GaiaScript code (rate: ${rate})...`);
  
  const mutator = new GaiaMutator();
  const mutated = mutator.mutate(code, { rate });
  
  if (options.output) {
    fs.writeFileSync(options.output, mutated);
    console.log(`Mutated code written to ${options.output}`);
  } else {
    console.log('Mutated code:', mutated);
  }
}

/**
 * Run evolution on input
 */
async function runEvolution() {
  if (!options.input && !options.file) {
    throw new Error('Input required. Use --input or --file option.');
  }
  
  if (!options.tests) {
    throw new Error('Test file required. Use --tests option.');
  }
  
  const code = options.input || fs.readFileSync(options.file, 'utf-8');
  const generations = options.generations ? parseInt(options.generations, 10) : 10;
  
  console.log(`Evolving GaiaScript code for ${generations} generations...`);
  
  const evolution = new GaiaEvolution();
  evolution.initialize(code, options.tests, {
    populationSize: options.population ? parseInt(options.population, 10) : config.populationSize,
    mutationRate: options.rate ? parseFloat(options.rate) : config.mutationRate,
    crossoverRate: options.crossover ? parseFloat(options.crossover) : config.crossoverRate
  });
  
  const results = await evolution.evolve(generations);
  
  console.log(`Evolution completed with best fitness: ${results.bestFitness}`);
  
  if (options.output) {
    fs.writeFileSync(options.output, results.bestCode);
    console.log(`Best code written to ${options.output}`);
  } else {
    console.log('Best code:', results.bestCode);
  }
  
  if (options.report) {
    fs.writeFileSync(options.report, JSON.stringify(results, null, 2));
    console.log(`Evolution report written to ${options.report}`);
  }
}

/**
 * Run UI test on input
 */
async function runUITest() {
  if (!options.input && !options.file) {
    throw new Error('Input required. Use --input or --file option.');
  }
  
  const code = options.input || fs.readFileSync(options.file, 'utf-8');
  
  console.log('Running UI test on GaiaScript code...');
  
  const simulator = new GaiaUISimulator();
  
  try {
    const result = await simulator.renderUI(code);
    
    if (!result.success) {
      throw new Error(`UI rendering failed: ${result.error}`);
    }
    
    console.log('UI rendered successfully');
    
    if (options.selector && options.action) {
      console.log(`Simulating ${options.action} on ${options.selector}...`);
      
      const interactionResult = await simulator.simulateInteraction(
        options.selector, 
        options.action,
        { text: options.text }
      );
      
      if (!interactionResult.success) {
        throw new Error(`UI interaction failed: ${interactionResult.error}`);
      }
      
      console.log('UI interaction succeeded');
      
      if (options.output) {
        fs.writeFileSync(options.output, JSON.stringify({
          dom: interactionResult.dom,
          logs: interactionResult.logs
        }, null, 2));
        console.log(`UI test results written to ${options.output}`);
      } else {
        console.log('DOM:', JSON.stringify(interactionResult.dom, null, 2));
        console.log('Logs:', interactionResult.logs);
      }
    } else if (options.output) {
      fs.writeFileSync(options.output, JSON.stringify({
        dom: result.dom,
        logs: result.logs
      }, null, 2));
      console.log(`UI test results written to ${options.output}`);
    } else {
      console.log('DOM:', JSON.stringify(result.dom, null, 2));
      console.log('Logs:', result.logs);
    }
  } finally {
    // Clean up
    await simulator.cleanup();
  }
}

/**
 * Parse command line arguments
 * @param {Array} args - Command line arguments
 * @returns {Object} Parsed options
 */
function parseArgs(args) {
  const options = {
    command: 'help',
  };
  
  // Command
  if (args.length > 0 && !args[0].startsWith('--')) {
    options.command = args[0];
    args = args.slice(1);
  }
  
  // Options
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const option = arg.substring(2);
      
      // Handle --option=value format
      if (option.includes('=')) {
        const [key, value] = option.split('=');
        options[key] = value;
      }
      // Handle --option value format
      else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        options[option] = args[i + 1];
        i++;
      }
      // Handle --flag format
      else {
        options[option] = 'true';
      }
    }
  }
  
  return options;
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
Usage: node run.js [command] [options]

Commands:
  test     Run tests on GaiaScript code
  parse    Parse GaiaScript code
  compile  Compile GaiaScript code
  execute  Execute GaiaScript code
  mutate   Apply mutations to GaiaScript code
  evolve   Evolve GaiaScript code with genetic algorithms
  ui       Run UI tests on GaiaScript code
  help     Show this help

Options:
  --file=<path>            Path to input file
  --input=<code>           GaiaScript code input
  --output=<path>          Path to output file
  --report=<path>          Path to report file
  --target=<js|wasm|llvm>  Compilation target
  --ui=<true|false>        Include UI tests
  --rate=<number>          Mutation rate
  --generations=<number>   Number of generations for evolution
  --population=<number>    Population size for evolution
  --crossover=<number>     Crossover rate for evolution
  --tests=<path>           Path to test file for evolution
  --selector=<selector>    CSS selector for UI interaction
  --action=<action>        Action for UI interaction (click, input, hover)
  --text=<text>            Text for input UI interaction
  
Examples:
  node run.js test --file=examples/basic-tests.gaia
  node run.js parse --input="N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S"
  node run.js compile --file=main.gaia --target=js --output=build/output.js
  node run.js execute --file=main.gaia
  node run.js mutate --file=main.gaia --rate=0.1 --output=mutated.gaia
  node run.js evolve --file=main.gaia --tests=examples/basic-tests.gaia --generations=20
  node run.js ui --file=main.gaia --selector="button.play" --action=click
`);
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});