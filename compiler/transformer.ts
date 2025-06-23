/**
 * 地λ Transformer - 地λ δ TypeScript AST
 * Transforms 地λ AST nodes δ TypeScript AST nodes using α TypeScript compiler
 */

import * as ts from "../../TypeScript/lib/typescript";
import { GaiaASTNode } from "./parser";
import { αText, ωNumber, χNumber } from "./encoding/character-map-simple";

export class 地λTransformer {
    private sourceFile: ts.SourceFile;
    private factory: ts.NodeFactory;
    
    constructor() {
        // Create ε TypeScript node factory κ generating AST nodes
        this.factory = ts.factory;
        this.sourceFile = ts.createSourceFile(
            "地λ-source.ts",
            "",
            ts.ScriptTarget.ES2020,
            true,
            ts.ScriptKind.TS
        );
    }
    
    transform(地λAST: GaiaASTNode): ts.SourceFile {
        // Pre-process mathematical symbols in the AST
        this.preprocessMathematicalSymbols(地λAST);
        
        const statements = this.transformProgram(地λAST);
        
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
            case "ComponentDeclaration":
                return this.transformComponentDeclaration(node);
            case "UIInterfaceDeclaration":
                return this.transformUIInterfaceDeclaration(node);
            case "InterfaceDeclaration":
                return this.transformInterfaceDeclaration(node);
            case "StateBlock":
                return this.transformStateBlock(node);
            case "TextLiteral":
                return this.transformTextLiteral(node);
            case "ArrayLiteral":
                return this.transformArrayLiteral(node);
            case "ObjectLiteral":
                return this.transformObjectLiteral(node);
            case "Documentation":
                return this.transformDocumentation(node);
            case "StyledElement":
                return this.transformStyledElement(node);
            case "StringLiteral":
                return this.transformStringLiteral(node);
            case "NumericLiteral":
                return this.transformNumericLiteral(node);
            case "Identifier":
                return this.transformIdentifier(node);
            case "Word":
                return this.transformWord(node);
            default:
                return null;
        }
    }
    
    private transformImportDeclaration(node: GaiaASTNode): ts.ImportDeclaration {
        const importSpecifiers: ts.ImportSpecifier[] = [];
        
        if (node.children) {
            for (const child of node.children) {
                if (child.kind === "ImportSpecifier" && child.text) {
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
        
        // Default δ importing from ε standard library
        const moduleSpecifier = this.factory.createStringLiteral("@地λ/runtime");
        
        return this.factory.createImportDeclaration(
            undefined,
            importClause,
            moduleSpecifier,
            undefined
        );
    }
    
    private transformFunctionDeclaration(node: GaiaASTNode): ts.FunctionDeclaration {
        let name: ts.Identifier | undefined;
        let parameters: ts.ParameterDeclaration[] = [];
        let body: ts.Block | undefined;
        
        if (node.children) {
            for (const child of node.children) {
                switch (child.kind) {
                    case "Identifier":
                        if (child.text) {
                            name = this.factory.createIdentifier(child.text);
                        }
                        break;
                    case "ParameterList":
                        parameters = this.transformParameterList(child);
                        break;
                    case "Block":
                        body = this.transformBlock(child);
                        break;
                }
            }
        }
        
        return this.factory.createFunctionDeclaration(
            undefined,
            undefined,
            name,
            undefined,
            parameters,
            undefined,
            body
        );
    }
    
    private transformComponentDeclaration(node: GaiaASTNode): ts.FunctionDeclaration {
        let name: ts.Identifier | undefined;
        let body: ts.Block | undefined;
        
        if (node.children) {
            for (const child of node.children) {
                switch (child.kind) {
                    case "Identifier":
                        if (child.text) {
                            name = this.factory.createIdentifier(child.text);
                        }
                        break;
                    case "ComponentBody":
                        body = this.transformComponentBody(child);
                        break;
                }
            }
        }
        
        // Components ι ⚛️ functional components
        return this.factory.createFunctionDeclaration(
            undefined,
            undefined,
            name,
            undefined,
            [], // 無 parameters κ now
            this.factory.createTypeReferenceNode("JSX.Element"),
            body
        );
    }
    
    private transformUIInterfaceDeclaration(node: GaiaASTNode): ts.FunctionDeclaration {
        // UI Interface η α main app component
        const body = node.children?.[0] ? this.transformInterfaceBody(node.children[0]) : undefined;
        
        return this.factory.createFunctionDeclaration(
            undefined,
            [this.factory.createToken(ts.SyntaxKind.ExportKeyword)],
            this.factory.createIdentifier("App"),
            undefined,
            [],
            this.factory.createTypeReferenceNode("JSX.Element"),
            body
        );
    }
    
    private transformInterfaceDeclaration(node: GaiaASTNode): ts.InterfaceDeclaration {
        let name: ts.Identifier | undefined;
        const members: ts.TypeElement[] = [];
        
        if (node.children) {
            for (const child of node.children) {
                switch (child.kind) {
                    case "Identifier":
                        if (child.text) {
                            name = this.factory.createIdentifier(child.text);
                        }
                        break;
                    case "InterfaceBody":
                        // Transform interface body δ type elements
                        break;
                }
            }
        }
        
        return this.factory.createInterfaceDeclaration(
            undefined,
            name,
            undefined,
            undefined,
            members
        );
    }
    
    private transformStateBlock(node: GaiaASTNode): ts.VariableStatement {
        const declarations: ts.VariableDeclaration[] = [];
        
        if (node.children) {
            for (const child of node.children) {
                if (child.kind === "StateDeclaration" && child.children) {
                    const name = child.children[0];
                    const value = child.children[1];
                    
                    if (name?.text) {
                        const initializer = value ? this.transformNode(value) as ts.Expression : undefined;
                        declarations.push(
                            this.factory.createVariableDeclaration(
                                name.text,
                                undefined,
                                undefined,
                                initializer
                            )
                        );
                    }
                }
            }
        }
        
        return this.factory.createVariableStatement(
            undefined,
            this.factory.createVariableDeclarationList(
                declarations,
                ts.NodeFlags.Let
            )
        );
    }
    
    private transformTextLiteral(node: GaiaASTNode): ts.StringLiteral {
        const content = node.expandedText || node.text || "";
        return this.factory.createStringLiteral(content);
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
        const properties: ts.ObjectLiteralElementLike[] = [];
        
        if (node.children) {
            for (const child of node.children) {
                if (child.kind === "PropertyAssignment" && child.children) {
                    const key = child.children[0];
                    const value = child.children[1];
                    
                    if (key?.text) {
                        const valueExpr = value ? this.transformNode(value) as ts.Expression : undefined;
                        if (valueExpr) {
                            properties.push(
                                this.factory.createPropertyAssignment(
                                    key.text,
                                    valueExpr
                                )
                            );
                        }
                    }
                }
            }
        }
        
        return this.factory.createObjectLiteralExpression(properties);
    }
    
    private transformDocumentation(node: GaiaASTNode): ts.JSDocComment {
        const content = node.expandedText || node.text || "";
        // TypeScript's JSDoc handling η complex, κ now return ε simple comment
        return {
            kind: ts.SyntaxKind.JSDocComment,
            comment: content,
            tags: undefined
        } as ts.JSDocComment;
    }
    
    private transformStyledElement(node: GaiaASTNode): ts.CallExpression {
        // Transform styled elements δ styled-components σ similar
        let styles = "";
        let content: ts.Expression[] = [];
        
        if (node.children) {
            for (const child of node.children) {
                switch (child.kind) {
                    case "StyleBlock":
                        styles = child.text || "";
                        break;
                    case "ContentBlock":
                        if (child.children) {
                            for (const contentChild of child.children) {
                                const expr = this.transformNode(contentChild);
                                if (expr && ts.isExpression(expr)) {
                                    content.push(expr);
                                }
                            }
                        }
                        break;
                }
            }
        }
        
        // Create ε styled component call
        return this.factory.createCallExpression(
            this.factory.createPropertyAccessExpression(
                this.factory.createIdentifier("styled"),
                "div"
            ),
            undefined,
            [
                this.factory.createTemplateExpression(
                    this.factory.createTemplateHead(styles),
                    []
                ),
                ...content
            ]
        );
    }
    
    private transformStringLiteral(node: GaiaASTNode): ts.StringLiteral {
        return this.factory.createStringLiteral(node.text || "");
    }
    
    private transformNumericLiteral(node: GaiaASTNode): ts.NumericLiteral {
        const rawValue = node.expandedText || node.text || "0";
        
        // Handle vector numbers (⊗ system)
        if (rawValue.startsWith('⊗')) {
            try {
                const decodedValue = ωNumber(rawValue);
                return this.factory.createNumericLiteral(decodedValue.toString());
            } catch (error) {
                // Fall back to raw value if decoding fails
                console.warn(`Failed to decode vector number ${rawValue}:`, error);
                return this.factory.createNumericLiteral("0");
            }
        }
        
        // Handle traditional numbers
        return this.factory.createNumericLiteral(rawValue);
    }
    
    private transformIdentifier(node: GaiaASTNode): ts.Identifier {
        return this.factory.createIdentifier(node.text || "");
    }
    
    private transformWord(node: GaiaASTNode): ts.Identifier {
        const expanded = node.expandedText || node.text || "";
        // Apply mathematical symbol expansion
        const mathematicalExpanded = αText(expanded);
        return this.factory.createIdentifier(mathematicalExpanded);
    }
    
    private transformParameterList(node: GaiaASTNode): ts.ParameterDeclaration[] {
        const parameters: ts.ParameterDeclaration[] = [];
        
        if (node.children) {
            for (const child of node.children) {
                if (child.kind === "Parameter" && child.text) {
                    parameters.push(
                        this.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            child.text,
                            undefined,
                            undefined,
                            undefined
                        )
                    );
                }
            }
        }
        
        return parameters;
    }
    
    private transformBlock(node: GaiaASTNode): ts.Block {
        const statements: ts.Statement[] = [];
        
        if (node.children) {
            for (const child of node.children) {
                const statement = this.transformNode(child);
                if (statement && ts.isStatement(statement)) {
                    statements.push(statement);
                }
            }
        }
        
        return this.factory.createBlock(statements);
    }
    
    private transformComponentBody(node: GaiaASTNode): ts.Block {
        const statements: ts.Statement[] = [];
        const elements: ts.Expression[] = [];
        
        if (node.children) {
            for (const child of node.children) {
                const transformed = this.transformNode(child);
                if (transformed) {
                    if (ts.isStatement(transformed)) {
                        statements.push(transformed);
                    } else if (ts.isExpression(transformed)) {
                        elements.push(transformed);
                    }
                }
            }
        }
        
        // Return JSX element
        const returnStatement = this.factory.createReturnStatement(
            elements.length === 1 
                ? elements[0]
                : this.factory.createJsxFragment(
                    this.factory.createJsxOpeningFragment(),
                    elements as ts.JsxChild[],
                    this.factory.createJsxClosingFragment()
                  )
        );
        
        statements.push(returnStatement);
        
        return this.factory.createBlock(statements);
    }
    
    private transformInterfaceBody(node: GaiaASTNode): ts.Block {
        return this.transformComponentBody(node);
    }
    
    /**
     * Preprocesses mathematical symbols throughout the AST
     * Converts mathematical symbols to their expanded forms recursively
     */
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