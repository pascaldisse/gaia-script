import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Create window
        window = UIWindow(frame: UIScreen.main.bounds)
        
        // Set up root view controller
        let rootVC = GaiaUIViewController()
        window?.rootViewController = rootVC
        window?.makeKeyAndVisible()
        
        return true
    }
}

class GaiaUIViewController: UIViewController {
    private var gaiaUIBridge: GaiaUIBridge?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        
        // Initialize the container for GaiaUI
        let containerView = UIView(frame: view.bounds)
        containerView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(containerView)
        
        // Create the bridge
        gaiaUIBridge = GaiaUIBridge(rootView: containerView)
        
        // Counter component JavaScript
        let counterComponentJS = """
        function createComponent() {
            // Create the store with initial state
            const store = c({ count: 0 });
            
            // Create container
            const container = _createElement('div', { 
                style: { 
                    backgroundColor: '#ffffff', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20
                }
            });
            
            // Create header
            const header = _createElement('label', {
                text: 'GaiaUI Counter',
                style: {
                    fontSize: 22,
                    color: '#333333',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: 20
                }
            });
            
            // Create counter display
            const countLabel = _createElement('label', {
                text: '0',
                style: {
                    fontSize: 40,
                    color: '#222222',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: 20
                }
            });
            
            // Create buttons container
            const buttonsContainer = _createElement('div', {
                style: {
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%'
                }
            });
            
            // Create decrement button
            const decrementButton = _createElement('button', {
                text: '-',
                style: {
                    backgroundColor: '#336699',
                    color: '#ffffff',
                    width: 50,
                    height: 50,
                    fontSize: 24,
                    margin: 10,
                    borderRadius: 25
                }
            });
            
            // Create increment button
            const incrementButton = _createElement('button', {
                text: '+',
                style: {
                    backgroundColor: '#336699',
                    color: '#ffffff',
                    width: 50,
                    height: 50,
                    fontSize: 24,
                    margin: 10,
                    borderRadius: 25
                }
            });
            
            // Assemble the component
            container.appendChild(header);
            container.appendChild(countLabel);
            buttonsContainer.appendChild(decrementButton);
            buttonsContainer.appendChild(incrementButton);
            container.appendChild(buttonsContainer);
            
            // Add event handlers
            _addEventHandler(decrementButton, 'tap', function() {
                store.update('count', function(currentCount) {
                    return currentCount - 1;
                });
            });
            
            _addEventHandler(incrementButton, 'tap', function() {
                store.update('count', function(currentCount) {
                    return currentCount + 1;
                });
            });
            
            // Subscribe to state changes
            store.subscribe(function(state) {
                _updateElement(countLabel, { text: state.count.toString() });
            });
            
            // Initialize with current state
            store.notify();
            
            return container;
        }
        """
        
        // Render the counter component
        gaiaUIBridge?.renderComponent(componentJS: counterComponentJS)
    }
}