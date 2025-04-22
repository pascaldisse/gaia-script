/**
 * Main game class
 */
class MorphSphereGame {
    constructor() {
        this.container = document.getElementById('game-container');
        this.canvas = document.getElementById('game-canvas');
        this.stats = {
            morphCount: document.getElementById('morph-count'),
            energy: document.getElementById('energy-level'),
            perception: document.getElementById('perception-level')
        };
        this.console = document.getElementById('console');
        this.gaiaCode = document.getElementById('gaia-code');
        
        // Game state
        this.morphs = [];
        this.playerPosition = new THREE.Vector3(0, 0, 15);
        this.energy = 100;
        this.perception = 1;
        this.capturedEssence = 0;
        this.selectedMorph = null;
        
        // Initialize Three.js components
        this.initScene();
        this.initWorld();
        this.initMorphs(10);
        
        // Set up controls
        this.setupControls();
        
        // Start game loop
        this.lastTime = 0;
        this.animate();
        
        // Add initial console messages
        this.addConsoleEntry("Welcome to MorphSphere, a surreal 3D AI experience.");
        this.addConsoleEntry("Move with WASD, look around with the mouse.");
        this.addConsoleEntry("Approach Morphs to interact with them.");
    }
    
    initScene() {
        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050520);
        this.scene.fog = new THREE.FogExp2(0x050520, 0.02);
        
        // Set up camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.container.clientWidth / this.container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.copy(this.playerPosition);
        
        // Set up renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        
        // Set up orbit controls for demo
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 30;
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    initWorld() {
        // Create the environment
        this.world = new World(this.scene);
    }
    
    initMorphs(count) {
        // Create initial morphs
        for (let i = 0; i < count; i++) {
            const morph = new Morph();
            this.morphs.push(morph);
            this.scene.add(morph.mesh);
        }
        
        // Update stats display
        this.updateStats();
    }
    
    setupControls() {
        // Button event listeners
        document.getElementById('capture-btn').addEventListener('click', () => this.captureMorph());
        document.getElementById('merge-btn').addEventListener('click', () => this.mergeMorphs());
        document.getElementById('create-btn').addEventListener('click', () => this.createSound());
        document.getElementById('run-btn').addEventListener('click', () => this.runGaiaScript());
        
        // Set up raycasting for selection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.canvas.addEventListener('click', (event) => this.onCanvasClick(event));
    }
    
    onCanvasClick(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.canvas.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.canvas.height) * 2 + 1;
        
        // Update the raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Find intersected morphs
        const morphMeshes = this.morphs.map(morph => morph.mesh);
        const intersects = this.raycaster.intersectObjects(morphMeshes);
        
