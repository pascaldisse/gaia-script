/**
 * GaiaScript Interactive Demo
 * 
 * This file provides interactive visualization for GaiaScript components
 * Add this to your GaiaScript HTML output to enhance the visualization.
 */

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', function() {
    // Initialize the GaiaScript demo
    initGaiaDemo();
  });
}

function initGaiaDemo() {
  console.log('Initializing GaiaScript Demo');
  
  // Find or create the container
  const container = document.getElementById('gaia-container') || document.body;
  
  // Create a better UI for the demo
  const demoUI = document.createElement('div');
  demoUI.id = 'gaia-demo-ui';
  demoUI.innerHTML = `
    <div class="gaia-control-panel">
      <h3>GaiaScript Controls</h3>
      <div class="gaia-button-group">
        <button id="gaia-run-button" class="gaia-button play-button">▶ Run</button>
        <button id="gaia-reset-button" class="gaia-button reset-button">↺ Reset</button>
        <button id="gaia-settings-button" class="gaia-button settings-button">⚙ Settings</button>
      </div>
    </div>
    
    <div id="gaia-visualization" class="gaia-panel">
      <h3>Network Visualization</h3>
      <canvas id="gaia-network-canvas" width="600" height="300"></canvas>
    </div>
    
    <div id="gaia-component-details" class="gaia-panel">
      <h3>Component Details</h3>
      <div id="gaia-component-list"></div>
    </div>
  `;
  
  // Add styles for the demo UI
  const style = document.createElement('style');
  style.textContent = `
    #gaia-demo-ui {
      font-family: sans-serif;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .gaia-control-panel {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .gaia-panel {
      background-color: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .gaia-button-group {
      display: flex;
      gap: 10px;
    }
    
    .gaia-button {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      color: white;
      transition: background-color 0.2s;
    }
    
    .play-button {
      background-color: #4caf50;
    }
    
    .play-button:hover {
      background-color: #45a049;
    }
    
    .reset-button {
      background-color: #f44336;
    }
    
    .reset-button:hover {
      background-color: #e53935;
    }
    
    .settings-button {
      background-color: #ff9800;
    }
    
    .settings-button:hover {
      background-color: #fb8c00;
    }
    
    #gaia-network-canvas {
      width: 100%;
      height: 300px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .component-card {
      padding: 10px;
      margin-bottom: 10px;
      border-radius: 5px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      position: relative;
    }
    
    .component-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }
    
    .component-title {
      font-weight: bold;
      font-size: 18px;
    }
    
    .component-status {
      font-size: 14px;
      color: #666;
    }
    
    .component-content {
      padding: 5px 0;
    }
    
    .component-controls {
      margin-top: 10px;
    }
  `;
  
  document.head.appendChild(style);
  container.appendChild(demoUI);
  
  // Initialize components
  const components = [
    { id: 'υ', name: 'Upsilon', description: 'UI Component', color: '#e8f5e9', borderColor: '#66bb6a' },
    { id: 'η', name: 'Eta', description: 'Neural Network', color: '#e3f2fd', borderColor: '#42a5f5' },
    { id: 'Γ', name: 'Gamma', description: 'GAN Component', color: '#f3e5f5', borderColor: '#ab47bc' },
    { id: 'μ', name: 'Mu', description: 'Transform Operations', color: '#e0f7fa', borderColor: '#26c6da' },
    { id: '∂', name: 'Partial', description: 'Differential Operations', color: '#fff8e1', borderColor: '#ffca28' },
    { id: 'ℝ', name: 'Real', description: 'Number System', color: '#fbe9e7', borderColor: '#ff7043' }
  ];
  
  // Create component cards
  const componentList = document.getElementById('gaia-component-list');
  components.forEach(component => {
    const card = document.createElement('div');
    card.className = 'component-card';
    card.style.backgroundColor = component.color;
    card.style.borderLeft = `5px solid ${component.borderColor}`;
    
    card.innerHTML = `
      <div class="component-header">
        <div class="component-title">${component.id} (${component.name})</div>
        <div class="component-status">Idle</div>
      </div>
      <div class="component-content">
        ${component.description}
      </div>
      <div class="component-controls">
        <button class="gaia-button" style="background-color: ${component.borderColor}; padding: 5px 10px; font-size: 14px;">
          Activate
        </button>
      </div>
    `;
    
    // Add activation logic
    const activateButton = card.querySelector('button');
    const statusElement = card.querySelector('.component-status');
    
    activateButton.addEventListener('click', function() {
      statusElement.textContent = 'Running';
      statusElement.style.color = 'green';
      console.log(`Component ${component.id} activated`);
      
      // Change back after 3 seconds
      setTimeout(() => {
        statusElement.textContent = 'Idle';
        statusElement.style.color = '#666';
      }, 3000);
    });
    
    componentList.appendChild(card);
  });
  
  // Network Visualization
  const canvas = document.getElementById('gaia-network-canvas');
  const ctx = canvas.getContext('2d');
  
  // Set actual canvas dimensions
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  
  // Draw the network
  function drawNetwork() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Node positions
    const nodes = [
      { id: 'υ', x: canvas.width * 0.2, y: canvas.height * 0.3 },
      { id: 'η', x: canvas.width * 0.4, y: canvas.height * 0.2 },
      { id: 'Γ', x: canvas.width * 0.6, y: canvas.height * 0.3 },
      { id: 'μ', x: canvas.width * 0.7, y: canvas.height * 0.5 },
      { id: '∂', x: canvas.width * 0.3, y: canvas.height * 0.6 },
      { id: 'ℝ', x: canvas.width * 0.8, y: canvas.height * 0.7 }
    ];
    
    // Find a node by id
    function findNode(id) {
      return nodes.find(node => node.id === id);
    }
    
    // Connection data
    const connections = [
      { from: 'υ', to: 'η' },
      { from: 'η', to: 'Γ' },
      { from: 'Γ', to: 'μ' },
      { from: 'μ', to: 'ℝ' },
      { from: 'υ', to: '∂' },
      { from: '∂', to: 'ℝ' }
    ];
    
    // Draw connections
    connections.forEach(conn => {
      const fromNode = findNode(conn.from);
      const toNode = findNode(conn.to);
      
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw arrow
        const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
        const arrowSize = 10;
        
        ctx.beginPath();
        ctx.moveTo(toNode.x, toNode.y);
        ctx.lineTo(
          toNode.x - arrowSize * Math.cos(angle - Math.PI/6),
          toNode.y - arrowSize * Math.sin(angle - Math.PI/6)
        );
        ctx.lineTo(
          toNode.x - arrowSize * Math.cos(angle + Math.PI/6),
          toNode.y - arrowSize * Math.sin(angle + Math.PI/6)
        );
        ctx.closePath();
        ctx.fillStyle = '#999';
        ctx.fill();
      }
    });
    
    // Draw nodes
    nodes.forEach(node => {
      // Find the component data
      const component = components.find(c => c.id === node.id);
      
      // Draw node
      ctx.beginPath();
      ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
      ctx.fillStyle = component ? component.color : '#eee';
      ctx.fill();
      ctx.strokeStyle = component ? component.borderColor : '#999';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw label
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id, node.x, node.y);
    });
  }
  
  // Draw network initially
  drawNetwork();
  
  // Add event handlers for the main controls
  document.getElementById('gaia-run-button').addEventListener('click', function() {
    console.log('Running GaiaScript network');
    
    // Simulate component activation
    let delay = 0;
    components.forEach(component => {
      setTimeout(() => {
        const componentCard = Array.from(document.querySelectorAll('.component-card'))
          .find(card => card.querySelector('.component-title').textContent.startsWith(component.id));
        
        if (componentCard) {
          const statusElement = componentCard.querySelector('.component-status');
          statusElement.textContent = 'Running';
          statusElement.style.color = 'green';
        }
        
        console.log(`Component ${component.id} activated`);
      }, delay);
      
      delay += 500; // Stagger the activations
    });
    
    // Animate the network
    animateNetwork();
  });
  
  document.getElementById('gaia-reset-button').addEventListener('click', function() {
    console.log('Resetting GaiaScript network');
    
    // Reset all component statuses
    document.querySelectorAll('.component-status').forEach(status => {
      status.textContent = 'Idle';
      status.style.color = '#666';
    });
    
    // Redraw network
    drawNetwork();
  });
  
  document.getElementById('gaia-settings-button').addEventListener('click', function() {
    console.log('Opening GaiaScript settings');
    
    // Create settings panel
    const existingPanel = document.getElementById('gaia-settings-panel');
    
    if (existingPanel) {
      existingPanel.remove();
      return;
    }
    
    const panel = document.createElement('div');
    panel.id = 'gaia-settings-panel';
    panel.className = 'gaia-panel';
    panel.innerHTML = `
      <h3>GaiaScript Settings</h3>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Animation Speed</label>
        <input type="range" id="animation-speed" min="1" max="10" value="5" style="width: 100%;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Node Size</label>
        <input type="range" id="node-size" min="15" max="40" value="25" style="width: 100%;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Display Mode</label>
        <select id="display-mode" style="width: 100%; padding: 5px;">
          <option value="default">Default</option>
          <option value="minimal">Minimal</option>
          <option value="detailed">Detailed</option>
        </select>
      </div>
      
      <button id="apply-settings" class="gaia-button" style="background-color: #4285f4;">Apply</button>
    `;
    
    document.getElementById('gaia-demo-ui').appendChild(panel);
    
    // Handle settings application
    document.getElementById('apply-settings').addEventListener('click', function() {
      console.log('Applying settings');
      panel.remove();
    });
  });
  
  // Animation functions
  function animateNetwork() {
    let frame = 0;
    const duration = 60; // Number of frames for animation
    
    function animate() {
      if (frame >= duration) {
        return;
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Node positions
      const nodes = [
        { id: 'υ', x: canvas.width * 0.2, y: canvas.height * 0.3 },
        { id: 'η', x: canvas.width * 0.4, y: canvas.height * 0.2 },
        { id: 'Γ', x: canvas.width * 0.6, y: canvas.height * 0.3 },
        { id: 'μ', x: canvas.width * 0.7, y: canvas.height * 0.5 },
        { id: '∂', x: canvas.width * 0.3, y: canvas.height * 0.6 },
        { id: 'ℝ', x: canvas.width * 0.8, y: canvas.height * 0.7 }
      ];
      
      // Find a node by id
      function findNode(id) {
        return nodes.find(node => node.id === id);
      }
      
      // Connection data
      const connections = [
        { from: 'υ', to: 'η' },
        { from: 'η', to: 'Γ' },
        { from: 'Γ', to: 'μ' },
        { from: 'μ', to: 'ℝ' },
        { from: 'υ', to: '∂' },
        { from: '∂', to: 'ℝ' }
      ];
      
      // Draw connections
      connections.forEach((conn, index) => {
        const fromNode = findNode(conn.from);
        const toNode = findNode(conn.to);
        
        if (fromNode && toNode) {
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          
          // Determine if this connection should be highlighted
          const shouldHighlight = index === Math.floor(frame / 10) % connections.length;
          
          if (shouldHighlight) {
            ctx.strokeStyle = '#2196f3';
            ctx.lineWidth = 3;
          } else {
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 2;
          }
          
          ctx.stroke();
          
          // Draw data flow animation along connection if highlighted
          if (shouldHighlight) {
            const t = (frame % 10) / 10;
            const x = fromNode.x + (toNode.x - fromNode.x) * t;
            const y = fromNode.y + (toNode.y - fromNode.y) * t;
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#2196f3';
            ctx.fill();
          }
          
          // Draw arrow
          const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
          const arrowSize = 10;
          
          ctx.beginPath();
          ctx.moveTo(toNode.x, toNode.y);
          ctx.lineTo(
            toNode.x - arrowSize * Math.cos(angle - Math.PI/6),
            toNode.y - arrowSize * Math.sin(angle - Math.PI/6)
          );
          ctx.lineTo(
            toNode.x - arrowSize * Math.cos(angle + Math.PI/6),
            toNode.y - arrowSize * Math.sin(angle + Math.PI/6)
          );
          ctx.closePath();
          ctx.fillStyle = shouldHighlight ? '#2196f3' : '#999';
          ctx.fill();
        }
      });
      
      // Draw nodes
      nodes.forEach(node => {
        // Find the component data
        const component = components.find(c => c.id === node.id);
        
        // Determine if this node should be highlighted
        const activeIndex = Math.floor(frame / 10);
        const conn = connections[activeIndex % connections.length];
        const isActive = node.id === conn.from || node.id === conn.to;
        
        // Draw node with potential animation
        const radius = isActive ? 28 : 25;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = component ? component.color : '#eee';
        ctx.fill();
        ctx.strokeStyle = isActive ? '#2196f3' : (component ? component.borderColor : '#999');
        ctx.lineWidth = isActive ? 4 : 3;
        ctx.stroke();
        
        // Draw label
        ctx.font = isActive ? 'bold 16px sans-serif' : '16px sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.id, node.x, node.y);
      });
      
      frame++;
      requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
  }
}