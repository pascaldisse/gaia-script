/**
 * GaiaScript Transformer - Simple Implementation
 * Transforms GaiaScript AST to TypeScript AST using the TypeScript compiler
 */

import * as ts from "typescript";
import { GaiaASTNode } from "./parser";
import { αText, ωNumber, χNumber } from "./encoding/character-map-simple";

export class GaiaTransformer {
    private factory: ts.NodeFactory;
    
    constructor() {
        // Use the global TypeScript factory
        this.factory = ts.factory;
    }
    
    transform(gaiaAST: GaiaASTNode): ts.SourceFile {
        // Pre-process mathematical symbols in the AST
        this.preprocessMathematicalSymbols(gaiaAST);
        
        const statements = this.transformProgram(gaiaAST);
        
        return this.factory.createSourceFile(
            statements,
            this.factory.createToken(ts.SyntaxKind.EndOfFileToken),
            ts.NodeFlags.None
        );
    }
    
    private transformProgram(node: GaiaASTNode): ts.Statement[] {
        const statements: ts.Statement[] = [];
        
        if (node.children) {
            for (const child of node.children) {
                const statement = this.transformNode(child);
                if (statement && ts.isStatement(statement)) {
                    statements.push(statement);
                }
            }
        }
        
        return statements;
    }
    
    private transformNode(node: GaiaASTNode): ts.Node | null {
        switch (node.kind) {
            case "ImportDeclaration":
                return this.transformImportDeclaration(node);
            case "FunctionDeclaration":
                return this.transformFunctionDeclaration(node);
            case "StateBlock":
                return this.transformStateBlock(node);
            case "TextLiteral":
                return this.transformTextLiteral(node);
            case "ArrayLiteral":
                return this.transformArrayLiteral(node);
            case "ObjectLiteral":
                return this.transformObjectLiteral(node);
            case "StringLiteral":
                return this.transformStringLiteral(node);
            case "NumericLiteral":
                return this.transformNumericLiteral(node);
            case "Identifier":
                return this.transformIdentifier(node);
            default:
                return null;
        }
    }
    
    private transformImportDeclaration(node: GaiaASTNode): ts.ImportDeclaration {
        const importSpecifiers: ts.ImportSpecifier[] = [];
        
        if (node.children) {
            for (const child of node.children) {
                if (child.text) {
                    importSpecifiers.push(
                        this.factory.createImportSpecifier(
                            false,
                            undefined,
                            this.factory.createIdentifier(child.text)
                        )
                    );
                }
            }
        }
        
        const importClause = this.factory.createImportClause(
            false,
            undefined,
            this.factory.createNamedImports(importSpecifiers)
        );
        
        return this.factory.createImportDeclaration(
            undefined,
            importClause,
            this.factory.createStringLiteral("@gaiascript/runtime"),
            undefined
        );
    }
    
    private transformFunctionDeclaration(node: GaiaASTNode): ts.FunctionDeclaration {
        const name = node.children?.find(c => c.kind === "Identifier")?.text || "unnamed";
        
        return this.factory.createFunctionDeclaration(
            undefined,
            undefined,
            this.factory.createIdentifier(name),
            undefined,
            [],
            undefined,
            this.factory.createBlock([])
        );
    }
    
    private transformStateBlock(node: GaiaASTNode): ts.VariableStatement {
        const declarations: ts.VariableDeclaration[] = [];
        
        if (node.children) {
            for (const child of node.children) {
                if (child.children && child.children[0]?.text) {
                    declarations.push(
                        this.factory.createVariableDeclaration(
                            child.children[0].text,
                            undefined,
                            undefined,
                            undefined
                        )
                    );
                }
            }
        }
        
        return this.factory.createVariableStatement(
            undefined,
            this.factory.createVariableDeclarationList(declarations, ts.NodeFlags.Let)
        );
    }
    
    private transformTextLiteral(node: GaiaASTNode): ts.StringLiteral {
        return this.factory.createStringLiteral(node.expandedText || node.text || "");
    }
    
    private transformArrayLiteral(node: GaiaASTNode): ts.ArrayLiteralExpression {
        const elements: ts.Expression[] = [];
        
        if (node.children) {
            for (const child of node.children) {
                const element = this.transformNode(child);
                if (element && ts.isExpression(element)) {
                    elements.push(element);
                }
            }
        }
        
        return this.factory.createArrayLiteralExpression(elements);
    }
    
    private transformObjectLiteral(node: GaiaASTNode): ts.ObjectLiteralExpression {
        const properties: ts.PropertyAssignment[] = [];
        
        if (node.children) {
            for (const child of node.children) {
                if (child.children && child.children[0]?.text && child.children[1]) {
                    const valueExpr = this.transformNode(child.children[1]);
                    if (valueExpr && ts.isExpression(valueExpr)) {
                        properties.push(
                            this.factory.createPropertyAssignment(
                                child.children[0].text,
                                valueExpr
                            )
                        );
                    }
                }
            }
        }
        
        return this.factory.createObjectLiteralExpression(properties);
    }
    
    private transformStringLiteral(node: GaiaASTNode): ts.StringLiteral {
        return this.factory.createStringLiteral(node.text || "");
    }
    
    private transformNumericLiteral(node: GaiaASTNode): ts.NumericLiteral {
        const rawValue = node.expandedText || node.text || "0";
        
        // Handle vector numbers
        if (rawValue.startsWith('⊗')) {
            try {
                const decodedValue = ωNumber(rawValue);
                return this.factory.createNumericLiteral(decodedValue.toString());
            } catch (error) {
                console.warn(`Failed to decode vector number ${rawValue}:`, error);
                return this.factory.createNumericLiteral("0");
            }
        }
        
        return this.factory.createNumericLiteral(rawValue);
    }
    
    private transformIdentifier(node: GaiaASTNode): ts.Identifier {
        return this.factory.createIdentifier(node.text || "");
    }
    
    private preprocessMathematicalSymbols(node: GaiaASTNode): void {
        // Expand mathematical symbols in text content
        if (node.text) {
            node.expandedText = αText(node.text);
        }
        
        // Handle vector numbers
        if (node.kind === "NumericLiteral" && node.text?.startsWith('⊗')) {
            try {
                const decodedValue = ωNumber(node.text);
                node.expandedText = decodedValue.toString();
            } catch (error) {
                console.warn(`Failed to decode vector number ${node.text}:`, error);
                node.expandedText = "0";
            }
        }
        
        // Recursively process children
        if (node.children) {
            for (const child of node.children) {
                this.preprocessMathematicalSymbols(child);
            }
        }
    }
}