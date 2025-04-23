LynxJs Documentation
1. Introduction
LynxJs is a cross-platform framework developed by ByteDance, designed to empower developers to build native user interfaces for iOS, Android, and web applications from a single codebase. Leveraging web technologies such as JavaScript, TypeScript, and a React-like component-based syntax, LynxJs enables web developers to create high-performance apps with native capabilities. Its Rust-powered optimizations ensure fast execution, making it a compelling choice for cross-platform development. LynxJs is supported by a suite of tools, including Lynx Explorer for previewing apps and Lynx DevTool for debugging.
2. Getting Started
System Requirements
To develop with LynxJs, ensure your environment meets the following requirements:

Node.js: Version 18 or later (18.19+ recommended for TypeScript projects).
iOS Development: macOS with Xcode installed.
Android Development: Android SDK.
Development Tools:
Lynx Explorer: For previewing and testing apps on devices.
Lynx DevTool: For debugging and performance analysis.






Requirement
Details



Node.js
Version 18 or later


iOS
macOS with Xcode


Android
Android SDK


Tools
Lynx Explorer, Lynx DevTool


Installation
To create a new LynxJs project:

Open a terminal in your desired project directory.

Run:
npm create rspeedy@latest


Follow the prompts to specify:

Project name (press Tab for default).
Language (TypeScript is recommended).
Additional tools (e.g., Biome for linting).


Navigate to the project directory and install dependencies:
cd <project-name>
npm install



Previewing the App
To preview your LynxJs app:

Download and install Lynx Explorer from the official website (available for iOS and Android).

Start the development server:
npm run dev


A QR code will appear in the terminal. Scan it with Lynx Explorer on your device to view the app.


Debugging
Lynx DevTool provides robust debugging capabilities:

Download it from its GitHub repository.
Connect your device via USB to inspect logs, network requests, and performance metrics.
Use Lynx DevTool to optimize your app’s performance, especially for animations and rendering.

3. Writing Code
LynxJs uses TypeScript with JSX (TSX) to create component-based user interfaces, similar to React or React Native. It provides a set of native components such as <view>, <text>, and <image> to build layouts.
Example Component
Below is a simple LynxJs component:
import { Component } from '@lynx-ui/react';

export default class App extends Component {
  render() {
    return (
      <view>
        <text>Hello, Lynx!</text>
      </view>
    );
  }
}

Key Features

Multi-Threading: LynxJs supports multi-threading with directives like "background-only" to offload tasks and improve performance.

Conditional Coding: Handle differences between Lynx and web environments using conditional logic. For example:
const isLynx = typeof window === 'undefined';
return isLynx ? (
  <view>
    <text>Lynx Environment</text>
  </view>
) : (
  <main>
    <h1>Web Environment</h1>
  </main>
);


Component Properties: LynxJs uses different event handlers than web frameworks. For example:

Lynx: bindinput and bindblur for input fields.
Web: onChange and onSubmit.



Styling
LynxJs supports CSS for styling, either through external CSS files or inline styles:
<view style={{ backgroundColor: 'white', padding: 10 }}>
  <text style={{ color: 'blue', fontSize: 16 }}>Styled Text</text>
</view>

4. Building the Project
LynxJs projects are built using modern tools to ensure fast and efficient compilation and bundling.
Build Command
To build your project for production:
npm run build

This command uses:

Rspack: A high-performance bundler compatible with webpack, optimized for LynxJs projects (Rspack).
SWC: A Rust-based compiler for JavaScript and TypeScript, enabling sub-second build times (SWC).

Configuration
LynxJs projects use a configuration file, lynx.config.ts, to customize the build process. An example configuration:
import { defineConfig } from 'rsbuild';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';

export default defineConfig({
  plugins: [pluginReactLynx()],
});

Build Process



Step
Tool
Purpose



Code Transformation
SWC
Compiles and transforms JavaScript/TypeScript code


Bundling
Rspack
Packages code and assets for deployment


Optimization
Rspack/SWC
Minifies and optimizes for performance


5. Creating a Compiler for LynxJs
Since LynxJs is a framework, not a distinct programming language, “compiling to LynxJs” refers to generating JavaScript or TypeScript code that uses LynxJs’s component library and APIs. This could involve:

Translating from Another Framework: Converting code from frameworks like React or Flutter to LynxJs-compatible code by mapping components (e.g., React’s <div> to Lynx’s <view>).
Custom DSL: Creating a compiler that takes a domain-specific language (DSL) and outputs LynxJs code.

Example Compiler Concept
Suppose you want to create a compiler that translates a simple DSL to LynxJs:

DSL Input:
<box>
  <label>Hello, World!</label>
</box>


LynxJs Output:
<view>
  <text>Hello, World!</text>
</view>



The compiler would need to:

Parse the DSL input.
Map DSL elements to LynxJs components (e.g., <box> to <view>, <label> to <text>).
Generate valid TSX code compatible with LynxJs.

Challenges

Platform Differences: LynxJs code must account for iOS, Android, and web-specific behaviors, requiring conditional logic or platform-specific mappings.
Event Handling: The compiler must handle LynxJs-specific event handlers (e.g., bindinput) correctly.
Styling: Ensure styles in the source language are compatible with LynxJs’s CSS-based styling.

Without specific details on the source language or framework, the compiler’s design remains high-level. If you have a particular input language or framework in mind, please provide more details for a tailored solution.
6. Additional Notes

Cross-Platform Support: LynxJs apps target iOS 10, Android 5.0 (API 21), or newer.
Performance: LynxJs uses PrimJS, a custom JavaScript engine, for enhanced performance (PrimJS).
Community: Engage with the LynxJs community via GitHub for support and contributions.
Licensing: LynxJs is licensed under Apache License 2.0, with documentation under Creative Commons Attribution 4.0.

7. System Prompt
The “system prompt” is interpreted as the command to build a LynxJs project:
npm run build

This command triggers the build process, leveraging Rspack for bundling and SWC for code transformation, producing optimized code for deployment.
