/**
 * GaiaScript Scanner - Chinese Character Tokenizer
 * Converts Chinese characters and symbols to TypeScript tokens
 */

import * as ts from "../TypeScript/src/compiler/types";
import { encodingMap } from "./encoding/character-map-simple";

export enum GaiaTokenKind {
    // Chinese Character Tokens
    Text = "Text",          // 文
    List = "List",          // 列  
    Object = "Object",      // 物
    Function = "Function",  // 函
    Component = "Component", // 組
    Interface = "Interface", // 界
    State = "State",        // 狀
    Style = "Style",        // 樣
    Import = "Import",      // 導
    Doc = "Doc",           // 檔
    
    // Symbols
    OpenBracket = "OpenBracket",     // ⟨
    CloseBracket = "CloseBracket",   // ⟩
    OpenContent = "OpenContent",     // ⟦
    CloseContent = "CloseContent",   // ⟧
    OpenStyle = "OpenStyle",         // {
    CloseStyle = "CloseStyle",       // }
    
    // Core words
    CoreWord = "CoreWord",           // 的, 之, 和, etc.
    
    // Technical terms
    TechTerm = "TechTerm",           // 編, 執, 令, etc.
    
    // Numbers
    Number = "Number",               // 零, 一, 二, etc.
    
    // Literals
    Identifier = "Identifier",
    StringLiteral = "StringLiteral",
    NumericLiteral = "NumericLiteral",
    
    // Control
    Comma = "Comma",
    Colon = "Colon",
    Semicolon = "Semicolon",
    NewLine = "NewLine",
    Whitespace = "Whitespace",
    EndOfFile = "EndOfFile",
    Unknown = "Unknown"
}

export interface GaiaToken {
    kind: GaiaTokenKind;
    text: string;
    pos: number;
    end: number;
    line: number;
    column: number;
    expandedText?: string; // For Chinese characters that expand to English
}

export class GaiaScanner {
    private text: string;
    private pos: number = 0;
    private line: number = 1;
    private column: number = 1;
    
    constructor(text: string) {
        this.text = text;
    }
    
    scan(): GaiaToken[] {
        const tokens: GaiaToken[] = [];
        
        while (this.pos < this.text.length) {
            const token = this.scanToken();
            if (token.kind !== GaiaTokenKind.Whitespace) {
                tokens.push(token);
            }
        }
        
        tokens.push(this.createToken(GaiaTokenKind.EndOfFile, ""));
        return tokens;
    }
    
    private scanToken(): GaiaToken {
        const start = this.pos;
        const startLine = this.line;
        const startColumn = this.column;
        
        const ch = this.getCurrentChar();
        
        // Skip whitespace
        if (this.isWhitespace(ch)) {
            return this.scanWhitespace();
        }
        
        // Handle newlines
        if (ch === '\n') {
            this.advance();
            this.line++;
            this.column = 1;
            return this.createToken(GaiaTokenKind.NewLine, "\n", start, startLine, startColumn);
        }
        
        // Handle symbols
        switch (ch) {
            case '⟨':
                this.advance();
                return this.createToken(GaiaTokenKind.OpenBracket, "⟨", start, startLine, startColumn);
            case '⟩':
                this.advance();
                return this.createToken(GaiaTokenKind.CloseBracket, "⟩", start, startLine, startColumn);
            case '⟦':
                this.advance();
                return this.createToken(GaiaTokenKind.OpenContent, "⟦", start, startLine, startColumn);
            case '⟧':
                this.advance();
                return this.createToken(GaiaTokenKind.CloseContent, "⟧", start, startLine, startColumn);
            case '{':
                this.advance();
                return this.createToken(GaiaTokenKind.OpenStyle, "{", start, startLine, startColumn);
            case '}':
                this.advance();
                return this.createToken(GaiaTokenKind.CloseStyle, "}", start, startLine, startColumn);
            case ',':
                this.advance();
                return this.createToken(GaiaTokenKind.Comma, ",", start, startLine, startColumn);
            case ':':
                this.advance();
                return this.createToken(GaiaTokenKind.Colon, ":", start, startLine, startColumn);
            case ';':
                this.advance();
                return this.createToken(GaiaTokenKind.Semicolon, ";", start, startLine, startColumn);
        }
        
        // Handle Chinese characters
        if (this.isChineseCharacter(ch)) {
            return this.scanChineseCharacter(start, startLine, startColumn);
        }
        
        // Handle numbers (both Arabic and Chinese)
        if (this.isDigit(ch) || this.isChineseNumber(ch)) {
            return this.scanNumber(start, startLine, startColumn);
        }
        
        // Handle identifiers and string literals
        if (this.isIdentifierStart(ch)) {
            return this.scanIdentifier(start, startLine, startColumn);
        }
        
        // Handle string literals
        if (ch === '"' || ch === "'") {
            return this.scanStringLiteral(start, startLine, startColumn);
        }
        
        // Unknown character
        this.advance();
        return this.createToken(GaiaTokenKind.Unknown, ch, start, startLine, startColumn);
    }
    
