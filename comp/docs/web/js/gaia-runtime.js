// Generated from GaiaScript: main.gaia
// Environment detection
const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
const isBrowser = typeof window !== 'undefined';

const gaiaRuntime = {
  components: {},
  network: null,
  title: "Main - GaiaScript",
  initialize: function() {
    this.network = function() {
      // Main network logic
      console.log("GaiaScript network initialized");
    };
  },
  initUI: function() {
    if (isBrowser) {
      // Set page title
      document.title = this.title;
      
      // Create container
      let container = document.getElementById('gaia-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'gaia-container';
        container.style.padding = '20px';
        container.style.margin = '10px';
        container.style.border = '1px solid #ccc';
        container.style.borderRadius = '8px';
        container.style.backgroundColor = '#f9f9f9';
        document.body.appendChild(container);
      }
      
      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        body { font-family: sans-serif; margin: 0; padding: 20px; }
        .gaia-button { 
          padding: 8px 16px; 
          margin: 4px; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer; 
          font-size: 16px; 
          color: white; 
          background-color: #4285f4; 
        }
        .gaia-button:hover { background-color: #2a75f3; }
        .play-button { background-color: #4caf50; }
        .play-button:hover { background-color: #45a049; }
        .reset-button { background-color: #f44336; }
        .reset-button:hover { background-color: #e53935; }
      `;
      document.head.appendChild(style);
      
      console.log("UI initialized");
    } else {
      console.log("UI initialization skipped (not in browser)");
      console.log("Run in a browser to see the UI, or open the HTML file if generated");
    }
  },
  run: function() {
    this.initialize();
    this.initUI();
    if (this.network) {
      this.network.call(this);
    }
  }
};

// Export for Node.js
if (isNode) {
  module.exports = gaiaRuntime;
}

// Run the GaiaScript program
gaiaRuntime.run();
