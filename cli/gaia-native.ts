#!/usr/bin/env node

/**
 * GaiaScript Native CLI - Native Binary Compilation
 * Command-line interface for compiling GaiaScript to native binaries via Go
 */

import { program } from "commander";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname, basename, extname } from "path";
import { spawn } from "child_process";
import chalk from "chalk";
import GaiaCompiler from "../compiler";

interface NativeOptions {
    output?: string;
    debug?: boolean;
    optimize?: boolean;
    platform?: string;
    arch?: string;
}

function main() {
    program
        .name("gaia-native")
        .description("GaiaScript Native Compiler - Compile GaiaScript to native binaries")
        .version("1.0.0")
        .argument("<input>", "GaiaScript input file")
        .option("-o, --output <path>", "output binary path")
        .option("-d, --debug", "enable debug output", false)
        .option("--optimize", "enable optimizations", false)
        .option("--platform <platform>", "target platform (linux, darwin, windows)")
        .option("--arch <arch>", "target architecture (amd64, arm64)")
        .action(async (input: string, options: NativeOptions) => {
            try {
                await compileNative(input, options);
            } catch (error) {
                console.error(chalk.red("Native compilation failed:"));
                console.error(error instanceof Error ? error.message : String(error));
                process.exit(1);
            }
        });

    program.parse();
}

async function compileNative(inputPath: string, options: NativeOptions): Promise<void> {
    const resolvedInput = resolve(inputPath);
    
    if (!existsSync(resolvedInput)) {
        throw new Error(`Input file not found: ${inputPath}`);
    }

    if (options.debug) {
        console.log(chalk.blue(`Native compilation: ${resolvedInput}`));
    }

    // Step 1: Compile GaiaScript to Go
    if (options.debug) {
        console.log(chalk.blue("Step 1: Compiling GaiaScript to Go..."));
    }

    const source = readFileSync(resolvedInput, 'utf-8');
    const compiler = new GaiaCompiler();
    const result = compiler.compile(source, { 
        target: 'go',
        debug: options.debug 
    });

    if (!result.success || !result.go) {
        throw new Error("Failed to compile GaiaScript to Go");
    }

    // Step 2: Write Go source file
    const baseName = basename(inputPath, extname(inputPath));
    const goPath = `${baseName}.go`;
    writeFileSync(goPath, result.go, 'utf-8');

    if (options.debug) {
        console.log(chalk.green(`✓ Generated Go source: ${goPath}`));
    }

    // Step 3: Compile Go to native binary
    if (options.debug) {
        console.log(chalk.blue("Step 2: Compiling Go to native binary..."));
    }

    const outputPath = options.output || getDefaultBinaryPath(baseName, options.platform);
    await compileGoToBinary(goPath, outputPath, options);

    console.log(chalk.green(`✓ Native binary created: ${outputPath}`));

    // Clean up intermediate Go file unless debug mode
    if (!options.debug) {
        const { unlinkSync } = await import('fs');
        unlinkSync(goPath);
    }
}

function getDefaultBinaryPath(baseName: string, platform?: string): string {
    const extension = platform === 'windows' ? '.exe' : '';
    return `${baseName}${extension}`;
}

async function compileGoToBinary(goPath: string, outputPath: string, options: NativeOptions): Promise<void> {
    return new Promise((resolve, reject) => {
        const args = ['build'];
        
        // Add output flag
        args.push('-o', outputPath);
        
        // Add optimization flags
        if (options.optimize) {
            args.push('-ldflags', '-s -w'); // Strip debugging info
        }
        
        // Add Go file
        args.push(goPath);
        
        // Set environment variables for cross-compilation
        const env = { ...process.env };
        if (options.platform) {
            env.GOOS = options.platform;
        }
        if (options.arch) {
            env.GOARCH = options.arch;
        }

        if (options.debug) {
            console.log(chalk.gray(`Running: go ${args.join(' ')}`));
            if (options.platform || options.arch) {
                console.log(chalk.gray(`Environment: GOOS=${env.GOOS} GOARCH=${env.GOARCH}`));
            }
        }

        const goProcess = spawn('go', args, { 
            stdio: options.debug ? 'inherit' : 'pipe',
            env 
        });

        let stderr = '';
        
        if (!options.debug) {
            goProcess.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
        }

        goProcess.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Go compilation failed with exit code ${code}\n${stderr}`));
            }
        });

        goProcess.on('error', (error) => {
            reject(new Error(`Failed to run go build: ${error.message}`));
        });
    });
}

// Check if Go is installed
async function checkGoInstallation(): Promise<void> {
    return new Promise((resolve, reject) => {
        const goProcess = spawn('go', ['version'], { stdio: 'pipe' });
        
        goProcess.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error('Go is not installed or not in PATH. Please install Go to use native compilation.'));
            }
        });
        
        goProcess.on('error', () => {
            reject(new Error('Go is not installed or not in PATH. Please install Go to use native compilation.'));
        });
    });
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
    // Check Go installation before proceeding
    checkGoInstallation()
        .then(() => main())
        .catch((error) => {
            console.error(chalk.red(error.message));
            console.error(chalk.yellow('Please install Go from https://golang.org/dl/'));
            process.exit(1);
        });
}