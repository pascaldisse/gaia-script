/**
 * GaiaScript Emitter - Code Generation
 * Emits TypeScript and Go code from transformed AST
 */

import * as ts from "../TypeScript/src/compiler/types";
import { createPrinter, EmitHint, NewLineKind } from "../TypeScript/src/compiler/utilities";
import { createSourceFile, ScriptTarget } from "../TypeScript/src/compiler/utilities";

export interface EmitResult {
    typescript?: string;
    go?: string;
    javascript?: string;
    errors: string[];
}

export class GaiaEmitter {
    private printer: ts.Printer;
    
    constructor() {
        this.printer = createPrinter({
            removeComments: false,
            newLine: NewLineKind.LineFeed,
        });
    }
    
    emit(sourceFile: ts.SourceFile, target: 'typescript' | 'go' | 'javascript' = 'typescript'): EmitResult {
        const errors: string[] = [];
        let result: EmitResult = { errors };
        
        try {
            switch (target) {
                case 'typescript':
                    result.typescript = this.emitTypeScript(sourceFile);
                    break;
                case 'go':
                    result.go = this.emitGo(sourceFile);
                    break;
                case 'javascript':
                    result.javascript = this.emitJavaScript(sourceFile);
                    break;
            }
        } catch (error) {
            errors.push(`Emission error: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        return result;
    }
    
    private emitTypeScript(sourceFile: ts.SourceFile): string {
        // Use TypeScript's built-in printer to emit clean TypeScript code
        const dummySourceFile = createSourceFile(
            "output.ts",
            "",
            ScriptTarget.ES2020,
            true
        );
        
        return this.printer.printFile(sourceFile);
    }
    
    private emitJavaScript(sourceFile: ts.SourceFile): string {
        // For now, emit TypeScript and let the user compile with tsc
        // In a full implementation, we'd use TypeScript's transpiler
        const tsCode = this.emitTypeScript(sourceFile);
        
        // Add a comment indicating this should be compiled
        return `// This TypeScript code should be compiled with: tsc --target ES2020\n\n${tsCode}`;
    }
    
    private emitGo(sourceFile: ts.SourceFile): string {
        // Convert TypeScript AST to Go code
        let goCode = "package main\n\n";
        goCode += "import (\n";
        goCode += '\t"fmt"\n';
        goCode += '\t"encoding/json"\n';
        goCode += ")\n\n";
        
        // Process each statement in the source file
        for (const statement of sourceFile.statements) {
            goCode += this.convertStatementToGo(statement) + "\n";
        }
        
        // Add main function if none exists
        if (!goCode.includes("func main()")) {
            goCode += "\nfunc main() {\n";
            goCode += '\tfmt.Println("GaiaScript application started")\n';
            goCode += "}\n";
        }
        
        return goCode;
    }
    
    private convertStatementToGo(statement: ts.Statement): string {
        switch (statement.kind) {
            case ts.SyntaxKind.ImportDeclaration:
                return this.convertImportToGo(statement as ts.ImportDeclaration);
            case ts.SyntaxKind.FunctionDeclaration:
                return this.convertFunctionToGo(statement as ts.FunctionDeclaration);
            case ts.SyntaxKind.VariableStatement:
                return this.convertVariableToGo(statement as ts.VariableStatement);
            case ts.SyntaxKind.InterfaceDeclaration:
                return this.convertInterfaceToGo(statement as ts.InterfaceDeclaration);
            default:
                return `// Unsupported statement: ${ts.SyntaxKind[statement.kind]}`;
        }
    }
    
    private convertImportToGo(importDecl: ts.ImportDeclaration): string {
        // Go imports are handled at the package level
        // For now, we'll convert common imports to Go equivalents
        const moduleSpecifier = (importDecl.moduleSpecifier as ts.StringLiteral)?.text;
        
        switch (moduleSpecifier) {
            case "@gaia/runtime":
                return '// import "github.com/gaia/runtime"';
            case "react":
                return '// import "github.com/gaia/react-go"';
            default:
                return `// import "${moduleSpecifier}"`;
        }
    }
    
    private convertFunctionToGo(funcDecl: ts.FunctionDeclaration): string {
        const name = funcDecl.name?.text || "anonymous";
        const params = this.convertParametersToGo(funcDecl.parameters);
        const returnType = this.convertTypeToGo(funcDecl.type);
        const body = funcDecl.body ? this.convertBlockToGo(funcDecl.body) : "{\n\t// TODO: implement\n}";
        
        let goFunc = `func ${name}(${params})`;
        if (returnType) {
            goFunc += ` ${returnType}`;
        }
        goFunc += ` ${body}`;
        
        return goFunc;
    }
    
    private convertVariableToGo(varStmt: ts.VariableStatement): string {
        let goVars = "";
        
        for (const declaration of varStmt.declarationList.declarations) {
            const name = (declaration.name as ts.Identifier).text;
            const initializer = declaration.initializer;
            
            if (initializer) {
                const value = this.convertExpressionToGo(initializer);
                goVars += `var ${name} = ${value}\n`;
            } else {
                goVars += `var ${name} interface{}\n`;
            }
        }
        
        return goVars.trim();
    }
    
    private convertInterfaceToGo(interfaceDecl: ts.InterfaceDeclaration): string {
        const name = interfaceDecl.name.text;
        let goStruct = `type ${name} struct {\n`;
        
        for (const member of interfaceDecl.members) {
            if (ts.isPropertySignature(member)) {
                const propName = (member.name as ts.Identifier)?.text;
                const propType = this.convertTypeToGo(member.type);
                goStruct += `\t${propName} ${propType || "interface{}"}\n`;
            }
        }
        
        goStruct += "}";
        return goStruct;
    }
    
    private convertParametersToGo(parameters: ts.NodeArray<ts.ParameterDeclaration>): string {
        return parameters
            .map(param => {
                const name = (param.name as ts.Identifier).text;
                const type = this.convertTypeToGo(param.type) || "interface{}";
                return `${name} ${type}`;
            })
            .join(", ");
    }
    
    private convertTypeToGo(typeNode: ts.TypeNode | undefined): string {
        if (!typeNode) return "interface{}";
        
        switch (typeNode.kind) {
            case ts.SyntaxKind.StringKeyword:
                return "string";
            case ts.SyntaxKind.NumberKeyword:
                return "float64";
            case ts.SyntaxKind.BooleanKeyword:
                return "bool";
            case ts.SyntaxKind.ArrayType:
                const elementType = this.convertTypeToGo((typeNode as ts.ArrayTypeNode).elementType);
                return `[]${elementType}`;
            case ts.SyntaxKind.TypeReference:
                const typeName = ((typeNode as ts.TypeReferenceNode).typeName as ts.Identifier).text;
                switch (typeName) {
                    case "JSX.Element":
                        return "string"; // HTML string in Go
                    default:
                        return typeName;
                }
            default:
                return "interface{}";
        }
    }
    
    private convertBlockToGo(block: ts.Block): string {
        let goBlock = "{\n";
        
        for (const statement of block.statements) {
            const goStatement = this.convertStatementToGo(statement);
            goBlock += `\t${goStatement}\n`;
        }
        
        goBlock += "}";
        return goBlock;
    }
    
    private convertExpressionToGo(expr: ts.Expression): string {
        switch (expr.kind) {
            case ts.SyntaxKind.StringLiteral:
                return `"${(expr as ts.StringLiteral).text}"`;
            case ts.SyntaxKind.NumericLiteral:
                return (expr as ts.NumericLiteral).text;
            case ts.SyntaxKind.TrueKeyword:
                return "true";
            case ts.SyntaxKind.FalseKeyword:
                return "false";
            case ts.SyntaxKind.ArrayLiteralExpression:
                const elements = (expr as ts.ArrayLiteralExpression).elements
                    .map(el => this.convertExpressionToGo(el))
                    .join(", ");
                return `[]interface{}{${elements}}`;
            case ts.SyntaxKind.ObjectLiteralExpression:
                const props = (expr as ts.ObjectLiteralExpression).properties
                    .map(prop => {
                        if (ts.isPropertyAssignment(prop)) {
                            const key = (prop.name as ts.Identifier).text;
                            const value = this.convertExpressionToGo(prop.initializer);
                            return `"${key}": ${value}`;
                        }
                        return "";
                    })
                    .filter(p => p)
                    .join(", ");
                return `map[string]interface{}{${props}}`;
            case ts.SyntaxKind.Identifier:
                return (expr as ts.Identifier).text;
            case ts.SyntaxKind.CallExpression:
                const callExpr = expr as ts.CallExpression;
                const funcName = this.convertExpressionToGo(callExpr.expression);
                const args = callExpr.arguments
                    ?.map(arg => this.convertExpressionToGo(arg))
                    .join(", ") || "";
                return `${funcName}(${args})`;
            default:
                return `/* Unsupported expression: ${ts.SyntaxKind[expr.kind]} */`;
        }
    }
    
    emitAll(sourceFile: ts.SourceFile): EmitResult {
        const typescript = this.emitTypeScript(sourceFile);
        const go = this.emitGo(sourceFile);
        const javascript = this.emitJavaScript(sourceFile);
        
        return {
            typescript,
            go,
            javascript,
            errors: []
        };
    }
}