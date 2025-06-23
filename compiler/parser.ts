/**
 * GaiaScript Parser - AST Generator
 * Converts GaiaScript tokens to TypeScript AST nodes
 */

import * as ts from "../TypeScript/src/compiler/types";
import { GaiaToken, GaiaTokenKind, GaiaScanner } from "./scanner";
import { expandChineseText } from "./encoding/character-map";

export interface GaiaASTNode {
    kind: string;
    pos: number;
    end: number;
    children?: GaiaASTNode[];
    text?: string;
    expandedText?: string;
}

export class GaiaParser {
    private tokens: GaiaToken[];
    private current: number = 0;
    
    constructor(source: string) {
        const scanner = new GaiaScanner(source);
        this.tokens = scanner.scan();
    }
    
    parse(): GaiaASTNode {
        return this.parseProgram();
    }
    
    private parseProgram(): GaiaASTNode {
        const program: GaiaASTNode = {
            kind: "Program",
            pos: 0,
            end: this.tokens[this.tokens.length - 1]?.end || 0,
            children: []
        };
        
        while (!this.isAtEnd()) {
            const statement = this.parseStatement();
            if (statement) {
                program.children!.push(statement);
            }
        }
        
        return program;
    }
    
    private parseStatement(): GaiaASTNode | null {
        const token = this.peek();
        
        switch (token.kind) {
            case GaiaTokenKind.Import:
                return this.parseImport();
            case GaiaTokenKind.Function:
                return this.parseFunction();
            case GaiaTokenKind.Component:
                return this.parseComponent();
            case GaiaTokenKind.Interface:
                return this.parseInterface();
            case GaiaTokenKind.State:
                return this.parseState();
            case GaiaTokenKind.Text:
                return this.parseText();
            case GaiaTokenKind.List:
                return this.parseList();
            case GaiaTokenKind.Object:
                return this.parseObject();
            case GaiaTokenKind.Doc:
                return this.parseDoc();
            case GaiaTokenKind.NewLine:
                this.advance(); // Skip newlines
                return null;
            default:
                return this.parseExpression();
        }
    }
    
    private parseImport(): GaiaASTNode {
        const importToken = this.advance(); // consume '導'
        this.consume(GaiaTokenKind.OpenBracket, "Expected '⟨' after import");
        
        const imports: GaiaASTNode[] = [];
        
        while (!this.check(GaiaTokenKind.CloseBracket) && !this.isAtEnd()) {
            const identifier = this.consume(GaiaTokenKind.Identifier, "Expected import identifier");
            imports.push({
                kind: "ImportSpecifier",
                pos: identifier.pos,
                end: identifier.end,
                text: identifier.text
            });
            
            if (this.match(GaiaTokenKind.Comma)) {
                // Continue with next import
            }
        }
        
        this.consume(GaiaTokenKind.CloseBracket, "Expected '⟩' after imports");
        
        return {
            kind: "ImportDeclaration",
            pos: importToken.pos,
            end: this.previous().end,
            children: imports,
            expandedText: "import"
        };
    }
    
    private parseFunction(): GaiaASTNode {
        const funcToken = this.advance(); // consume '函'
        this.consume(GaiaTokenKind.OpenBracket, "Expected '⟨' after function");
        
        const name = this.consume(GaiaTokenKind.Identifier, "Expected function name");
        const parameters: GaiaASTNode[] = [];
        
        // Parse parameters
        while (this.match(GaiaTokenKind.Comma)) {
            const param = this.consume(GaiaTokenKind.Identifier, "Expected parameter name");
            parameters.push({
                kind: "Parameter",
                pos: param.pos,
                end: param.end,
                text: param.text
            });
        }
        
        this.consume(GaiaTokenKind.CloseBracket, "Expected '⟩' after function signature");
        
        // Parse function body
        const body = this.parseFunctionBody();
        
        this.consume(GaiaTokenKind.OpenBracket, "Expected '⟨' before function end");
        this.consume(GaiaTokenKind.Function, "Expected '函' for function end");
        this.consume(GaiaTokenKind.CloseBracket, "Expected '⟩' after function end");
        
        return {
            kind: "FunctionDeclaration",
            pos: funcToken.pos,
            end: this.previous().end,
            children: [
                {
                    kind: "Identifier",
                    pos: name.pos,
                    end: name.end,
                    text: name.text
                },
                {
                    kind: "ParameterList",
                    pos: parameters[0]?.pos || name.end,
                    end: parameters[parameters.length - 1]?.end || name.end,
                    children: parameters
                },
                body
            ],
            expandedText: "function"
        };
    }
    
