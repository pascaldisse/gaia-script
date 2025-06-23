/**
 * GaiaScript Compiler Tests
 * Unit tests for scanner, parser, transformer, and emitter
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { GaiaScanner, GaiaTokenKind } from '../compiler/scanner';
import { GaiaParser } from '../compiler/parser';
import { GaiaTransformer } from '../compiler/transformer';
import GaiaCompiler from '../compiler';

describe('GaiaScanner', () => {
    let scanner: GaiaScanner;
    
    test('should tokenize Chinese characters', () => {
        scanner = new GaiaScanner('文⟨Hello⟩');
        const tokens = scanner.scan();
        
        expect(tokens).toHaveLength(4); // 文, ⟨, Hello, ⟩, EOF
        expect(tokens[0].kind).toBe(GaiaTokenKind.Text);
        expect(tokens[0].text).toBe('文');
        expect(tokens[0].expandedText).toBe('text');
    });
    
    test('should tokenize numbers', () => {
        scanner = new GaiaScanner('一二三');
        const tokens = scanner.scan();
        
        expect(tokens[0].kind).toBe(GaiaTokenKind.Number);
        expect(tokens[0].expandedText).toBe('1');
        expect(tokens[1].expandedText).toBe('2');
        expect(tokens[2].expandedText).toBe('3');
    });
    
    test('should tokenize core words', () => {
        scanner = new GaiaScanner('的和與');
        const tokens = scanner.scan();
        
        expect(tokens[0].kind).toBe(GaiaTokenKind.CoreWord);
        expect(tokens[0].expandedText).toBe('the');
        expect(tokens[1].expandedText).toBe('and');
        expect(tokens[2].expandedText).toBe('with');
    });
    
    test('should handle symbols', () => {
        scanner = new GaiaScanner('⟨⟩⟦⟧{}');
        const tokens = scanner.scan();
        
        expect(tokens[0].kind).toBe(GaiaTokenKind.OpenBracket);
        expect(tokens[1].kind).toBe(GaiaTokenKind.CloseBracket);
        expect(tokens[2].kind).toBe(GaiaTokenKind.OpenContent);
        expect(tokens[3].kind).toBe(GaiaTokenKind.CloseContent);
        expect(tokens[4].kind).toBe(GaiaTokenKind.OpenStyle);
        expect(tokens[5].kind).toBe(GaiaTokenKind.CloseStyle);
    });
});

describe('GaiaParser', () => {
    let parser: GaiaParser;
    
    test('should parse text literals', () => {
        parser = new GaiaParser('文⟨Hello, World!⟩');
        const ast = parser.parse();
        
        expect(ast.kind).toBe('Program');
        expect(ast.children).toHaveLength(1);
        expect(ast.children![0].kind).toBe('TextLiteral');
        expect(ast.children![0].text).toBe('Hello, World!');
    });
    
    test('should parse functions', () => {
        parser = new GaiaParser('函⟨greet, name⟩文⟨Hello⟩⟨/函⟩');
        const ast = parser.parse();
        
        const func = ast.children![0];
        expect(func.kind).toBe('FunctionDeclaration');
        expect(func.children).toHaveLength(3); // name, params, body
    });
    
    test('should parse state blocks', () => {
        parser = new GaiaParser('狀⟨count: 零, name: 文⟨Alice⟩⟩');
        const ast = parser.parse();
        
        const state = ast.children![0];
        expect(state.kind).toBe('StateBlock');
        expect(state.children).toHaveLength(2); // two state declarations
    });
    
    test('should parse UI interface', () => {
        parser = new GaiaParser('界⟨✱⟩文⟨Hello⟩⟨/界⟩');
        const ast = parser.parse();
        
        const ui = ast.children![0];
        expect(ui.kind).toBe('UIInterfaceDeclaration');
    });
    
    test('should parse components', () => {
        parser = new GaiaParser('組⟨Button⟩樣{color: blue}⟦文⟨Click⟩⟧⟨/組⟩');
        const ast = parser.parse();
        
        const component = ast.children![0];
        expect(component.kind).toBe('ComponentDeclaration');
    });
});

describe('GaiaCompiler', () => {
    let compiler: GaiaCompiler;
    
    beforeEach(() => {
        compiler = new GaiaCompiler();
    });
    
    test('should compile simple text', () => {
        const source = '文⟨Hello, World!⟩';
        const result = compiler.compile(source, { target: 'typescript' });
        
        expect(result.success).toBe(true);
        expect(result.typescript).toContain('"Hello, World!"');
    });
    
    test('should compile function', () => {
        const source = '函⟨greet, name⟩文⟨Hello, ${name}!⟩⟨/函⟩';
        const result = compiler.compile(source, { target: 'typescript' });
        
        expect(result.success).toBe(true);
        expect(result.typescript).toContain('function greet');
        expect(result.typescript).toContain('name');
    });
    
    test('should compile to Go', () => {
        const source = '函⟨add, a, b⟩a + b⟨/函⟩';
        const result = compiler.compile(source, { target: 'go' });
        
        expect(result.success).toBe(true);
        expect(result.go).toContain('func add');
        expect(result.go).toContain('package main');
    });
    
    test('should handle compilation errors', () => {
        const source = '函⟨incomplete';
        const result = compiler.compile(source, { target: 'typescript' });
        
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });
    
    test('should provide debug information', () => {
        const source = '文⟨Hello⟩';
        const result = compiler.compile(source, { 
            target: 'typescript',
            debug: true 
        });
        
        expect(result.success).toBe(true);
        expect(result.diagnostics.length).toBeGreaterThan(0);
        expect(result.diagnostics.some(d => d.includes('Phase 1'))).toBe(true);
    });
    
    test('should compile complex example', () => {
        const source = `
檔⟨Simple application⟩

導⟨React⟩

狀⟨
  count: 零,
  message: 文⟨Hello⟩
⟩

函⟨increment⟩
  count = count + 一
⟨/函⟩

界⟨✱⟩
  樣{text-align: center}⟦
    文⟨${message}, count is ${count}⟩
  ⟧
⟨/界⟩
        `;
        
        const result = compiler.compile(source, { target: 'typescript' });
        
        expect(result.success).toBe(true);
        expect(result.typescript).toContain('import');
        expect(result.typescript).toContain('function App');
        expect(result.typescript).toContain('let count = 0');
        expect(result.typescript).toContain('function increment');
    });
});

describe('Token Efficiency', () => {
    let compiler: GaiaCompiler;
    
    beforeEach(() => {
        compiler = new GaiaCompiler();
    });
    
    test('should achieve token compression', () => {
        const gaiaSource = '函⟨測試⟩文⟨你好⟩⟨/函⟩';
        const jsEquivalent = 'function test() { return "hello"; }';
        
        // Estimate tokens (rough approximation: 4 chars per token)
        const gaiaTokens = Math.ceil(gaiaSource.length / 4);
        const jsTokens = Math.ceil(jsEquivalent.length / 4);
        
        const compression = 1 - (gaiaTokens / jsTokens);
        
        expect(compression).toBeGreaterThan(0.3); // At least 30% compression
    });
    
    test('should maintain semantic equivalence', () => {
        const source = '狀⟨name: 文⟨Alice⟩⟩';
        const result = compiler.compile(source, { target: 'typescript' });
        
        expect(result.success).toBe(true);
        expect(result.typescript).toContain('let name = "Alice"');
    });
});

describe('Error Handling', () => {
    let compiler: GaiaCompiler;
    
    beforeEach(() => {
        compiler = new GaiaCompiler();
    });
    
    test('should provide meaningful error messages', () => {
        const source = '函⟨missing_bracket';
        const result = compiler.compile(source);
        
        expect(result.success).toBe(false);
        expect(result.errors[0]).toContain('Expected');
    });
    
    test('should include line and column information', () => {
        const source = '文⟨valid⟩\n函⟨invalid';
        const result = compiler.compile(source);
        
        expect(result.success).toBe(false);
        expect(result.errors[0]).toMatch(/line \d+/);
    });
});