# GaiaScript to TypeScript AST Mapping

## Overview

This document details the precise mapping between GaiaScript constructs and TypeScript AST nodes. This mapping is used by the GaiaScript transformer to generate clean, idiomatic TypeScript code.

## Core Mappings

### 1. Text Literals (文)

**GaiaScript:**
```gaiascript
文⟨Hello, World!⟩
```

**GaiaScript AST:**
```json
{
  "kind": "TextLiteral",
  "text": "Hello, World!",
  "expandedText": "Hello, World!"
}
```

**TypeScript AST:**
```typescript
// ts.SyntaxKind.StringLiteral
{
  "kind": 10,
  "text": "Hello, World!"
}
```

**Generated TypeScript:**
```typescript
"Hello, World!"
```

### 2. Lists (列)

**GaiaScript:**
```gaiascript
列⟨一, 二, 三⟩
```

**GaiaScript AST:**
```json
{
  "kind": "ArrayLiteral",
  "children": [
    {"kind": "NumericLiteral", "text": "一", "expandedText": "1"},
    {"kind": "NumericLiteral", "text": "二", "expandedText": "2"},
    {"kind": "NumericLiteral", "text": "三", "expandedText": "3"}
  ]
}
```

**TypeScript AST:**
```typescript
// ts.SyntaxKind.ArrayLiteralExpression
ts.factory.createArrayLiteralExpression([
  ts.factory.createNumericLiteral("1"),
  ts.factory.createNumericLiteral("2"),
  ts.factory.createNumericLiteral("3")
])
```

**Generated TypeScript:**
```typescript
[1, 2, 3]
```

### 3. Objects (物)

**GaiaScript:**
```gaiascript
物⟨name: 文⟨Alice⟩, age: 二五⟩
```

**GaiaScript AST:**
```json
{
  "kind": "ObjectLiteral",
  "children": [
    {
      "kind": "PropertyAssignment",
      "children": [
        {"kind": "Identifier", "text": "name"},
        {"kind": "TextLiteral", "text": "Alice"}
      ]
    },
    {
      "kind": "PropertyAssignment", 
      "children": [
        {"kind": "Identifier", "text": "age"},
        {"kind": "NumericLiteral", "text": "二五", "expandedText": "25"}
      ]
    }
  ]
}
```

**TypeScript AST:**
```typescript
// ts.SyntaxKind.ObjectLiteralExpression
ts.factory.createObjectLiteralExpression([
  ts.factory.createPropertyAssignment("name", 
    ts.factory.createStringLiteral("Alice")),
  ts.factory.createPropertyAssignment("age",
    ts.factory.createNumericLiteral("25"))
])
```

**Generated TypeScript:**
```typescript
{
  name: "Alice",
  age: 25
}
```

### 4. Functions (函)

**GaiaScript:**
```gaiascript
函⟨greet, name⟩
  文⟨Hello, ${name}!⟩
⟨/函⟩
```

**GaiaScript AST:**
```json
{
  "kind": "FunctionDeclaration",
  "children": [
    {"kind": "Identifier", "text": "greet"},
    {
      "kind": "ParameterList",
      "children": [
        {"kind": "Parameter", "text": "name"}
      ]
    },
    {
      "kind": "Block",
      "children": [
        {"kind": "TextLiteral", "text": "Hello, ${name}!", "expandedText": "Hello, ${name}!"}
      ]
    }
  ]
}
```

**TypeScript AST:**
```typescript
// ts.SyntaxKind.FunctionDeclaration
ts.factory.createFunctionDeclaration(
  undefined, // modifiers
  undefined, // asteriskToken
  ts.factory.createIdentifier("greet"), // name
  undefined, // typeParameters
  [ts.factory.createParameterDeclaration(undefined, undefined, "name")], // parameters
  undefined, // type
  ts.factory.createBlock([
    ts.factory.createReturnStatement(
      ts.factory.createTemplateExpression(
        ts.factory.createTemplateHead("Hello, "),
        [ts.factory.createTemplateSpan(
          ts.factory.createIdentifier("name"),
          ts.factory.createTemplateTail("!")
        )]
      )
    )
  ])
)
```

**Generated TypeScript:**
```typescript
function greet(name) {
  return `Hello, ${name}!`;
}
```

### 5. Components (組)

**GaiaScript:**
```gaiascript
組⟨Button⟩
  樣{background: blue; color: white;}⟦文⟨Click⟩⟧
⟨/組⟩
```

**GaiaScript AST:**
```json
{
  "kind": "ComponentDeclaration",
  "children": [
    {"kind": "Identifier", "text": "Button"},
    {
      "kind": "ComponentBody",
      "children": [
        {
          "kind": "StyledElement",
          "children": [
            {"kind": "StyleBlock", "text": "background: blue; color: white;"},
            {"kind": "ContentBlock", "children": [
              {"kind": "TextLiteral", "text": "Click"}
            ]}
          ]
        }
      ]
    }
  ]
}
```

