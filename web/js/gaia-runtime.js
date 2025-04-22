/**
 * GaiaScript JavaScript Runtime
 * 
 * This file provides the runtime support for GaiaScript programs
 * compiled to JavaScript.
 */

// Global state
let _lastCreatedLayer = null;
const _layers = [];
const _connections = [];
const _inputs = [];
const _outputs = [];

/**
 * Create a new layer with the specified type, parameters, and activation function
 */
function createLayer(type, params, activation) {
  const layer = {
    id: `${type}_${_layers.length}`,
    type,
    params,
    activation,
    inputs: [],
    outputs: []
  };
  
  _layers.push(layer);
  _lastCreatedLayer = layer;
  
  return layer;
}

/**
 * Create an input with the specified type and shape
 */
function createInput(type, shape) {
  const input = {
    id: `input_${_inputs.length}`,
    type,
    shape,
    outputs: []
  };
  
  _inputs.push(input);
  _lastCreatedLayer = input;
  
  return input;
}

/**
 * Create a loss function between the specified layers
 */
function createLoss(target, lossFunction) {
  const loss = {
    target,
    function: lossFunction
  };
  
  return loss;
}

/**
 * Connect two layers together
 */
function connectLayers(fromLayer, toLayer) {
  const connection = {
    from: fromLayer,
    to: toLayer
  };
  
  fromLayer.outputs.push(toLayer);
  toLayer.inputs.push(fromLayer);
  _connections.push(connection);
  
  return connection;
}

/**
 * Get the last created layer
 */
function lastCreated() {
  return _lastCreatedLayer;
}

/**
 * Initialize a layer with specified parameters
 */
function initializeLayer(layer, params) {
  // In a real ML system, this would create the actual layer with weights
  console.log(`Initializing ${layer.type} layer with params:`, params);
  return layer;
}

/**
 * Run a forward pass through the network
 */
function forward(input, network) {
  // In a real ML system, this would run the forward computation
  console.log(`Running forward pass with input of shape: ${input.shape}`);
  
  // Return a dummy tensor result
  return {
    shape: [1, 10],
    data: new Array(10).fill(0).map(() => Math.random())
  };
}

/**
 * Get a summary of the network architecture
 */
function getNetworkSummary() {
  return {
    layers: _layers.length,
    connections: _connections.length,
    inputs: _inputs.length,
    outputs: _outputs.length
  };
}

/**
 * Visualize the network architecture
 */
function visualizeNetwork(container) {
  const div = document.getElementById(container);
  if (!div) return;
  
  // Clear container
  div.innerHTML = '';
  
  // Create a visualization of the network
  const header = document.createElement('h3');
  header.textContent = 'GaiaScript Network Visualization';
  div.appendChild(header);
  
  // Create layers representation
  const layersDiv = document.createElement('div');
  layersDiv.className = 'network-layers';
  
  _layers.forEach(layer => {
    const layerDiv = document.createElement('div');
    layerDiv.className = `network-layer ${layer.type}`;
    
    const label = document.createElement('div');
    label.className = 'layer-label';
    label.textContent = `${layer.type}`;
    
    const details = document.createElement('div');
    details.className = 'layer-details';
    details.textContent = JSON.stringify(layer.params);
    
    layerDiv.appendChild(label);
    layerDiv.appendChild(details);
    layersDiv.appendChild(layerDiv);
  });
  
  div.appendChild(layersDiv);
  
  // Create connections visualization
  const connectionsDiv = document.createElement('div');
  connectionsDiv.className = 'network-connections';
  div.appendChild(connectionsDiv);
}

// Make functions available globally for scripts
window.createLayer = createLayer;
window.createInput = createInput;
window.createLoss = createLoss;
window.connectLayers = connectLayers;
window.lastCreated = lastCreated;
window.initializeLayer = initializeLayer;
window.forward = forward;
window.getNetworkSummary = getNetworkSummary;
window.visualizeNetwork = visualizeNetwork;