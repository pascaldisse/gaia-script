/**
 * GaiaUI Compiler
 * 
 * Minimal JavaScript framework compiler that compiles GaiaScript UI components
 * into optimized JavaScript, HTML, and CSS for web and native platforms.
 */

// Main compiler function
function compileGaiaUI(source) {
  // 1. Parse source into AST
  const ast = parseGaiaScript(source);
  
  // 2. Process the AST
  const components = processComponents(ast);
  
  // 3. Generate output for different platforms
  return {
    web: generateWebOutput(components),
    ios: generateiOSOutput(components),
    win: generateWindowsOutput(components)
  };
}

// Parse GaiaScript source into AST
function parseGaiaScript(source) {
  // Simple parser for demonstration
  // Real implementation would use proper parsing techniques
  
  const ast = { type: 'UI', components: [] };
  
  // Extract component definitions
  const componentRegex = /(\w+):⟨\{([^}]+)\}⟩/g;
  let match;
  
  while ((match = componentRegex.exec(source)) !== null) {
    const component = {
      name: match[1],
      content: match[2],
      type: 'component'
    };
    
    // Extract state, style, and render sections
    component.state = extractSection(component.content, 'state');
    component.style = extractSection(component.content, 'style');
    component.render = extractSection(component.content, 'render');
    
    ast.components.push(component);
  }
  
  return ast;
}

// Extract a section from a component definition
function extractSection(content, sectionName) {
  const regex = new RegExp(sectionName + ':⟨([^⟩]+)⟩', 'i');
  const match = regex.exec(content);
  return match ? match[1] : '';
}

// Process AST components
function processComponents(ast) {
  const processedComponents = [];
  
  for (const component of ast.components) {
    // Process state declarations
    const state = processState(component.state);
    
    // Process style declarations
    const style = processStyle(component.style);
    
    // Process render function
    const render = processRender(component.render);
    
    processedComponents.push({
      name: component.name,
      state,
      style,
      render
    });
  }
  
  return processedComponents;
}

// Process state declarations
function processState(stateStr) {
  const state = {};
  const stateItems = stateStr.split(',');
  
  for (const item of stateItems) {
    if (item.includes(':')) {
      const [key, value] = item.split(':');
      state[key.trim()] = isNaN(value) ? value.trim() : Number(value);
    }
  }
  
  return state;
}

// Process style declarations
function processStyle(styleStr) {
  const styles = {};
  
  // Extract hierarchical styles
  const selectorRegex = /(\w+):⟨([^⟩]+)⟩/g;
  let match;
  
  while ((match = selectorRegex.exec(styleStr)) !== null) {
    const selector = match[1];
    const styleProps = match[2];
    
    styles[selector] = {};
    
    // Extract style properties
    const props = styleProps.split(',');
    for (const prop of props) {
      if (prop.includes(':')) {
        const [key, value] = prop.split(':');
        styles[selector][key.trim()] = value.trim();
      }
    }
  }
  
  return styles;
}

// Process render functions
function processRender(renderStr) {
  // Extract UI component hierarchy and event handlers
  // This is a simplified implementation
  
  const elements = [];
  const events = [];
  
  // Extract main layout components
  const layoutRegex = /(П|⊞)(\d+)×(\d+)/g;
  let layoutMatch;
  
  while ((layoutMatch = layoutRegex.exec(renderStr)) !== null) {
    elements.push({
      type: layoutMatch[1] === 'П' ? 'panel' : 'grid',
      rows: Number(layoutMatch[2]),
      cols: Number(layoutMatch[3])
    });
  }
  
  // Extract buttons
  const buttonRegex = /⌘"([^"]+)"⌘(\w+)→([^)]+)/g;
  let buttonMatch;
  
  while ((buttonMatch = buttonRegex.exec(renderStr)) !== null) {
    elements.push({
      type: 'button',
      text: buttonMatch[1],
      event: buttonMatch[2],
      action: buttonMatch[3]
    });
    
    events.push({
      element: 'button',
      event: buttonMatch[2],
      action: buttonMatch[3]
    });
  }
  
  // Extract labels with bindings
  const labelRegex = /⌑"([^"]+)"⇄(\w+)/g;
  let labelMatch;
  
  while ((labelMatch = labelRegex.exec(renderStr)) !== null) {
    elements.push({
      type: 'label',
      text: labelMatch[1],
      binding: labelMatch[2]
    });
  }
  
  return { elements, events };
}

