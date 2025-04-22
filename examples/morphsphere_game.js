
// Generated JavaScript from GaiaScript


// Network initialization

// From:
const from_26 = (() => {
  const input_0 = createInput('image', [3, 64, 64]);
  return lastCreated();
})();

// To:
const to_27 = (() => {
  
// From:
const from_24 = (() => {
  const layer_1 = createLayer('conv', { filters: 2, kernelSize: 3, index: 3 }, 'none');
  return lastCreated();
})();

// To:
const to_25 = (() => {
  
// From:
const from_22 = (() => {
  const layer_2 = createLayer('pooling', { size: 2 }, 'none');
  return lastCreated();
})();

// To:
const to_23 = (() => {
  
// From:
const from_20 = (() => {
  const layer_3 = createLayer('conv', { filters: 4, kernelSize: 3, index: 6 }, 'none');
  return lastCreated();
})();

// To:
const to_21 = (() => {
  
// From:
const from_18 = (() => {
  const layer_4 = createLayer('pooling', { size: 2 }, 'none');
  return lastCreated();
})();

// To:
const to_19 = (() => {
  
// From:
const from_16 = (() => {
  const layer_5 = createLayer('flatten', {}, 'none');
  return lastCreated();
})();

// To:
const to_17 = (() => {
  
// From:
const from_14 = (() => {
  const layer_6 = createLayer('dense', { units: 28, index: 1 }, 'none');
  return lastCreated();
})();

// To:
const to_15 = (() => {
  
// From:
const from_12 = (() => {
  const layer_7 = createLayer('dense', { units: 4, index: 6 }, 'none');
  return lastCreated();
})();

// To:
const to_13 = (() => {
  
// From:
const from_10 = (() => {
  const layer_8 = createLayer('dense', { units: 2, index: 3 }, 'none');
  return lastCreated();
})();

// To:
const to_11 = (() => {
  const layer_9 = createLayer('dense', { units: 128, index: 8 }, 'none');
  return lastCreated();
})();

// Connect from to to
connectLayers(from_10, to_11);
        
  return lastCreated();
})();

// Connect from to to
connectLayers(from_12, to_13);
        
  return lastCreated();
})();

// Connect from to to
connectLayers(from_14, to_15);
        
  return lastCreated();
})();

// Connect from to to
connectLayers(from_16, to_17);
        
  return lastCreated();
})();

// Connect from to to
connectLayers(from_18, to_19);
        
  return lastCreated();
})();

// Connect from to to
connectLayers(from_20, to_21);
        
  return lastCreated();
})();

// Connect from to to
connectLayers(from_22, to_23);
        
  return lastCreated();
})();

// Connect from to to
connectLayers(from_24, to_25);
        
  return lastCreated();
})();

// Connect from to to
connectLayers(from_26, to_27);
        


// Export the network
export default function initNetwork() {
  // Return the network object
  return { initialize };
}
        