**TypeScript AST:**
```typescript
// ts.SyntaxKind.FunctionDeclaration (React functional component)
ts.factory.createFunctionDeclaration(
  undefined,
  undefined,
  ts.factory.createIdentifier("Button"),
  undefined,
  [],
  ts.factory.createTypeReferenceNode("JSX.Element"),
  ts.factory.createBlock([
    ts.factory.createReturnStatement(
      ts.factory.createJsxElement(
        ts.factory.createJsxOpeningElement(
          ts.factory.createIdentifier("div"),
          undefined,
          ts.factory.createJsxAttributes([
            ts.factory.createJsxAttribute(
              ts.factory.createIdentifier("style"),
              ts.factory.createJsxExpression(undefined,
                ts.factory.createObjectLiteralExpression([
                  ts.factory.createPropertyAssignment("background", ts.factory.createStringLiteral("blue")),
                  ts.factory.createPropertyAssignment("color", ts.factory.createStringLiteral("white"))
                ])
              )
            )
          ])
        ),
        [ts.factory.createJsxText("Click")],
        ts.factory.createJsxClosingElement(ts.factory.createIdentifier("div"))
      )
    )
  ])
)
```

**Generated TypeScript:**
```typescript
function Button(): JSX.Element {
  return (
    <div style={{ background: "blue", color: "white" }}>
      Click
    </div>
  );
}
```

### 6. UI Interface (界)

**GaiaScript:**
```gaiascript
界⟨✱⟩
  狀⟨count: 零⟩
  文⟨Count: ${count}⟩
⟨/界⟩
```

**GaiaScript AST:**
```json
{
  "kind": "UIInterfaceDeclaration",
  "children": [
    {
      "kind": "InterfaceBody",
      "children": [
        {
          "kind": "StateBlock",
          "children": [
            {
              "kind": "StateDeclaration",
              "children": [
                {"kind": "Identifier", "text": "count"},
                {"kind": "NumericLiteral", "text": "零", "expandedText": "0"}
              ]
            }
          ]
        },
        {"kind": "TextLiteral", "text": "Count: ${count}"}
      ]
    }
  ]
}
```

**TypeScript AST:**
```typescript
// Export default App component
ts.factory.createFunctionDeclaration(
  [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
  undefined,
  ts.factory.createIdentifier("App"),
  undefined,
  [],
  ts.factory.createTypeReferenceNode("JSX.Element"),
  ts.factory.createBlock([
    // State declaration
    ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList([
        ts.factory.createVariableDeclaration("count", undefined, undefined, ts.factory.createNumericLiteral("0"))
      ], ts.NodeFlags.Let)
    ),
    // Return JSX
    ts.factory.createReturnStatement(
      ts.factory.createTemplateExpression(
        ts.factory.createTemplateHead("Count: "),
        [ts.factory.createTemplateSpan(
          ts.factory.createIdentifier("count"),
          ts.factory.createTemplateTail("")
        )]
      )
    )
  ])
)
```

**Generated TypeScript:**
```typescript
export function App(): JSX.Element {
  let count = 0;
  return `Count: ${count}`;
}
```

### 7. State Management (狀)

**GaiaScript:**
```gaiascript
狀⟨
  user: 物⟨name: 文⟨Alice⟩⟩,
  isActive: true
⟩
```

**GaiaScript AST:**
```json
{
  "kind": "StateBlock",
  "children": [
    {
      "kind": "StateDeclaration",
      "children": [
        {"kind": "Identifier", "text": "user"},
        {
          "kind": "ObjectLiteral",
          "children": [
            {
              "kind": "PropertyAssignment",
              "children": [
                {"kind": "Identifier", "text": "name"},
                {"kind": "TextLiteral", "text": "Alice"}
              ]
            }
          ]
        }
      ]
    },
    {
      "kind": "StateDeclaration", 
      "children": [
        {"kind": "Identifier", "text": "isActive"},
        {"kind": "BooleanLiteral", "text": "true"}
      ]
    }
  ]
}
```

**TypeScript AST:**
```typescript
// Variable statement with multiple declarations
ts.factory.createVariableStatement(
  undefined,
  ts.factory.createVariableDeclarationList([
    ts.factory.createVariableDeclaration(
      "user",
      undefined,
      undefined,
      ts.factory.createObjectLiteralExpression([
        ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral("Alice"))
      ])
    ),
    ts.factory.createVariableDeclaration(
      "isActive", 
      undefined,
      undefined,
      ts.factory.createToken(ts.SyntaxKind.TrueKeyword)
    )
  ], ts.NodeFlags.Let)
)
```

**Generated TypeScript:**
```typescript
let user = { name: "Alice" };
let isActive = true;
```

### 8. Imports (導)

**GaiaScript:**
```gaiascript
導⟨React, useState, useEffect⟩
```

**GaiaScript AST:**
```json
{
  "kind": "ImportDeclaration",
  "children": [
    {"kind": "ImportSpecifier", "text": "React"},
    {"kind": "ImportSpecifier", "text": "useState"},
    {"kind": "ImportSpecifier", "text": "useEffect"}
  ]
}
```