// Generate web output (HTML, CSS, JS)
function generateWebOutput(components) {
  let html = '';
  let css = '';
  let js = '';
  
  for (const component of components) {
    // Generate HTML
    html += generateComponentHTML(component);
    
    // Generate CSS
    css += generateComponentCSS(component);
    
    // Generate JS
    js += generateComponentJS(component);
  }
  
  return {
    html,
    css,
    js
  };
}

// Generate HTML for a component
function generateComponentHTML(component) {
  let html = `<div id="${component.name}-container" class="${component.name}-container">\n`;
  
  for (const element of component.render.elements) {
    switch (element.type) {
      case 'panel':
        html += `  <div class="${component.name}-panel">\n`;
        break;
      case 'grid':
        html += `  <div class="${component.name}-grid" style="display: grid; grid-template-rows: repeat(${element.rows}, 1fr); grid-template-columns: repeat(${element.cols}, 1fr);">\n`;
        break;
      case 'button':
        html += `    <button class="${component.name}-button" data-action="${element.action}">${element.text}</button>\n`;
        break;
      case 'label':
        html += `    <div class="${component.name}-label" data-bind="${element.binding}">${element.text.replace('${' + element.binding + '}', '{{' + element.binding + '}}')}</div>\n`;
        break;
    }
  }
  
  html += element.type === 'panel' || element.type === 'grid' ? '  </div>\n' : '';
  html += '</div>\n';
  
  return html;
}

// Generate CSS for a component
function generateComponentCSS(component) {
  let css = '';
  
  for (const [selector, props] of Object.entries(component.style)) {
    css += `.${component.name}-${selector} {\n`;
    
    for (const [property, value] of Object.entries(props)) {
      // Convert GaiaUI style properties to CSS
      const cssProperty = convertToCSSProperty(property);
      css += `  ${cssProperty}: ${value};\n`;
    }
    
    css += '}\n\n';
  }
  
  return css;
}

// Convert GaiaUI property names to CSS property names
function convertToCSSProperty(property) {
  const propertyMap = {
    'align': 'text-align',
    'fontSize': 'font-size'
  };
  
  return propertyMap[property] || property;
}

// Generate JavaScript for a component
function generateComponentJS(component) {
  let js = '';
  
  // Create store with initial state
  js += `// ${component.name} component\n`;
  js += `const ${component.name}Store = createStore(${JSON.stringify(component.state)});\n\n`;
  
  // Add event handlers
  for (const event of component.render.events) {
    js += `document.querySelectorAll('[data-action="${event.action}"]').forEach(el => {\n`;
    js += `  el.addEventListener('${event.event}', () => {\n`;
    
    if (event.action.includes('⊕')) {
      const stateVar = event.action.replace('⊕', '');
      js += `    ${component.name}Store.update('${stateVar}', val => val + 1);\n`;
    } else if (event.action.includes('⊝')) {
      const stateVar = event.action.replace('⊝', '');
      js += `    ${component.name}Store.update('${stateVar}', val => val - 1);\n`;
    } else {
      js += `    ${component.name}Store.update('${event.action}');\n`;
    }
    
    js += `  });\n`;
    js += `});\n\n`;
  }
  
  // Add bindings
  js += `// Set up bindings\n`;
  js += `${component.name}Store.subscribe(state => {\n`;
  js += `  document.querySelectorAll('[data-bind]').forEach(el => {\n`;
  js += `    const binding = el.getAttribute('data-bind');\n`;
  js += `    if (binding in state) {\n`;
  js += `      el.textContent = el.textContent.replace(/\\{\\{${binding}\\}\\}/g, state[binding]);\n`;
  js += `    }\n`;
  js += `  });\n`;
  js += `});\n\n`;
  
  // Initial render
  js += `${component.name}Store.notify();\n`;
  
  return js;
}

