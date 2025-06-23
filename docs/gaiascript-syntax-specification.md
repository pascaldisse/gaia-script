# GaiaScript Syntax Specification

## Overview

GaiaScript is an ultra-compact programming language that uses Chinese characters and symbols to achieve maximum token efficiency for AI communication. This specification defines the complete syntax and semantics of the GaiaScript language.

## Core Principles

1. **Token Efficiency**: Each character represents maximum information density
2. **Symbolic Notation**: Use Chinese characters and Unicode symbols for compact representation
3. **TypeScript Compatibility**: Generate clean, idiomatic TypeScript code
4. **AI-First Design**: Optimized for AI model processing and generation

## Character Encoding System

### Primary Language Constructs

| Chinese | English | Purpose | TypeScript Equivalent |
|---------|---------|---------|----------------------|
| 文 | Text | String literals | StringLiteral |
| 列 | List | Array literals | ArrayLiteralExpression |
| 物 | Object | Object literals | ObjectLiteralExpression |
| 函 | Function | Function declaration | FunctionDeclaration |
| 組 | Component | React component | React.Component |
| 界 | Interface | UI interface/App | JSX.Element |
| 狀 | State | State management | State variables |
| 樣 | Style | CSS styling | Style objects |
| 導 | Import | Module imports | ImportDeclaration |
| 檔 | Doc | Documentation | JSDoc comments |

### Core Words (核心詞彙)

| Chinese | English | Usage |
|---------|---------|-------|
| 的 | the | Definite article |
| 之 | of | Possessive |
| 和 | and | Logical conjunction |
| 至 | to | Direction/target |
| 一 | a | Indefinite article |
| 在 | in | Location/context |
| 是 | is | Identity/equality |
| 你 | you | Second person |
| 都 | are | Plural identity |
| 為 | for | Purpose |
| 它 | it | Neutral pronoun |
| 與 | with | Accompaniment |
| 上 | on | Position |
| 這 | this | Proximal demonstrative |
| 但 | but | Contrast |
| 她 | her | Feminine pronoun |
| 或 | or | Logical disjunction |
| 他 | his | Masculine pronoun |
| 將 | will | Future tense |
| 能 | can | Ability/possibility |
| 有 | have | Possession |
| 所 | what | Interrogative |

### Technical Terms (技術術語)

| Chinese | English | Usage |
|---------|---------|-------|
| 編 | build | Compilation process |
| 執 | execution | Runtime execution |
| 令 | commands | System commands |
| 語 | language | Programming language |
| 需 | requirements | Dependencies |
| 總 | always | Temporal quantifier |
| 用 | use | Utilization |
| 碼 | code | Source code |
| 格 | style | Code formatting |
| 則 | guidelines | Rules/patterns |
| 導 | imports | Module imports |
| 式 | formatting | Code style |
| 名 | naming | Identifier naming |
| 狀 | state | Application state |
| 宣 | declaration | Variable declaration |

### Numbers (數字)

| Chinese | Arabic | Usage |
|---------|--------|-------|
| 零 | 0 | Zero |
| 一 | 1 | One |
| 二 | 2 | Two |
| 三 | 3 | Three |
| 四 | 4 | Four |
| 五 | 5 | Five |
| 六 | 6 | Six |
| 七 | 7 | Seven |
| 八 | 8 | Eight |
| 九 | 9 | Nine |

### Symbols and Delimiters

| Symbol | Name | Purpose |
|--------|------|---------|
| ⟨ | Open Bracket | Start of construct |
| ⟩ | Close Bracket | End of construct |
| ⟦ | Open Content | Start of content block |
| ⟧ | Close Content | End of content block |
| { | Open Style | Start of style block |
| } | Close Style | End of style block |
| : | Colon | Key-value separator |
| , | Comma | List separator |
| ✱ | Star | UI interface marker |
| $ | Dollar | Variable interpolation |

