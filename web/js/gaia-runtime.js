// GaiaScript Unified Runtime
// Combines UI, 3D, and Neural Network components

// Core runtime functions
const components = {};
let lastCreatedComponent = null;

function lastCreated() {
  return lastCreatedComponent;
}

function createLayer(type, params, activation) {
  const layer = { type, params, activation, id: `layer_${Object.keys(components).length}` };
  components[layer.id] = layer;
  lastCreatedComponent = layer;
  return layer;
}

function createInput(type, shape) {
  const input = { type, shape, id: `input_${Object.keys(components).length}` };
  components[input.id] = input;
  lastCreatedComponent = input;
  return input;
}

function connectLayers(from, to) {
  if (!from || !to) return;
  from.next = to;
  to.prev = from;
}

function createLoss(target, lossFunction) {
  const loss = { target, function: lossFunction, id: `loss_${Object.keys(components).length}` };
  components[loss.id] = loss;
  lastCreatedComponent = loss;
  return loss;
}

// UI Components
function createCanvas(width, height, props) {
  const canvas = document.createElement('canvas');
  canvas.width = width || 800;
  canvas.height = height || 600;
  
  // Apply properties
  Object.entries(props || {}).forEach(([key, value]) => {
    canvas[key] = value;
  });
  
  document.body.appendChild(canvas);
  
  const component = { 
    type: 'canvas', 
    element: canvas, 
    id: `ui_${Object.keys(components).length}` 
  };
  
  components[component.id] = component;
  lastCreatedComponent = component;
  return component;
}

function createPanel(width, height, props) {
  const panel = document.createElement('div');
  panel.style.width = `${width || 'auto'}px`;
  panel.style.height = `${height || 'auto'}px`;
  panel.className = 'gaia-panel';
  
  // Apply properties
  Object.entries(props || {}).forEach(([key, value]) => {
    if (key.startsWith('style.')) {
      const styleProp = key.substring(6);
      panel.style[styleProp] = value;
    } else {
      panel[key] = value;
    }
  });
  
  document.body.appendChild(panel);
  
  const component = { 
    type: 'panel', 
    element: panel, 
    id: `ui_${Object.keys(components).length}` 
  };
  
  components[component.id] = component;
  lastCreatedComponent = component;
  return component;
}

function createLayout(width, height, props) {
  const layout = document.createElement('div');
  layout.style.width = `${width || '100%'}`;
  layout.style.height = `${height || '100%'}`;
  layout.className = 'gaia-layout';
  
  if (props.grid) {
    layout.style.display = 'grid';
    const [rows, cols] = props.grid.split('×');
    layout.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    layout.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  }
  
  document.body.appendChild(layout);
  
  const component = { 
    type: 'layout', 
    element: layout, 
    id: `ui_${Object.keys(components).length}` 
  };
  
  components[component.id] = component;
  lastCreatedComponent = component;
  return component;
}

function createButton(width, height, props) {
  const button = document.createElement('button');
  button.style.width = `${width || 'auto'}px`;
  button.style.height = `${height || 'auto'}px`;
  button.className = 'gaia-button';
  button.textContent = props.text || 'Button';
  
  // Apply properties
  Object.entries(props || {}).forEach(([key, value]) => {
    if (key !== 'text') {
      button[key] = value;
    }
  });
  
  document.body.appendChild(button);
  
  const component = { 
    type: 'button', 
    element: button, 
    id: `ui_${Object.keys(components).length}` 
  };
  
  components[component.id] = component;
  lastCreatedComponent = component;
  return component;
}

function createLabel(width, height, props) {
  const label = document.createElement('div');
  label.style.width = `${width || 'auto'}px`;
  label.style.height = `${height || 'auto'}px`;
  label.className = 'gaia-label';
  label.textContent = props.text || '';
  
  // Apply properties
  Object.entries(props || {}).forEach(([key, value]) => {
    if (key !== 'text') {
      label[key] = value;
    }
  });
  
  document.body.appendChild(label);
  
  const component = { 
    type: 'label', 
    element: label, 
    id: `ui_${Object.keys(components).length}` 
  };
  
  components[component.id] = component;
  lastCreatedComponent = component;
  return component;
}