// Core runtime functions (minified)
const gaiaUIRuntime = `
// GaiaUI minimal runtime - ~1KB minified
const h=document.createElement.bind(document),q=document.querySelector.bind(document),a=(e,t,n)=>e.addEventListener(t,n),r=(e,t)=>Object.entries(t).forEach(([t,n])=>e[t]=n),s=(e,t)=>Object.assign(e.style,t),c=(e,t)=>e.appendChild(t),l=e=>{let t=e;return{get:()=>t,set:e=>t=e,update:(e,n)=>{t="function"==typeof e?e(t):e}}},u=e=>{const t=l(e),n=new Set;return{getState:t.get,setState:e=>{t.set(e),n.forEach(e=>e(t.get()))},update:(e,r)=>{t.update(e,r),n.forEach(e=>e(t.get()))},subscribe:e=>(n.add(e),()=>n.delete(e)),notify:()=>n.forEach(e=>e(t.get()))}},d=(e,t={})=>{const n=h("div");return r(n,t),e&&(n.textContent=e),n},p=(e,t={})=>{const n=h("button");return r(n,t),n.textContent=e||"",n},f=(e,t)=>{const n=q(e);n&&(n.textContent=t)},m=(e,t,n)=>{const r=q(e);r&&a(r,t,n)},y=(e,t)=>{const n=u(t);let r=null;const a=n=>r=n;return{render:()=>{const u=h("div");return s(u,e.style||{}),r=u,e.components&&e.components.forEach(e=>{const t=e.render();t&&c(r,t)}),a(u),u},getStore:()=>n,update:e=>{n.update(e)},subscribe:e=>n.subscribe(e),getContainer:()=>r}};

// Create store function
function createStore(initialState) {
  return u(initialState);
}

// createElement function 
function createElement(type, props, ...children) {
  const el = document.createElement(type);
  if (props) Object.entries(props).forEach(([k, v]) => {
    if (k === 'style') Object.assign(el.style, v);
    else el[k] = v;
  });
  children.forEach(child => {
    if (typeof child === 'string') el.textContent = child;
    else if (child) el.appendChild(child);
  });
  return el;
}

// render function
function render(component, container) {
  const root = typeof container === 'string' ? document.querySelector(container) : container;
  if (!root) return;
  root.innerHTML = '';
  root.appendChild(component);
}
`;