## Syntax Rules

### 1. Text Literals

```gaiascript
文⟨Hello, World!⟩
文⟨這是中文文本⟩
文⟨Multi-line
text content⟩
```

**TypeScript Output:**
```typescript
"Hello, World!"
"這是中文文本"  
"Multi-line\ntext content"
```

### 2. Lists (Arrays)

```gaiascript
列⟨一, 二, 三⟩
列⟨文⟨first⟩, 文⟨second⟩, 文⟨third⟩⟩
列⟨
  物⟨name: 文⟨Alice⟩, age: 二五⟩,
  物⟨name: 文⟨Bob⟩, age: 三零⟩
⟩
```

**TypeScript Output:**
```typescript
[1, 2, 3]
["first", "second", "third"]
[
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 }
]
```

### 3. Objects

```gaiascript
物⟨
  title: 文⟨My App⟩,
  version: 文⟨1.0.0⟩,
  config: 物⟨
    debug: true,
    port: 八零八零
  ⟩
⟩
```

**TypeScript Output:**
```typescript
{
  title: "My App",
  version: "1.0.0",
  config: {
    debug: true,
    port: 8080
  }
}
```

### 4. Functions

```gaiascript
函⟨greet, name⟩
  文⟨Hello, ${name}!⟩
⟨/函⟩

函⟨calculate, a, b⟩
  返 a + b
⟨/函⟩
```

**TypeScript Output:**
```typescript
function greet(name) {
  return `Hello, ${name}!`;
}

function calculate(a, b) {
  return a + b;
}
```

### 5. Components

```gaiascript
組⟨Button⟩
  樣{
    background: blue;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 5px;
  }⟦
    文⟨Click me!⟩
  ⟧
⟨/組⟩
```

**TypeScript Output:**
```typescript
function Button() {
  return (
    <div style={{
      background: 'blue',
      color: 'white',
      padding: '10px',
      border: 'none',
      borderRadius: '5px'
    }}>
      Click me!
    </div>
  );
}
```

### 6. UI Interface (Main App)

```gaiascript
界⟨✱⟩
  狀⟨count: 零⟩
  
  函⟨increment⟩
    count = count + 一
  ⟨/函⟩
  
  樣{
    text-align: center;
    font-family: Arial;
  }⟦
    文⟨Count: ${count}⟩
    組⟨Button⟩
  ⟧
⟨/界⟩
```

**TypeScript Output:**
```typescript
export function App() {
  let count = 0;
  
  function increment() {
    count = count + 1;
  }
  
  return (
    <div style={{
      textAlign: 'center',
      fontFamily: 'Arial'
    }}>
      Count: {count}
      <Button />
    </div>
  );
}
```

### 7. State Management

```gaiascript
狀⟨
  user: 物⟨
    name: 文⟨Anonymous⟩,
    email: 文⟨⟩
  ⟩,
  isLoggedIn: false,
  settings: 列⟨文⟨dark⟩, 文⟨en⟩⟩
⟩
```

**TypeScript Output:**
```typescript
let user = {
  name: "Anonymous",
  email: ""
};
let isLoggedIn = false;
let settings = ["dark", "en"];
```

### 8. Imports

```gaiascript
導⟨React, useState, useEffect⟩
導⟨UI, Button, Input⟩
導⟨Utils, formatDate, validateEmail⟩
```

**TypeScript Output:**
```typescript
import { React, useState, useEffect } from "@gaia/runtime";
import { UI, Button, Input } from "@gaia/runtime";
import { Utils, formatDate, validateEmail } from "@gaia/runtime";
```

### 9. Documentation

```gaiascript
檔⟨
  This function calculates the factorial of a number
  @param n - The input number
  @returns The factorial result
⟩
函⟨factorial, n⟩
  if n <= 一 then 一 else n * factorial(n - 一)
⟨/函⟩
```

