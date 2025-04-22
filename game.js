// Generated from GaiaScript

class GaiaModel {
    constructor() {
        this.layers = [];
        this.components = {};
    }

    addLayer(type, config) {
        this.layers.push({ type, config });
        return this;
    }

    addComponent(name, model) {
        this.components[name] = model;
        return this;
    }

    execute(input) {
        console.log('Executing model with input:', input);
        return { output: 'GaiaScript model output' };
    }
}

function visualizeModel(model, container) {
    // Create THREE.js visualization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Create network visualization
    let y = 0;
    const nodes = [];

    model.layers.forEach((layer, i) => {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const node = new THREE.Mesh(geometry, material);
        node.position.set(0, y, 0);
        scene.add(node);
        nodes.push(node);
        y -= 2;
    });

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        nodes.forEach(node => { node.rotation.x += 0.01; node.rotation.y += 0.01; });
        renderer.render(scene, camera);
    }

    animate();
}

const model = new GaiaModel();

// Network components
model.addLayer('input', { units: 32 });
model.addLayer('dense', { units: 64, activation: 'relu' });
model.addLayer('output', { units: 10, activation: 'softmax' });

// Expose the model
window.gaiaModel = model;

// Auto-visualize when placed in a container
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('gaia-container');
    if (container) {
        visualizeModel(model, container);
    }
});