// Generate iOS/Mac output 
function generateiOSOutput(components) {
  let swift = `import UIKit
import JavaScriptCore

// GaiaUI Swift Bridge
class GaiaUIBridge {
    private let jsContext = JSContext()!
    private var rootView: UIView
    
    init(rootView: UIView) {
        self.rootView = rootView
        setupJSContext()
    }
    
    private func setupJSContext() {
        // Set up console.log
        let consoleLog: @convention(block) (String) -> Void = { message in
            print("JS: \\(message)")
        }
        jsContext.setObject(consoleLog, forKeyedSubscript: "consoleLog" as NSString)
        jsContext.evaluateScript("console = { log: consoleLog }")
        
        // Inject bridge functions
        setupBridgeFunctions()
        
        // Inject runtime
        jsContext.evaluateScript(gaiaRuntimeJS)
    }
    
    private func setupBridgeFunctions() {
        // createElement bridge
        let createElement: @convention(block) (String, JSValue) -> JSValue = { type, props in
            DispatchQueue.main.sync {
                let view = self.createUIKitElement(type: type, props: props)
                return JSValue(object: ["_nativeView": view], in: self.jsContext)
            }
            return JSValue(nullIn: self.jsContext)
        }
        jsContext.setObject(createElement, forKeyedSubscript: "_createElement" as NSString)
        
        // Update element properties bridge
        let updateElement: @convention(block) (JSValue, JSValue) -> Void = { element, props in
            if let view = element.objectForKeyedSubscript("_nativeView").toObject() as? UIView {
                DispatchQueue.main.async {
                    self.updateUIKitElement(view: view, props: props)
                }
            }
        }
        jsContext.setObject(updateElement, forKeyedSubscript: "_updateElement" as NSString)
    }
    
    private func createUIKitElement(type: String, props: JSValue) -> UIView {
        switch type {
        case "div":
            let view = UIView()
            updateUIKitElement(view: view, props: props)
            return view
        case "button":
            let button = UIButton(type: .system)
            if let text = props.objectForKeyedSubscript("text").toString() {
                button.setTitle(text, for: .normal)
            }
            updateUIKitElement(view: button, props: props)
            return button
        case "label":
            let label = UILabel()
            if let text = props.objectForKeyedSubscript("text").toString() {
                label.text = text
            }
            updateUIKitElement(view: label, props: props)
            return label
        default:
            return UIView()
        }
    }
    
    private func updateUIKitElement(view: UIView, props: JSValue) {
        if let style = props.objectForKeyedSubscript("style").toDictionary() {
            if let width = style["width"] as? NSNumber {
                view.frame.size.width = CGFloat(truncating: width)
            }
            if let height = style["height"] as? NSNumber {
                view.frame.size.height = CGFloat(truncating: height)
            }
            if let backgroundColor = style["backgroundColor"] as? String {
                view.backgroundColor = UIColor(hexString: backgroundColor)
            }
            // Additional style properties could be added here
        }
    }
    
    func renderComponent(componentJS: String) {
        // Evaluate component JS
        jsContext.evaluateScript(componentJS)
        
        // Get the rendered component
        if let result = jsContext.evaluateScript("renderComponent()") {
            if let componentView = result.objectForKeyedSubscript("_nativeView").toObject() as? UIView {
                DispatchQueue.main.async {
                    self.rootView.subviews.forEach { $0.removeFromSuperview() }
                    self.rootView.addSubview(componentView)
                    componentView.frame = self.rootView.bounds
                    componentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
                }
            }
        }
    }
}

// Helper extension for UIColor from hex string
extension UIColor {
    convenience init(hexString: String) {
        let hex = hexString.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int = UInt64()
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(red: CGFloat(r) / 255, green: CGFloat(g) / 255, blue: CGFloat(b) / 255, alpha: CGFloat(a) / 255)
    }
}
`;

  // JavaScript runtime for iOS/Mac
  const iosJS = ``;
  
  for (const component of components) {
    iosJS += generateiOSComponentJS(component);
  }
  
  return {
    swift,
    js: iosJS
  };
}

// Generate iOS component JavaScript
function generateiOSComponentJS(component) {
  return `
// ${component.name} component for iOS/Mac
function render${component.name}() {
  const store = createStore(${JSON.stringify(component.state)});
  
  // Create root container
  const container = _createElement('div', { style: ${JSON.stringify(component.style.container || {})} });
  
  // Create UI elements
  ${generateiOSComponentElements(component)}
  
  // Set up event handlers
  ${generateiOSComponentEvents(component)}
  
  // Set up bindings
  store.subscribe(state => {
    ${generateiOSComponentBindings(component)}
  });
  
  // Initial render
  store.notify();
  
  return container;
}
`;
}

// Generate iOS component elements
function generateiOSComponentElements(component) {
  let code = '';
  
  for (const element of component.render.elements) {
    switch (element.type) {
      case 'panel':
        code += `const panel = _createElement('div', { style: ${JSON.stringify(component.style.panel || {})} });\n`;
        code += `container.appendChild(panel);\n`;
        break;
      case 'button':
        code += `const ${element.action}Button = _createElement('button', { text: "${element.text}", style: ${JSON.stringify(component.style.button || {})} });\n`;
        code += `container.appendChild(${element.action}Button);\n`;
        break;
      case 'label':
        code += `const ${element.binding}Label = _createElement('label', { text: "${element.text.replace('${' + element.binding + '}', '')}", style: ${JSON.stringify(component.style.value || {})} });\n`;
        code += `container.appendChild(${element.binding}Label);\n`;
        break;
    }
  }
  
  return code;
}