    private parseComponent(): GaiaASTNode {
        const compToken = this.advance(); // consume '組'
        this.consume(GaiaTokenKind.OpenBracket, "Expected '⟨' after component");
        
        const name = this.consume(GaiaTokenKind.Identifier, "Expected component name");
        this.consume(GaiaTokenKind.CloseBracket, "Expected '⟩' after component name");
        
        // Parse component body
        const body = this.parseComponentBody();
        
        this.consume(GaiaTokenKind.OpenBracket, "Expected '⟨' before component end");
        this.consume(GaiaTokenKind.Component, "Expected '組' for component end");
        this.consume(GaiaTokenKind.CloseBracket, "Expected '⟩' after component end");
        
        return {
            kind: "ComponentDeclaration",
            pos: compToken.pos,
            end: this.previous().end,
            children: [
                {
                    kind: "Identifier",
                    pos: name.pos,
                    end: name.end,
                    text: name.text
                },
                body
            ],
            expandedText: "component"
        };
    }
    
    private parseInterface(): GaiaASTNode {
        const intToken = this.advance(); // consume '界'
        this.consume(GaiaTokenKind.OpenBracket, "Expected '⟨' after interface");
        
        // Special handling for UI interface with ✱ symbol
        if (this.peek().text === "✱") {
            this.advance(); // consume ✱
            this.consume(GaiaTokenKind.CloseBracket, "Expected '⟩' after ✱");
            
            const body = this.parseInterfaceBody();
            
            this.consume(GaiaTokenKind.OpenBracket, "Expected '⟨' before interface end");
            this.consume(GaiaTokenKind.Interface, "Expected '界' for interface end");
            this.consume(GaiaTokenKind.CloseBracket, "Expected '⟩' after interface end");
            
            return {
                kind: "UIInterfaceDeclaration",
                pos: intToken.pos,
                end: this.previous().end,
                children: [body],
                expandedText: "interface"
            };
        }
        
        // Regular interface
        const name = this.consume(GaiaTokenKind.Identifier, "Expected interface name");
        this.consume(GaiaTokenKind.CloseBracket, "Expected '⟩' after interface name");
        
        const body = this.parseInterfaceBody();
        
        return {
            kind: "InterfaceDeclaration",
            pos: intToken.pos,
            end: this.previous().end,
            children: [
                {
                    kind: "Identifier",
                    pos: name.pos,
                    end: name.end,
                    text: name.text
                },
                body
            ],
            expandedText: "interface"
        };
    }
    
    private parseState(): GaiaASTNode {
        const stateToken = this.advance(); // consume '狀'
        this.consume(GaiaTokenKind.OpenBracket, "Expected '⟨' after state");
        
        const declarations: GaiaASTNode[] = [];
        
        while (!this.check(GaiaTokenKind.CloseBracket) && !this.isAtEnd()) {
            const name = this.consume(GaiaTokenKind.Identifier, "Expected state variable name");
            this.consume(GaiaTokenKind.Colon, "Expected ':' after state variable name");
            const value = this.parseExpression();
            
            declarations.push({
                kind: "StateDeclaration",
                pos: name.pos,
                end: value?.end || name.end,
                children: [
                    {
                        kind: "Identifier",
                        pos: name.pos,
                        end: name.end,
                        text: name.text
                    },
                    value!
                ]
            });
            
            if (this.match(GaiaTokenKind.Comma)) {
                // Continue with next declaration
            }
        }
        
        this.consume(GaiaTokenKind.CloseBracket, "Expected '⟩' after state declarations");
        
        return {
            kind: "StateBlock",
            pos: stateToken.pos,
            end: this.previous().end,
            children: declarations,
            expandedText: "state"
        };
    }
    
