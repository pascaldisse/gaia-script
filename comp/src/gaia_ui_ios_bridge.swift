import UIKit
import JavaScriptCore

/**
 * GaiaUI Swift Bridge
 * This class provides a bridge between Swift/UIKit and the JavaScript GaiaUI runtime
 */
class GaiaUIBridge {
    private let jsContext = JSContext()!
    private var rootView: UIView
    private var gaiaUIRuntime: String {
        // Minified GaiaUI runtime
        return """
        const c=e=>{let t=e;const n=new Set;return{getState:()=>t,setState:e=>{t=e,n.forEach(e=>e(t))},update:(e,c)=>{if("string"==typeof e){const n={...t};n[e]="function"==typeof c?c(t[e]):c,t=n}else t="function"==typeof e?e(t):e;n.forEach(e=>e(t))},subscribe:e=>(n.add(e),()=>n.delete(e)),notify:()=>n.forEach(e=>e(t))}},s=(e,t={})=>{const n=document.createElement(e);return Object.entries(t).forEach(([e,t])=>{if("style"===e)Object.assign(n.style,t);else if(e.startsWith("on")){const c=e.substring(2).toLowerCase();n.addEventListener(c,t)}else n[e]=t}),n};
        """
    }
    
    init(rootView: UIView) {
        self.rootView = rootView
        setupJSContext()
    }
    
    private func setupJSContext() {
        // Set up console.log
        let consoleLog: @convention(block) (String) -> Void = { message in
            print("GAIA JS: \(message)")
        }
        jsContext.setObject(consoleLog, forKeyedSubscript: "consoleLog" as NSString)
        jsContext.evaluateScript("console = { log: consoleLog }")
        
        // Inject bridge functions
        setupBridgeFunctions()
        
        // Inject runtime
        jsContext.evaluateScript(gaiaUIRuntime)
    }
    