// Generate iOS component events
function generateiOSComponentEvents(component) {
  let code = '';
  
  for (const event of component.render.events) {
    if (event.action.includes('⊕')) {
      const stateVar = event.action.replace('⊕', '');
      code += `${event.action}Button.addEventListener('tap', () => {\n`;
      code += `  store.update('${stateVar}', val => val + 1);\n`;
      code += `});\n`;
    } else if (event.action.includes('⊝')) {
      const stateVar = event.action.replace('⊝', '');
      code += `${event.action}Button.addEventListener('tap', () => {\n`;
      code += `  store.update('${stateVar}', val => val - 1);\n`;
      code += `});\n`;
    }
  }
  
  return code;
}

// Generate iOS component bindings
function generateiOSComponentBindings(component) {
  let code = '';
  
  for (const element of component.render.elements) {
    if (element.type === 'label' && element.binding) {
      code += `_updateElement(${element.binding}Label, { text: "${element.text.replace('${' + element.binding + '}', '')}" + state.${element.binding} });\n`;
    }
  }
  
  return code;
}

// Generate Windows output
function generateWindowsOutput(components) {
  let csharp = `using System;
using System.Collections.Generic;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using System.Windows.Forms;

namespace GaiaUI.Windows
{
    public class GaiaUIBridge
    {
        private WebView2 webView;
        private Form hostForm;

        public GaiaUIBridge(Form form)
        {
            hostForm = form;
            InitializeWebView();
        }

        private async void InitializeWebView()
        {
            webView = new WebView2();
            webView.Dock = DockStyle.Fill;
            hostForm.Controls.Add(webView);

            await webView.EnsureCoreWebView2Async(null);
            
            // Add JavaScript interop handlers
            webView.CoreWebView2.AddHostObjectToScript("nativeBridge", new NativeBridge());
            
            // Set HTML content
            SetHtmlContent();
        }

        private void SetHtmlContent()
        {
            string html = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 0; }
        /* Gaia UI Styles */
        ${GenerateCSSForAllComponents()}
    </style>
</head>
<body>
    <div id='app'></div>
    <script>
        // Bridge to C# code
        const nativeBridge = chrome.webview.hostObjects.nativeBridge;
        
        // GaiaUI Runtime
        ${gaiaUIRuntime}
        
        // Component implementations
        ${GenerateJSForAllComponents()}
        
        // Initialize the app
        document.addEventListener('DOMContentLoaded', () => {
            const app = document.getElementById('app');
            render(createCounter(), app);
        });
    </script>
</body>
</html>";

            webView.NavigateToString(html);
        }

        private string GenerateCSSForAllComponents()
        {
            // In a real implementation, this would come from the generated components
            return @"
.counter-container { display: flex; flex-direction: column; align-items: center; padding: 20px; }
.counter-button { background-color: #336; color: white; margin: 5px; width: 40px; height: 40px; border: none; border-radius: 4px; font-size: 18px; }
.counter-value { font-size: 24px; color: #222; margin: 10px 0; }";
        }

        private string GenerateJSForAllComponents()
        {
            // In a real implementation, this would come from the generated components
            return @"
function createCounter() {
    const store = createStore({ count: 0 });
    
    // Create elements
    const container = createElement('div', { className: 'counter-container' });
    const decButton = createElement('button', { className: 'counter-button', onclick: () => store.update('count', v => v - 1) }, '-');
    const valueDisplay = createElement('div', { className: 'counter-value' }, '0');
    const incButton = createElement('button', { className: 'counter-button', onclick: () => store.update('count', v => v + 1) }, '+');
    
    // Build component
    container.appendChild(decButton);
    container.appendChild(valueDisplay);
    container.appendChild(incButton);
    
    // Set up binding
    store.subscribe(state => {
        valueDisplay.textContent = state.count;
        // Report state change to C# host
        nativeBridge.reportState(JSON.stringify(state));
    });
    
    // Initial render
    store.notify();
    
    return container;
}";
        }
    }

    // C# class for JavaScript interop
    [System.Runtime.InteropServices.ComVisible(true)]
    public class NativeBridge
    {
        public void ReportState(string stateJson)
        {
            Console.WriteLine($"State changed: {stateJson}");
            // Handle state change in the native app
        }
    }
}`;

  return { csharp };
}

// Export the compiler
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    compileGaiaUI,
    gaiaUIRuntime
  };
}