    private parseText(): GaiaASTNode {
        const textToken = this.advance(); // consume '文'
        this.consume(GaiaTokenKind.OpenBracket, "Expected '⟨' after text");
        
        let content = "";
        const contentNodes: GaiaASTNode[] = [];
        
        while (!this.check(GaiaTokenKind.CloseBracket) && !this.isAtEnd()) {
            const token = this.advance();
            content += token.text;
            contentNodes.push({
                kind: "TextContent",
                pos: token.pos,
                end: token.end,
                text: token.text,
                expandedText: token.expandedText
            });
        }
        
        this.consume(GaiaTokenKind.CloseBracket, "Expected '⟩' after text content");
        
        return {
            kind: "TextLiteral",
            pos: textToken.pos,
            end: this.previous().end,
            text: content,
            expandedText: expandChineseText(content),
            children: contentNodes
        };
    }
    
    private parseList(): GaiaASTNode {
        const listToken = this.advance(); // consume '列'
        this.consume(GaiaTokenKind.OpenBracket, "Expected '⟨' after list");
        
        const elements: GaiaASTNode[] = [];
        
        while (!this.check(GaiaTokenKind.CloseBracket) && !this.isAtEnd()) {
            const element = this.parseExpression();
            if (element) {
                elements.push(element);
            }
            
            if (this.match(GaiaTokenKind.Comma)) {
                // Continue with next element
            }
        }
        
        this.consume(GaiaTokenKind.CloseBracket, "Expected '⟩' after list elements");
        
        return {
            kind: "ArrayLiteral",
            pos: listToken.pos,
            end: this.previous().end,
            children: elements,
            expandedText: "array"
        };
    }
    
    private parseObject(): GaiaASTNode {
        const objToken = this.advance(); // consume '物'
        this.consume(GaiaTokenKind.OpenBracket, "Expected '⟨' after object");
        
        const properties: GaiaASTNode[] = [];
        
        while (!this.check(GaiaTokenKind.CloseBracket) && !this.isAtEnd()) {
            const key = this.consume(GaiaTokenKind.Identifier, "Expected property name");
            this.consume(GaiaTokenKind.Colon, "Expected ':' after property name");
            const value = this.parseExpression();
            
            properties.push({
                kind: "PropertyAssignment",
                pos: key.pos,
                end: value?.end || key.end,
                children: [
                    {
                        kind: "Identifier",
                        pos: key.pos,
                        end: key.end,
                        text: key.text
                    },
                    value!
                ]
            });
            
            if (this.match(GaiaTokenKind.Comma)) {
                // Continue with next property
            }
        }
        
        this.consume(GaiaTokenKind.CloseBracket, "Expected '⟩' after object properties");
        
        return {
            kind: "ObjectLiteral",
            pos: objToken.pos,
            end: this.previous().end,
            children: properties,
            expandedText: "object"
        };
    }
    
    private parseDoc(): GaiaASTNode {
        const docToken = this.advance(); // consume '檔'
        this.consume(GaiaTokenKind.OpenBracket, "Expected '⟨' after doc");
        
        let content = "";
        while (!this.check(GaiaTokenKind.CloseBracket) && !this.isAtEnd()) {
            const token = this.advance();
            content += token.text;
        }
        
        this.consume(GaiaTokenKind.CloseBracket, "Expected '⟩' after doc content");
        
        return {
            kind: "Documentation",
            pos: docToken.pos,
            end: this.previous().end,
            text: content,
            expandedText: expandChineseText(content)
        };
    }
    
    private parseExpression(): GaiaASTNode | null {
        const token = this.peek();
        
        switch (token.kind) {
            case GaiaTokenKind.StringLiteral:
                return this.parseStringLiteral();
            case GaiaTokenKind.NumericLiteral:
            case GaiaTokenKind.Number:
                return this.parseNumericLiteral();
            case GaiaTokenKind.Identifier:
                return this.parseIdentifier();
            case GaiaTokenKind.CoreWord:
            case GaiaTokenKind.TechTerm:
                return this.parseWord();
            default:
                this.advance(); // Skip unknown tokens
                return null;
        }
    }
    
    private parseStringLiteral(): GaiaASTNode {
        const token = this.advance();
        return {
            kind: "StringLiteral",
            pos: token.pos,
            end: token.end,
            text: token.text
        };
    }
    
    private parseNumericLiteral(): GaiaASTNode {
        const token = this.advance();
        return {
            kind: "NumericLiteral",
            pos: token.pos,
            end: token.end,
            text: token.text,
            expandedText: token.expandedText
        };
    }
    
    private parseIdentifier(): GaiaASTNode {
        const token = this.advance();
        return {
            kind: "Identifier",
            pos: token.pos,
            end: token.end,
            text: token.text
        };
    }
    
