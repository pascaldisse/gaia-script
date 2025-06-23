#!/usr/bin/env node

/**
 * GaiaScript CLI - Compilation Tool
 * Command-line interface for compiling GaiaScript to TypeScript/Go
 */

import { program } from "commander";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, extname, basename } from "path";
import chalk from "chalk";
import GaiaCompiler, { CompileOptions } from "../compiler";

interface CLIOptions {
    target?: 'typescript' | 'go' | 'javascript';
    output?: string;
    debug?: boolean;
    sourceMap?: boolean;
    watch?: boolean;
}

function main() {
    program
        .name("gaia-compile")
        .description("GaiaScript Compiler - Compile GaiaScript to TypeScript/Go")
        .version("1.0.0")
        .argument("<input>", "GaiaScript input file")
        .option("-t, --target <target>", "compilation target (typescript, go, javascript)", "typescript")
        .option("-o, --output <path>", "output file path")
        .option("-d, --debug", "enable debug output", false)
        .option("-s, --source-map", "generate source maps", false)
        .option("-w, --watch", "watch for file changes", false)
        .action(async (input: string, options: CLIOptions) => {
            try {
                await compileFile(input, options);
            } catch (error) {
                console.error(chalk.red("Compilation failed:"));
                console.error(error instanceof Error ? error.message : String(error));
                process.exit(1);
            }
        });

    program
        .command("init")
        .description("Initialize a new GaiaScript project")
        .action(() => {
            initProject();
        });

    program
        .command("help")
        .description("Show detailed help")
        .action(() => {
            console.log(GaiaCompiler.help());
        });

    program.parse();
}

async function compileFile(inputPath: string, options: CLIOptions): Promise<void> {
    const resolvedInput = resolve(inputPath);
    
    if (!existsSync(resolvedInput)) {
        throw new Error(`Input file not found: ${inputPath}`);
    }

    if (options.debug) {
        console.log(chalk.blue(`Compiling: ${resolvedInput}`));
        console.log(chalk.blue(`Target: ${options.target}`));
    }

    // Read source file
    const source = readFileSync(resolvedInput, 'utf-8');
    
    // Determine output path
    const outputPath = options.output || getDefaultOutputPath(inputPath, options.target!);
    
    // Compile options
    const compileOptions: CompileOptions = {
        target: options.target,
        outputPath,
        debug: options.debug,
        sourceMap: options.sourceMap
    };

    // Compile
    const compiler = new GaiaCompiler();
    const result = await compiler.compileToFile(source, outputPath, compileOptions);

    // Handle results
    if (result.success) {
        // Write output file
        let outputContent = "";
        switch (options.target) {
            case 'typescript':
                outputContent = result.typescript || "";
                break;
            case 'go':
                outputContent = result.go || "";
                break;
            case 'javascript':
                outputContent = result.javascript || "";
                break;
        }

        if (outputContent) {
            writeFileSync(outputPath, outputContent, 'utf-8');
            console.log(chalk.green(`✓ Compiled successfully: ${outputPath}`));
        }

        // Show diagnostics if debug mode
        if (options.debug && result.diagnostics.length > 0) {
            console.log(chalk.yellow("\nDiagnostics:"));
            result.diagnostics.forEach(diagnostic => {
                console.log(chalk.gray(`  ${diagnostic}`));
            });
        }

    } else {
        console.error(chalk.red("✗ Compilation failed"));
        
        if (result.errors.length > 0) {
            console.error(chalk.red("\nErrors:"));
            result.errors.forEach(error => {
                console.error(chalk.red(`  ${error}`));
            });
        }

        if (result.diagnostics.length > 0) {
            console.error(chalk.yellow("\nDiagnostics:"));
            result.diagnostics.forEach(diagnostic => {
                console.error(chalk.gray(`  ${diagnostic}`));
            });
        }

        process.exit(1);
    }

    // Watch mode
    if (options.watch) {
        console.log(chalk.blue(`Watching ${inputPath} for changes...`));
        const { watch } = await import('fs');
        
        watch(resolvedInput, (eventType) => {
            if (eventType === 'change') {
                console.log(chalk.yellow(`File changed, recompiling...`));
                compileFile(inputPath, { ...options, watch: false }).catch(console.error);
            }
        });

        // Keep process alive
        process.stdin.resume();
    }
}

function getDefaultOutputPath(inputPath: string, target: string): string {
    const baseName = basename(inputPath, extname(inputPath));
    const extension = getExtensionForTarget(target);
    return `${baseName}.${extension}`;
}

function getExtensionForTarget(target: string): string {
    switch (target) {
        case 'typescript':
            return 'ts';
        case 'go':
            return 'go';
        case 'javascript':
            return 'js';
        default:
            return 'out';
    }
}

function initProject(): void {
    const packageJson = {
        name: "my-gaiascript-project",
        version: "1.0.0",
        description: "GaiaScript Application",
        main: "main.gaia",
        scripts: {
            build: "gaia-compile main.gaia",
            "build:go": "gaia-compile --target go main.gaia",
            "build:js": "gaia-compile --target javascript main.gaia",
            dev: "gaia-compile --watch --debug main.gaia"
        },
        dependencies: {
            "gaiascript-compiler": "^1.0.0"
        }
    };

    const mainGaia = `檔⟨
  GaiaScript Application
  This is a simple example demonstrating GaiaScript syntax
⟩

導⟨UI, Utils, System⟩

狀⟨
  title: 文⟨Hello, GaiaScript!⟩,
  count: 零
⟩

函⟨increment⟩
  count = count + 一
⟨/函⟩

界⟨✱⟩
  樣{
    font-family: Arial, sans-serif;
    text-align: center;
    padding: 20px;
  }⟦
    文⟨\${title}⟩
    文⟨Count: \${count}⟩
    樣{
      background: blue;
      color: white;
      padding: 10px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }⟦
      文⟨Click me!⟩
    ⟧
  ⟧
⟨/界⟩`;

    try {
        writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        writeFileSync('main.gaia', mainGaia);
        
        console.log(chalk.green("✓ GaiaScript project initialized!"));
        console.log(chalk.blue("\nFiles created:"));
        console.log(chalk.gray("  package.json"));
        console.log(chalk.gray("  main.gaia"));
        console.log(chalk.blue("\nNext steps:"));
        console.log(chalk.gray("  npm install"));
        console.log(chalk.gray("  npm run build"));
        console.log(chalk.gray("  npm run dev"));
        
    } catch (error) {
        console.error(chalk.red("Failed to initialize project:"));
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error(chalk.red('Unhandled rejection:'), error);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error(chalk.red('Uncaught exception:'), error);
    process.exit(1);
});

if (require.main === module) {
    main();
}