    private scanChineseCharacter(start: number, startLine: number, startColumn: number): GaiaToken {
        const ch = this.getCurrentChar();
        this.advance();
        
        // Check for core GaiaScript characters
        switch (ch) {
            case '文':
                return this.createToken(GaiaTokenKind.Text, ch, start, startLine, startColumn, "text");
            case '列':
                return this.createToken(GaiaTokenKind.List, ch, start, startLine, startColumn, "array");
            case '物':
                return this.createToken(GaiaTokenKind.Object, ch, start, startLine, startColumn, "object");
            case '函':
                return this.createToken(GaiaTokenKind.Function, ch, start, startLine, startColumn, "function");
            case '組':
                return this.createToken(GaiaTokenKind.Component, ch, start, startLine, startColumn, "component");
            case '界':
                return this.createToken(GaiaTokenKind.Interface, ch, start, startLine, startColumn, "interface");
            case '狀':
                return this.createToken(GaiaTokenKind.State, ch, start, startLine, startColumn, "state");
            case '樣':
                return this.createToken(GaiaTokenKind.Style, ch, start, startLine, startColumn, "style");
            case '導':
                return this.createToken(GaiaTokenKind.Import, ch, start, startLine, startColumn, "import");
            case '檔':
                return this.createToken(GaiaTokenKind.Doc, ch, start, startLine, startColumn, "doc");
        }
        
        // Check if it's a core word
        const coreWord = encodingMap.coreWords[ch];
        if (coreWord) {
            return this.createToken(GaiaTokenKind.CoreWord, ch, start, startLine, startColumn, coreWord);
        }
        
        // Check if it's a technical term
        const techTerm = encodingMap.techTerms[ch];
        if (techTerm) {
            return this.createToken(GaiaTokenKind.TechTerm, ch, start, startLine, startColumn, techTerm);
        }
        
        // Check if it's a number
        const number = encodingMap.numbers[ch];
        if (number !== undefined) {
            return this.createToken(GaiaTokenKind.Number, ch, start, startLine, startColumn, number.toString());
        }
        
        // Unknown Chinese character
        return this.createToken(GaiaTokenKind.Unknown, ch, start, startLine, startColumn);
    }
    
    private scanNumber(start: number, startLine: number, startColumn: number): GaiaToken {
        let text = "";
        
        while (this.pos < this.text.length) {
            const ch = this.getCurrentChar();
            if (this.isDigit(ch) || this.isChineseNumber(ch) || ch === '.') {
                text += ch;
                this.advance();
            } else {
                break;
            }
        }
        
        // Convert Chinese numbers to Arabic
        let numericValue = "";
        for (const char of text) {
            const chineseNum = encodingMap.numbers[char];
            if (chineseNum !== undefined) {
                numericValue += chineseNum.toString();
            } else {
                numericValue += char;
            }
        }
        
        return this.createToken(GaiaTokenKind.NumericLiteral, text, start, startLine, startColumn, numericValue);
    }
    
    private scanIdentifier(start: number, startLine: number, startColumn: number): GaiaToken {
        let text = "";
        
        while (this.pos < this.text.length) {
            const ch = this.getCurrentChar();
            if (this.isIdentifierPart(ch)) {
                text += ch;
                this.advance();
            } else {
                break;
            }
        }
        
        return this.createToken(GaiaTokenKind.Identifier, text, start, startLine, startColumn);
    }
    
    private scanStringLiteral(start: number, startLine: number, startColumn: number): GaiaToken {
        const quote = this.getCurrentChar();
        this.advance(); // Skip opening quote
        
        let text = quote;
        
        while (this.pos < this.text.length) {
            const ch = this.getCurrentChar();
            text += ch;
            this.advance();
            
            if (ch === quote) {
                break;
            }
            
            if (ch === '\\' && this.pos < this.text.length) {
                text += this.getCurrentChar();
                this.advance();
            }
        }
        
        return this.createToken(GaiaTokenKind.StringLiteral, text, start, startLine, startColumn);
    }
    
    private scanWhitespace(): GaiaToken {
        const start = this.pos;
        const startLine = this.line;
        const startColumn = this.column;
        
        while (this.pos < this.text.length && this.isWhitespace(this.getCurrentChar())) {
            this.advance();
        }
        
        return this.createToken(GaiaTokenKind.Whitespace, this.text.substring(start, this.pos), start, startLine, startColumn);
    }
    
    private getCurrentChar(): string {
        return this.pos < this.text.length ? this.text[this.pos] : '';
    }
    
    private advance(): void {
        if (this.pos < this.text.length) {
            this.pos++;
            this.column++;
        }
    }
    
    private createToken(kind: GaiaTokenKind, text: string, start?: number, line?: number, column?: number, expandedText?: string): GaiaToken {
        return {
            kind,
            text,
            pos: start ?? this.pos,
            end: this.pos,
            line: line ?? this.line,
            column: column ?? this.column,
            expandedText
        };
    }
    
    private isWhitespace(ch: string): boolean {
        return ch === ' ' || ch === '\t' || ch === '\r';
    }
    
    private isChineseCharacter(ch: string): boolean {
        const code = ch.charCodeAt(0);
        return (code >= 0x4E00 && code <= 0x9FFF) || // CJK Unified Ideographs
               (code >= 0x3400 && code <= 0x4DBF) || // CJK Extension A
               (code >= 0x20000 && code <= 0x2A6DF); // CJK Extension B
    }
    
    private isDigit(ch: string): boolean {
        return ch >= '0' && ch <= '9';
    }
    
    private isChineseNumber(ch: string): boolean {
        return encodingMap.numbers[ch] !== undefined;
    }
    
    private isIdentifierStart(ch: string): boolean {
        return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_' || ch === '$';
    }
    
    private isIdentifierPart(ch: string): boolean {
        return this.isIdentifierStart(ch) || this.isDigit(ch);
    }
}