    private parseWord(): GaiaASTNode {
        const token = this.advance();
        return {
            kind: "Word",
            pos: token.pos,
            end: token.end,
            text: token.text,
            expandedText: token.expandedText
        };
    }
    
    private parseFunctionBody(): GaiaASTNode {
        const statements: GaiaASTNode[] = [];
        
        while (!this.check(GaiaTokenKind.OpenBracket) && !this.isAtEnd()) {
            const statement = this.parseStatement();
            if (statement) {
                statements.push(statement);
            }
        }
        
        return {
            kind: "Block",
            pos: statements[0]?.pos || this.peek().pos,
            end: statements[statements.length - 1]?.end || this.peek().pos,
            children: statements
        };
    }
    
    private parseComponentBody(): GaiaASTNode {
        const elements: GaiaASTNode[] = [];
        
        while (!this.check(GaiaTokenKind.OpenBracket) && !this.isAtEnd()) {
            // Handle styled elements: 樣{styles}⟦Content⟧
            if (this.check(GaiaTokenKind.Style)) {
                elements.push(this.parseStyledElement());
            } else {
                const element = this.parseStatement();
                if (element) {
                    elements.push(element);
                }
            }
        }
        
        return {
            kind: "ComponentBody",
            pos: elements[0]?.pos || this.peek().pos,
            end: elements[elements.length - 1]?.end || this.peek().pos,
            children: elements
        };
    }
    
    private parseInterfaceBody(): GaiaASTNode {
        const elements: GaiaASTNode[] = [];
        
        while (!this.check(GaiaTokenKind.OpenBracket) && !this.isAtEnd()) {
            const element = this.parseStatement();
            if (element) {
                elements.push(element);
            }
        }
        
        return {
            kind: "InterfaceBody",
            pos: elements[0]?.pos || this.peek().pos,
            end: elements[elements.length - 1]?.end || this.peek().pos,
            children: elements
        };
    }
    
    private parseStyledElement(): GaiaASTNode {
        const styleToken = this.advance(); // consume '樣'
        this.consume(GaiaTokenKind.OpenStyle, "Expected '{' after style");
        
        let styles = "";
        while (!this.check(GaiaTokenKind.CloseStyle) && !this.isAtEnd()) {
            const token = this.advance();
            styles += token.text;
        }
        
        this.consume(GaiaTokenKind.CloseStyle, "Expected '}' after styles");
        this.consume(GaiaTokenKind.OpenContent, "Expected '⟦' after styles");
        
        let content = "";
        const contentElements: GaiaASTNode[] = [];
        
        while (!this.check(GaiaTokenKind.CloseContent) && !this.isAtEnd()) {
            const element = this.parseStatement();
            if (element) {
                contentElements.push(element);
                content += element.text || "";
            }
        }
        
        this.consume(GaiaTokenKind.CloseContent, "Expected '⟧' after content");
        
        return {
            kind: "StyledElement",
            pos: styleToken.pos,
            end: this.previous().end,
            children: [
                {
                    kind: "StyleBlock",
                    pos: styleToken.pos,
                    end: styleToken.end,
                    text: styles
                },
                {
                    kind: "ContentBlock",
                    pos: contentElements[0]?.pos || styleToken.end,
                    end: contentElements[contentElements.length - 1]?.end || styleToken.end,
                    children: contentElements,
                    text: content
                }
            ]
        };
    }
    
    // Utility methods
    private peek(): GaiaToken {
        return this.tokens[this.current];
    }
    
    private previous(): GaiaToken {
        return this.tokens[this.current - 1];
    }
    
    private isAtEnd(): boolean {
        return this.peek().kind === GaiaTokenKind.EndOfFile;
    }
    
    private advance(): GaiaToken {
        if (!this.isAtEnd()) {
            this.current++;
        }
        return this.previous();
    }
    
    private check(kind: GaiaTokenKind): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().kind === kind;
    }
    
    private match(...kinds: GaiaTokenKind[]): boolean {
        for (const kind of kinds) {
            if (this.check(kind)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    
    private consume(kind: GaiaTokenKind, message: string): GaiaToken {
        if (this.check(kind)) {
            return this.advance();
        }
        
        throw new Error(`${message}. Got ${this.peek().kind} at line ${this.peek().line}, column ${this.peek().column}`);
    }
}