**TypeScript Output:**
```typescript
/**
 * This function calculates the factorial of a number
 * @param n - The input number
 * @returns The factorial result
 */
function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}
```

### 10. Variable Interpolation

```gaiascript
狀⟨name: 文⟨Alice⟩, age: 二五⟩

文⟨Hello, ${name}! You are ${age} years old.⟩
文⟨${name}的年齡是${age}歲⟩
```

**TypeScript Output:**
```typescript
let name = "Alice";
let age = 25;

`Hello, ${name}! You are ${age} years old.`
`${name}的年齡是${age}歲`
```

## Grammar Rules

### Program Structure

```ebnf
Program ::= Statement*

Statement ::= ImportDeclaration
           | FunctionDeclaration  
           | ComponentDeclaration
           | InterfaceDeclaration
           | StateDeclaration
           | ExpressionStatement
           | Documentation

ImportDeclaration ::= '導' '⟨' ImportList '⟩'
ImportList ::= Identifier (',' Identifier)*

FunctionDeclaration ::= '函' '⟨' Identifier (',' Parameter)* '⟩' 
                       Block 
                       '⟨' '/' '函' '⟩'

ComponentDeclaration ::= '組' '⟨' Identifier '⟩'
                        ComponentBody
                        '⟨' '/' '組' '⟩'

InterfaceDeclaration ::= '界' '⟨' ('✱' | Identifier) '⟩'
                        InterfaceBody  
                        '⟨' '/' '界' '⟩'

StateDeclaration ::= '狀' '⟨' StateList '⟩'
StateList ::= StateItem (',' StateItem)*
StateItem ::= Identifier ':' Expression

ComponentBody ::= (StyledElement | Statement)*
StyledElement ::= '樣' '{' StyleRules '}' '⟦' Content '⟧'

Documentation ::= '檔' '⟨' DocumentationText '⟩'
```

### Expressions

```ebnf
Expression ::= TextLiteral
            | ListLiteral
            | ObjectLiteral  
            | NumericLiteral
            | Identifier
            | Word

TextLiteral ::= '文' '⟨' TextContent '⟩'
ListLiteral ::= '列' '⟨' ExpressionList? '⟩'
ObjectLiteral ::= '物' '⟨' PropertyList? '⟩'

ExpressionList ::= Expression (',' Expression)*
PropertyList ::= Property (',' Property)*
Property ::= Identifier ':' Expression

NumericLiteral ::= ChineseNumber | ArabicNumber
ChineseNumber ::= ('零'|'一'|'二'|'三'|'四'|'五'|'六'|'七'|'八'|'九')+
ArabicNumber ::= [0-9]+

Word ::= CoreWord | TechTerm
Identifier ::= [a-zA-Z_$][a-zA-Z0-9_$]*
```

## Type System

GaiaScript uses TypeScript's type system. All GaiaScript constructs map to equivalent TypeScript types:

- 文 → string
- 列 → Array<T>
- 物 → Record<string, any> or interface
- 函 → Function
- 組 → React.FC
- 界 → JSX.Element
- 狀 → Variable declarations
- Numbers → number

## Error Handling

The compiler provides detailed error messages with source location information:

```
Error: Expected '⟩' after function parameters
  at line 5, column 12 in main.gaia
  
  函⟨greet, name
            ^
  Expected closing bracket here
```

## Best Practices

1. **Consistent Formatting**: Use proper indentation (2 spaces)
2. **Meaningful Names**: Choose descriptive identifiers even in English
3. **Documentation**: Use 檔⟨⟩ for function and component documentation  
4. **State Management**: Declare all state variables in 狀⟨⟩ blocks
5. **Component Structure**: Keep components focused and reusable
6. **Import Organization**: Group related imports together

## Future Extensions

The syntax is designed to be extensible for future language features:

- Pattern matching
- Async/await constructs  
- Generic type parameters
- Decorators and annotations
- Module system enhancements