**TypeScript AST:**
```typescript
// Import declaration
ts.factory.createImportDeclaration(
  undefined, // modifiers
  ts.factory.createImportClause(
    false, // isTypeOnly
    undefined, // name (default import)
    ts.factory.createNamedImports([
      ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier("React")),
      ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier("useState")),
      ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier("useEffect"))
    ])
  ),
  ts.factory.createStringLiteral("@gaia/runtime"), // moduleSpecifier
  undefined // assertClause
)
```

**Generated TypeScript:**
```typescript
import { React, useState, useEffect } from "@gaia/runtime";
```

### 9. Documentation (檔)

**GaiaScript:**
```gaiascript
檔⟨
  This function adds two numbers
  @param a First number
  @param b Second number  
  @returns Sum of a and b
⟩
```

**GaiaScript AST:**
```json
{
  "kind": "Documentation",
  "text": "This function adds two numbers\n@param a First number\n@param b Second number\n@returns Sum of a and b",
  "expandedText": "This function adds two numbers\n@param a First number\n@param b Second number\n@returns Sum of a and b"
}
```

**TypeScript AST:**
```typescript
// JSDoc comment (attached to following declaration)
{
  kind: ts.SyntaxKind.JSDocComment,
  comment: "This function adds two numbers",
  tags: [
    {
      kind: ts.SyntaxKind.JSDocParameterTag,
      name: "a",
      comment: "First number"
    },
    {
      kind: ts.SyntaxKind.JSDocParameterTag, 
      name: "b",
      comment: "Second number"
    },
    {
      kind: ts.SyntaxKind.JSDocReturnTag,
      comment: "Sum of a and b"
    }
  ]
}
```

**Generated TypeScript:**
```typescript
/**
 * This function adds two numbers
 * @param a First number
 * @param b Second number
 * @returns Sum of a and b
 */
```

## AST Node Factory Methods

The transformer uses TypeScript's `ts.factory` to create AST nodes:

### Core Factory Methods Used

```typescript
// Literals
ts.factory.createStringLiteral(text: string)
ts.factory.createNumericLiteral(value: string | number)
ts.factory.createBooleanLiteral(value: boolean)

// Expressions
ts.factory.createArrayLiteralExpression(elements: ts.Expression[])
ts.factory.createObjectLiteralExpression(properties: ts.ObjectLiteralElementLike[])
ts.factory.createPropertyAssignment(name: string | ts.PropertyName, initializer: ts.Expression)

// Statements
ts.factory.createFunctionDeclaration(
  modifiers: ts.Modifier[],
  asteriskToken: ts.AsteriskToken,
  name: ts.Identifier,
  typeParameters: ts.TypeParameterDeclaration[],
  parameters: ts.ParameterDeclaration[],
  type: ts.TypeNode,
  body: ts.Block
)

ts.factory.createVariableStatement(
  modifiers: ts.Modifier[],
  declarationList: ts.VariableDeclarationList
)

ts.factory.createVariableDeclarationList(
  declarations: ts.VariableDeclaration[],
  flags: ts.NodeFlags
)

ts.factory.createImportDeclaration(
  modifiers: ts.Modifier[],
  importClause: ts.ImportClause,
  moduleSpecifier: ts.Expression,
  assertClause: ts.AssertClause
)

// JSX
ts.factory.createJsxElement(
  openingElement: ts.JsxOpeningElement,
  children: ts.JsxChild[],
  closingElement: ts.JsxClosingElement
)

ts.factory.createJsxAttribute(
  name: ts.Identifier,
  initializer: ts.StringLiteral | ts.JsxExpression
)

// Templates
ts.factory.createTemplateExpression(
  head: ts.TemplateHead,
  templateSpans: ts.TemplateSpan[]
)
```

## Type Annotations

The transformer can optionally add TypeScript type annotations:

### Function Types

```gaiascript
函⟨add, a: number, b: number⟩ -> number
  a + b
⟨/函⟩
```

**Generated TypeScript:**
```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

### Interface Types

```gaiascript
型⟨User⟩
  name: string,
  age: number,
  email?: string
⟨/型⟩
```

**Generated TypeScript:**
```typescript
interface User {
  name: string;
  age: number;
  email?: string;
}
```

## Error Recovery

The transformer includes error recovery mechanisms:

1. **Missing Nodes**: Generate placeholder nodes for missing required elements
2. **Type Mismatches**: Use `any` type when specific types cannot be inferred
3. **Invalid Syntax**: Generate comments with error information
4. **Partial Transformations**: Continue processing remaining nodes after errors

## Performance Optimizations

1. **Node Reuse**: Cache and reuse common AST nodes
2. **Lazy Evaluation**: Only transform nodes when needed
3. **Batch Processing**: Group related transformations
4. **Memory Management**: Dispose of large AST structures when done

This mapping ensures that GaiaScript code is transformed into clean, idiomatic TypeScript that maintains the original semantics while leveraging TypeScript's type system and tooling.