// Event system
function bindEvent(source, eventType, handler) {
  const sourceComponent = components[source];
  if (!sourceComponent || !sourceComponent.element) return;
  
  sourceComponent.element.addEventListener(eventType, handler);
}

// Data binding
function bindOneWay(target, source) {
  const targetComponent = components[target];
  const sourceComponent = components[source];
  
  if (!targetComponent || !sourceComponent) return;
  
  // Extract path parts (if any)
  const [sourceId, ...sourcePath] = source.split('.');
  
  // Create a binding
  const binding = {
    update: function() {
      let value = sourceComponent;
      for (const path of sourcePath) {
        value = value[path];
      }
      
      if (targetComponent.element) {
        targetComponent.element.textContent = value;
      }
    }
  };
  
  // Add to binding registry
  sourceComponent.bindings = sourceComponent.bindings || [];
  sourceComponent.bindings.push(binding);
  
  // Initial update
  binding.update();
  
  return binding;
}

function bindBidirectional(target, source) {
  const oneWayBinding = bindOneWay(target, source);
  const reverseBinding = bindOneWay(source, target);
  
  return {
    oneway: oneWayBinding,
    reverse: reverseBinding
  };
}

// 3D components with Three.js
let threeContext = null;

function initThreeContext() {
  if (threeContext) return threeContext;
  
  // Import three.js (normally done via import but simplified here)
  if (!window.THREE) {
    console.error('Three.js is required but not loaded');
    return null;
  }
  
  threeContext = {
    scene: new THREE.Scene(),
    renderer: null,
    camera: null,
    meshes: [],
    lights: [],
    materials: [],
    animations: [],
    clock: new THREE.Clock()
  };
  
  return threeContext;
}

function createWorld3D(params) {
  const context = initThreeContext();
  if (!context) return null;
  
  // Extract parameters
  const width = params.width || 800;
  const height = params.height || 600;
  
  // Create renderer if not exists
  if (!context.renderer) {
    context.renderer = new THREE.WebGLRenderer({ antialias: true });
    context.renderer.setSize(width, height);
    document.body.appendChild(context.renderer.domElement);
  }
  
  const component = { 
    type: 'world3d', 
    context: context,
    id: `three_${Object.keys(components).length}` 
  };
  
  components[component.id] = component;
  lastCreatedComponent = component;
  return component;
}

function createCamera(params) {
  const context = initThreeContext();
  if (!context) return null;
  
  // Create camera
  const camera = new THREE.PerspectiveCamera(
    params.fov || 75,
    params.aspect || window.innerWidth / window.innerHeight,
    params.near || 0.1,
    params.far || 1000
  );
  
  // Set position
  if (params.position) {
    const [x, y, z] = params.position.split(',').map(v => parseFloat(v));
    camera.position.set(x, y, z);
  } else {
    camera.position.set(0, 0, 5);
  }
  
  context.camera = camera;
  
  const component = { 
    type: 'camera', 
    object: camera,
    id: `three_${Object.keys(components).length}` 
  };
  
  components[component.id] = component;
  lastCreatedComponent = component;
  return component;
}

function createRenderer(fps) {
  const context = initThreeContext();
  if (!context || !context.renderer || !context.camera) return null;
  
  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate);
    
    // Run neural network update if needed
    updateAI();
    
    // Render the scene
    context.renderer.render(context.scene, context.camera);
  };
  
  // Start animation
  animate();
  
  const component = { 
    type: 'renderer', 
    fps: fps || 60,
    id: `three_${Object.keys(components).length}` 
  };
  
  components[component.id] = component;
  lastCreatedComponent = component;
  return component;
}