        if (intersects.length > 0) {
            const selectedMorph = intersects[0].object.userData.morph;
            this.selectMorph(selectedMorph);
        } else {
            this.deselectMorph();
        }
    }
    
    selectMorph(morph) {
        // Deselect previously selected morph
        this.deselectMorph();
        
        // Select new morph
        this.selectedMorph = morph;
        
        // Visual indicator for selection
        const originalMaterial = morph.material;
        morph.material = originalMaterial.clone();
        morph.material.emissive = new THREE.Color(1, 1, 1);
        morph.material.emissiveIntensity = 0.5;
        
        // Store original material for deselection
        morph.originalMaterial = originalMaterial;
        
        this.addConsoleEntry(`Morph selected. Essence: ${Math.floor(morph.essence * 100)}%, Complexity: ${morph.complexity}`);
    }
    
    deselectMorph() {
        if (this.selectedMorph) {
            // Restore original material
            if (this.selectedMorph.originalMaterial) {
                this.selectedMorph.material.dispose();
                this.selectedMorph.material = this.selectedMorph.originalMaterial;
                this.selectedMorph.originalMaterial = null;
            }
            
            this.selectedMorph = null;
        }
    }
    
    captureMorph() {
        if (!this.selectedMorph) {
            this.addConsoleEntry("No morph selected. Click on a morph to select it first.");
            return;
        }
        
        // Capture the morph's essence
        this.capturedEssence += this.selectedMorph.essence;
        this.energy += Math.floor(this.selectedMorph.essence * 20);
        
        // Remove the morph
        this.removeMorph(this.selectedMorph);
        this.selectedMorph = null;
        
        // Potentially increase perception
        if (this.capturedEssence >= 1) {
            this.capturedEssence -= 1;
            this.perception++;
            this.addConsoleEntry(`Perception increased to level ${this.perception}!`);
        }
        
        this.addConsoleEntry("Morph essence captured. Energy increased.");
        this.updateStats();
    }
    
    mergeMorphs() {
        if (!this.selectedMorph) {
            this.addConsoleEntry("No morph selected. Click on a morph to select it first.");
            return;
        }
        
        // Find the nearest morph to merge with
        let nearestMorph = null;
        let minDistance = Infinity;
        
        for (const morph of this.morphs) {
            if (morph === this.selectedMorph) continue;
            
            const distance = morph.position.distanceTo(this.selectedMorph.position);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestMorph = morph;
            }
        }
        
        if (!nearestMorph || minDistance > 5) {
            this.addConsoleEntry("No suitable morph nearby to merge with.");
            return;
        }
        
        // Create a new merged morph
        const mergedMorph = this.selectedMorph.merge(nearestMorph);
        
        // Remove the original morphs
        this.removeMorph(this.selectedMorph);
        this.removeMorph(nearestMorph);
        
        // Add the new merged morph
        this.morphs.push(mergedMorph);
        this.scene.add(mergedMorph.mesh);
        
        this.selectedMorph = null;
        this.addConsoleEntry("Morphs successfully merged into a more complex form.");
        this.updateStats();
    }
    
    createSound() {
        if (this.energy < 10) {
            this.addConsoleEntry("Not enough energy to create a sound node.");
            return;
        }
        
        // Use energy to create a sound node
        this.energy -= 10;
        
        // Create sound node at random position or at camera position
        const position = new THREE.Vector3(
            this.camera.position.x + (Math.random() - 0.5) * 5,
            this.camera.position.y + (Math.random() - 0.5) * 5,
            this.camera.position.z + (Math.random() - 0.5) * 5
        );
        
        const soundNode = this.world.createSoundNode(position);
        
        // Create new morphs near the sound node
        for (let i = 0; i < 2; i++) {
            const morphPosition = new THREE.Vector3(
                position.x + (Math.random() - 0.5) * 3,
                position.y + (Math.random() - 0.5) * 3,
                position.z + (Math.random() - 0.5) * 3
            );
            
            const morph = new Morph(morphPosition);
            this.morphs.push(morph);
            this.scene.add(morph.mesh);
        }
        
        this.addConsoleEntry("Sound node created. New morphs are drawn to its resonance.");
        this.updateStats();
    }
    
    runGaiaScript() {
        const code = this.gaiaCode.value;
        this.addConsoleEntry("Executing GaiaScript...");
        
        // Simulate GaiaScript execution
        setTimeout(() => {
            // Create some new morphs based on "AI" processing
            const newMorphCount = Math.floor(Math.random() * 5) + 3;
            
            for (let i = 0; i < newMorphCount; i++) {
                const morph = new Morph(
                    new THREE.Vector3(
                        (Math.random() - 0.5) * 20,
                        (Math.random() - 0.5) * 20,
                        (Math.random() - 0.5) * 20
                    ),
                    Math.random() * 2 + 0.5,
                    Math.floor(Math.random() * 3) + 1
                );
                this.morphs.push(morph);
                this.scene.add(morph.mesh);
            }
            
            // Also change the terrain slightly
            this.world.noiseScale = 0.05 + Math.random() * 0.1;
            this.world.morphingSpeed = 0.0002 + Math.random() * 0.001;
            
            this.addConsoleEntry(`GaiaScript execution complete. Generated ${newMorphCount} new morphs.`);
            this.updateStats();
        }, 1500);
    }
    
    removeMorph(morph) {
        const index = this.morphs.indexOf(morph);
        if (index !== -1) {
            this.morphs.splice(index, 1);
            this.scene.remove(morph.mesh);
            morph.dispose();
        }
    }
    
    updateStats() {
        this.stats.morphCount.textContent = this.morphs.length;
        this.stats.energy.textContent = Math.floor(this.energy);
        this.stats.perception.textContent = this.perception;
    }
    
    addConsoleEntry(message) {
        const entry = document.createElement('div');
        entry.className = 'console-entry';
        entry.textContent = message;
        this.console.appendChild(entry);
        
        // Auto-scroll to the bottom
        this.console.scrollTop = this.console.scrollHeight;
        
        // Limit number of entries
        while (this.console.children.length > 10) {
            this.console.removeChild(this.console.firstChild);
        }
    }
    
    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    
    update(time) {
        // Update morphs
        for (let i = this.morphs.length - 1; i >= 0; i--) {
            const morph = this.morphs[i];
            const alive = morph.update(time);
            
            if (!alive) {
                this.scene.remove(morph.mesh);
                morph.dispose();
                this.morphs.splice(i, 1);
            }
        }
        
        // Update world
        this.world.update(time);
        
        // Update controls
        this.controls.update();
        
        // Slowly decrease energy
        this.energy = Math.max(0, this.energy - 0.01);
        
        // Randomly spawn new morphs
        if (Math.random() < 0.005 && this.morphs.length < 20) {
            const morph = new Morph();
            this.morphs.push(morph);
            this.scene.add(morph.mesh);
            this.updateStats();
        }
        
        // Update stats occasionally
        if (time - this.lastStatsUpdate > 1000) {
            this.updateStats();
            this.lastStatsUpdate = time;
        }
    }
    
    animate(time) {
        requestAnimationFrame((t) => this.animate(t));
        
        // Update game state
        this.update(time);
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    cleanup() {
        // Dispose of all resources
        this.morphs.forEach(morph => morph.dispose());
        this.world.dispose();
        
        this.renderer.dispose();
    }
}

// Start the game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new MorphSphereGame();
    
    // Store game instance for debugging
    window.game = game;
});