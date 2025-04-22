
// Generated JavaScript from GaiaScript


// Network initialization

// From:
const from_17 = (() => {
  const input_0 = createInput('image', [3, 128, 128]);
  return lastCreated();
})();

// To:
const to_18 = (() => {
  
// From:
const from_15 = (() => {
  const layer_1 = createLayer('conv', { filters: 2, kernelSize: 3, index: 3 }, 'none');
  return lastCreated();
})();

// To:
const to_16 = (() => {
  
// From:
const from_13 = (() => {
  const layer_2 = createLayer('pooling', { size: 2 }, 'none');
  return lastCreated();
})();

// To:
const to_14 = (() => {
  
// From:
const from_11 = (() => {
  const layer_3 = createLayer('conv', { filters: 4, kernelSize: 3, index: 6 }, 'none');
  return lastCreated();
})();

// To:
const to_12 = (() => {
  
// From:
const from_9 = (() => {
  const layer_4 = createLayer('pooling', { size: 2 }, 'none');
  return lastCreated();
})();

// To:
const to_10 = (() => {
  
// From:
const from_7 = (() => {
  const layer_5 = createLayer('flatten', {}, 'none');
  return lastCreated();
})();

// To:
const to_8 = (() => {
  const layer_6 = createLayer('dense', { units: 28, index: 1 }, 'none');
  return lastCreated();
})();

// Connect from to to
connectLayers(from_7, to_8);
        
  return lastCreated();
})();

// Connect from to to
connectLayers(from_9, to_10);
        
  return lastCreated();
})();

// Connect from to to
connectLayers(from_11, to_12);
        
  return lastCreated();
})();

// Connect from to to
connectLayers(from_13, to_14);
        
  return lastCreated();
})();

// Connect from to to
connectLayers(from_15, to_16);
        
  return lastCreated();
})();

// Connect from to to
connectLayers(from_17, to_18);
        


// Export the network
export default function initNetwork() {
  // Return the network object
  return { initialize };
}
        