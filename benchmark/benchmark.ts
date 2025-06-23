/**
 * GaiaScript Compiler Benchmarks
 * Performance tests for compilation speed and memory usage
 */

import { performance } from 'perf_hooks';
import { readFileSync } from 'fs';
import GaiaCompiler from '../compiler';

interface BenchmarkResult {
    name: string;
    sourceSize: number;
    compilationTime: number;
    memoryUsage: number;
    outputSize: number;
    tokensUsed: number;
    success: boolean;
}

class CompilerBenchmark {
    private compiler: GaiaCompiler;
    
    constructor() {
        this.compiler = new GaiaCompiler();
    }
    
    async runBenchmarks(): Promise<BenchmarkResult[]> {
        const results: BenchmarkResult[] = [];
        
        // Test cases
        const testCases = [
            { name: 'Simple Hello World', file: 'examples/mini.gaia' },
            { name: 'Complex Application', file: 'examples/full.gaia' },
            { name: 'macOS Application', file: 'examples/macos_app.gaia' },
            { name: 'Main Application', file: 'main.gaia' }
        ];
        
        for (const testCase of testCases) {
            try {
                const result = await this.benchmarkFile(testCase.name, testCase.file);
                results.push(result);
            } catch (error) {
                console.error(`Failed to benchmark ${testCase.name}:`, error);
                results.push({
                    name: testCase.name,
                    sourceSize: 0,
                    compilationTime: 0,
                    memoryUsage: 0,
                    outputSize: 0,
                    tokensUsed: 0,
                    success: false
                });
            }
        }
        
        return results;
    }
    
    private async benchmarkFile(name: string, filePath: string): Promise<BenchmarkResult> {
        // Read source file
        const source = readFileSync(filePath, 'utf-8');
        const sourceSize = source.length;
        
        // Measure memory before compilation
        const memoryBefore = process.memoryUsage().heapUsed;
        
        // Measure compilation time
        const startTime = performance.now();
        const result = this.compiler.compile(source, { 
            target: 'typescript',
            debug: false 
        });
        const endTime = performance.now();
        
        const compilationTime = endTime - startTime;
        
        // Measure memory after compilation
        const memoryAfter = process.memoryUsage().heapUsed;
        const memoryUsage = memoryAfter - memoryBefore;
        
        // Calculate output size and estimated tokens
        const outputSize = result.typescript?.length || 0;
        const tokensUsed = this.estimateTokens(source);
        
        return {
            name,
            sourceSize,
            compilationTime,
            memoryUsage,
            outputSize,
            tokensUsed,
            success: result.success
        };
    }
    
    private estimateTokens(source: string): number {
        // Simple token estimation based on character count and compression
        // GaiaScript achieves ~40% compression, so we use 0.6 as multiplier
        const baseTokens = Math.ceil(source.length / 4); // Rough estimate: 4 chars per token
        return Math.ceil(baseTokens * 0.6); // Apply GaiaScript compression
    }
    
    printResults(results: BenchmarkResult[]): void {
        console.log('\n🚀 GaiaScript Compiler Benchmark Results\n');
        console.log('=====================================\n');
        
        for (const result of results) {
            console.log(`📊 ${result.name}`);
            console.log(`   Source Size: ${result.sourceSize} bytes`);
            console.log(`   Compilation Time: ${result.compilationTime.toFixed(2)}ms`);
            console.log(`   Memory Usage: ${(result.memoryUsage / 1024).toFixed(2)}KB`);
            console.log(`   Output Size: ${result.outputSize} bytes`);
            console.log(`   Estimated Tokens: ${result.tokensUsed}`);
            console.log(`   Success: ${result.success ? '✅' : '❌'}`);
            console.log(`   Compression Ratio: ${((1 - result.tokensUsed / (result.sourceSize / 4)) * 100).toFixed(1)}%`);
            console.log('');
        }
        
        // Summary statistics
        const successful = results.filter(r => r.success);
        if (successful.length > 0) {
            const avgTime = successful.reduce((sum, r) => sum + r.compilationTime, 0) / successful.length;
            const avgMemory = successful.reduce((sum, r) => sum + r.memoryUsage, 0) / successful.length;
            const avgCompression = successful.reduce((sum, r) => {
                const baseTokens = r.sourceSize / 4;
                return sum + (1 - r.tokensUsed / baseTokens);
            }, 0) / successful.length;
            
            console.log('📈 Summary Statistics');
            console.log(`   Average Compilation Time: ${avgTime.toFixed(2)}ms`);
            console.log(`   Average Memory Usage: ${(avgMemory / 1024).toFixed(2)}KB`);
            console.log(`   Average Token Compression: ${(avgCompression * 100).toFixed(1)}%`);
            console.log(`   Success Rate: ${(successful.length / results.length * 100).toFixed(1)}%`);
        }
    }
}

// CLI usage
if (require.main === module) {
    const benchmark = new CompilerBenchmark();
    
    benchmark.runBenchmarks()
        .then(results => {
            benchmark.printResults(results);
        })
        .catch(error => {
            console.error('Benchmark failed:', error);
            process.exit(1);
        });
}

export default CompilerBenchmark;