function createLight(params) {
  const context = initThreeContext();
  if (!context) return null;
  
  // Create light
  const lightType = params.type || 'point';
  let light;
  
  switch (lightType) {
    case 'ambient':
      light = new THREE.AmbientLight(
        params.color || 0xffffff,
        params.intensity || 0.5
      );
      break;
    case 'directional':
      light = new THREE.DirectionalLight(
        params.color || 0xffffff,
        params.intensity || 1
      );
      break;
    case 'point':
    default:
      light = new THREE.PointLight(
        params.color || 0xffffff,
        params.intensity || 1,
        params.distance || 0,
        params.decay || 1
      );
      break;
  }
  
  // Set position if applicable
  if (params.position && light.position) {
    const [x, y, z] = params.position.split(',').map(v => parseFloat(v));
    light.position.set(x, y, z);
  }
  
  // Add to scene
  context.scene.add(light);
  context.lights.push(light);
  
  const component = { 
    type: 'light', 
    object: light,
    id: `three_${Object.keys(components).length}` 
  };
  
  components[component.id] = component;
  lastCreatedComponent = component;
  return component;
}

function createMesh(params) {
  const context = initThreeContext();
  if (!context) return null;
  
  // Create geometry
  let geometry;
  const geoType = params.geometry || 'box';
  
  switch (geoType) {
    case 'sphere':
      geometry = new THREE.SphereGeometry(
        params.radius || 1,
        params.widthSegments || 32,
        params.heightSegments || 16
      );
      break;
    case 'box':
    default:
      geometry = new THREE.BoxGeometry(
        params.width || 1,
        params.height || 1,
        params.depth || 1
      );
      break;
  }
  
  // Create material
  const material = new THREE.MeshStandardMaterial({
    color: params.color || 0x00ff00,
    wireframe: params.wireframe || false
  });
  
  // Create mesh
  const mesh = new THREE.Mesh(geometry, material);
  
  // Set position
  if (params.position) {
    const [x, y, z] = params.position.split(',').map(v => parseFloat(v));
    mesh.position.set(x, y, z);
  }
  
  // Add to scene
  context.scene.add(mesh);
  context.meshes.push(mesh);
  
  const component = { 
    type: 'mesh', 
    object: mesh,
    id: `three_${Object.keys(components).length}` 
  };
  
  components[component.id] = component;
  lastCreatedComponent = component;
  return component;
}

// Asset loading
function loadAsset(path, assetType) {
  const context = initThreeContext();
  if (!context) return null;
  
  // Create asset loader based on type
  switch (assetType) {
    case 'model':
      // Load 3D model
      const loader = new THREE.GLTFLoader();
      loader.load(path, (gltf) => {
        context.scene.add(gltf.scene);
      });
      break;
    case 'texture':
      // Load texture
      const textureLoader = new THREE.TextureLoader();
      return textureLoader.load(path);
    case 'audio':
      // Load audio
      const audio = new Audio(path);
      return audio;
    default:
      console.error(`Unknown asset type: ${assetType}`);
      return null;
  }
  
  const component = { 
    type: 'asset',
    path: path,
    assetType: assetType,
    id: `asset_${Object.keys(components).length}` 
  };
  
  components[component.id] = component;
  lastCreatedComponent = component;
  return component;
}

// AI integration
function updateAI() {
  // Find AI components and update them
  Object.values(components).forEach(component => {
    if (component.type === 'layer' || component.type === 'input') {
      // Process neural network forward pass
      // This would connect to the existing GaiaScript neural network runtime
    }
  });
}

// Export the unified runtime
window.GaiaUnified = {
  createLayer,
  createInput,
  connectLayers,
  createLoss,
  createCanvas,
  createPanel,
  createLayout,
  createButton,
  createLabel,
  bindEvent,
  bindOneWay,
  bindBidirectional,
  createWorld3D,
  createCamera,
  createRenderer,
  createLight,
  createMesh,
  loadAsset,
  lastCreated,
  getComponent: (id) => components[id]
};