    private func setupBridgeFunctions() {
        // createElement bridge
        let createElement: @convention(block) (String, JSValue) -> JSValue = { [weak self] type, props in
            guard let self = self else { 
                return JSValue(nullIn: self?.jsContext) 
            }
            
            let view = self.createUIKitElement(type: type, props: props)
            return JSValue(object: ["_nativeView": view], in: self.jsContext)
        }
        jsContext.setObject(createElement, forKeyedSubscript: "_createElement" as NSString)
        
        // Update element properties bridge
        let updateElement: @convention(block) (JSValue, JSValue) -> Void = { [weak self] element, props in
            guard let view = element.objectForKeyedSubscript("_nativeView").toObject() as? UIView else {
                return
            }
            
            DispatchQueue.main.async {
                self?.updateUIKitElement(view: view, props: props)
            }
        }
        jsContext.setObject(updateElement, forKeyedSubscript: "_updateElement" as NSString)
        
        // Add event handler
        let addEventHandler: @convention(block) (JSValue, String, JSValue) -> Void = { element, eventName, handler in
            if let control = element.objectForKeyedSubscript("_nativeView").toObject() as? UIControl {
                let handlerWrapper = GaiaEventHandler(handler: handler)
                
                // Map event name to UIControl event
                let event: UIControl.Event
                switch eventName {
                case "tap":
                    event = .touchUpInside
                case "touchDown":
                    event = .touchDown
                default:
                    event = .touchUpInside
                }
                
                control.addTarget(handlerWrapper, action: #selector(GaiaEventHandler.handleEvent), for: event)
                
                // Store the handler to prevent deallocation
                objc_setAssociatedObject(control, &AssociatedKeys.eventHandler, handlerWrapper, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            }
        }
        jsContext.setObject(addEventHandler, forKeyedSubscript: "_addEventHandler" as NSString)
    }
    
    private func createUIKitElement(type: String, props: JSValue) -> UIView {
        switch type {
        case "div", "view":
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
            
        case "label", "text":
            let label = UILabel()
            if let text = props.objectForKeyedSubscript("text").toString() {
                label.text = text
            }
            updateUIKitElement(view: label, props: props)
            return label
            
        case "image":
            let imageView = UIImageView()
            if let src = props.objectForKeyedSubscript("src").toString(),
               let url = URL(string: src),
               let data = try? Data(contentsOf: url),
               let image = UIImage(data: data) {
                imageView.image = image
            }
            updateUIKitElement(view: imageView, props: props)
            return imageView
            
        case "input", "textField":
            let textField = UITextField()
            if let placeholder = props.objectForKeyedSubscript("placeholder").toString() {
                textField.placeholder = placeholder
            }
            if let text = props.objectForKeyedSubscript("text").toString() {
                textField.text = text
            }
            updateUIKitElement(view: textField, props: props)
            return textField
            
        default:
            return UIView()
        }
    }
    
    private func updateUIKitElement(view: UIView, props: JSValue) {
        // Handle styles
        if let style = props.objectForKeyedSubscript("style").toDictionary() as? [String: Any] {
            // Width/Height
            if let width = style["width"] as? NSNumber {
                view.frame.size.width = CGFloat(truncating: width)
            }
            if let height = style["height"] as? NSNumber {
                view.frame.size.height = CGFloat(truncating: height)
            }
            
            // Colors
            if let backgroundColor = style["backgroundColor"] as? String {
                view.backgroundColor = UIColor(hexString: backgroundColor)
            }
            
            // Border
            if let borderWidth = style["borderWidth"] as? NSNumber {
                view.layer.borderWidth = CGFloat(truncating: borderWidth)
            }
            if let borderColor = style["borderColor"] as? String {
                view.layer.borderColor = UIColor(hexString: borderColor).cgColor
            }
            if let cornerRadius = style["borderRadius"] as? NSNumber {
                view.layer.cornerRadius = CGFloat(truncating: cornerRadius)
            }
            
            // Margin/Padding require additional work for iOS
            // In a real implementation, we would handle these via UIView constraints
        }
        
        // Handle specific view type properties
        if let button = view as? UIButton {
            if let text = props.objectForKeyedSubscript("text").toString() {
                button.setTitle(text, for: .normal)
            }
            if let style = props.objectForKeyedSubscript("style").toDictionary() as? [String: Any],
               let color = style["color"] as? String {
                button.setTitleColor(UIColor(hexString: color), for: .normal)
            }
        } else if let label = view as? UILabel {
            if let text = props.objectForKeyedSubscript("text").toString() {
                label.text = text
            }
            if let style = props.objectForKeyedSubscript("style").toDictionary() as? [String: Any] {
                if let color = style["color"] as? String {
                    label.textColor = UIColor(hexString: color)
                }
                if let fontSize = style["fontSize"] as? NSNumber {
                    label.font = UIFont.systemFont(ofSize: CGFloat(truncating: fontSize))
                }
                if let textAlign = style["textAlign"] as? String {
                    switch textAlign {
                    case "center":
                        label.textAlignment = .center
                    case "right":
                        label.textAlignment = .right
                    default:
                        label.textAlignment = .left
                    }
                }
            }
        }
    }
    
    func renderComponent(componentJS: String) {
        // Inject the component JS
        jsContext.evaluateScript(componentJS)
        
        // Try to render the component
        guard let result = jsContext.evaluateScript("createComponent()") else {
            print("Failed to create component")
            return
        }
        
        guard let componentView = result.objectForKeyedSubscript("_nativeView").toObject() as? UIView else {
            print("Component didn't return a view")
            return
        }
        
        // Add the component view to the root view
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.rootView.subviews.forEach { $0.removeFromSuperview() }
            self.rootView.addSubview(componentView)
            componentView.frame = self.rootView.bounds
            componentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        }
    }
}

// Helper class to handle events
private class GaiaEventHandler: NSObject {
    let handler: JSValue
    
    init(handler: JSValue) {
        self.handler = handler
        super.init()
    }
    
    @objc func handleEvent() {
        handler.call(withArguments: [])
    }
}

// Associated object keys for event handlers
private struct AssociatedKeys {
    static var eventHandler = "gaiaEventHandler"
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