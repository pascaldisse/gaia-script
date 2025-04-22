/**
 * GaiaScript-powered MorphSphere Game
 * This is a rewritten version of the original MorphSphere game using the GaiaScript
 * compiled neural network.
 */

// GaiaMorph class - simplified version
class GaiaMorph {
    constructor(position, attributes = {}) {
        // Generate a random name
        this.name = this.generateName();
        
        // Position in 3D space
        this.position = position || new THREE.Vector3(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 30
        );
        
        // Physical attributes
        this.size = attributes.size || (0.5 + Math.random() * 1.5);
        
        // Neural attributes
        this.color = attributes.color || new THREE.Color(
            0.2 + Math.random() * 0.8,
            0.2 + Math.random() * 0.8,
            0.2 + Math.random() * 0.8
        );
        
        // State attributes
        this.hunger = Math.floor(Math.random() * 70) + 30;
        this.happiness = Math.floor(Math.random() * 70) + 30;
        this.energy = Math.floor(Math.random() * 70) + 30;
        this.health = Math.floor(Math.random() * 70) + 30;
        this.age = 0;
        this.isSick = false;
        this.isSleeping = false;
        this.isSelected = false;
        this.decayRate = 0.01 + Math.random() * 0.02;
        this.evolutionStage = attributes.evolution || 1;
        this.effects = [];
        
        // Personality traits
        this.personalityType = attributes.personality !== undefined ? 
            this.getPersonalityType(attributes.personality) : 
            this.generatePersonality();
        
        // Special abilities
        this.specialAbility = attributes.ability !== undefined ? 
            this.getSpecialAbility(attributes.ability) : 
            this.generateAbility();
        
        // Create visual representation
        this.createMesh();
    }
    
    // Generate a unique name for the morph
    generateName() {
        const syllables = ['zi', 'xa', 'qu', 'nu', 'mo', 'yx', 'pi', 'to', 'ga', 'ei',
                         'va', 'ru', 'si', 'ka', 'op', 'le', 'wi', 'ny', 'ma', 'zo'];
        
        const length = Math.floor(Math.random() * 2) + 2; // 2-3 syllables
        let name = '';
        
        for (let i = 0; i < length; i++) {
            name += syllables[Math.floor(Math.random() * syllables.length)];
        }
        
        // Capitalize first letter
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
    
    // Get personality type based on neural network output
    getPersonalityType(index) {
        const types = [
            'Curious', 'Playful', 'Shy', 'Aggressive', 'Friendly'
        ];
        return types[index % types.length];
    }
    
    // Generate a random personality type
    generatePersonality() {
        const types = [
            'Curious', 'Playful', 'Shy', 'Aggressive', 'Friendly'
        ];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    // Get special ability based on neural network output
    getSpecialAbility(index) {
        const abilities = [
            'Glow', 'Teleport', 'Energize', 'Harmonize', 'Camouflage'
        ];
        return abilities[index % abilities.length];
    }
    
    // Generate a random special ability
    generateAbility() {
        const abilities = [
            'Glow', 'Teleport', 'Energize', 'Harmonize', 'Camouflage'
        ];
        return abilities[Math.floor(Math.random() * abilities.length)];
    }
    
    createMesh() {
        // Create geometry based on evolution stage
        let geometry;
        
        switch(this.evolutionStage) {
            case 1:
                // Stage 1: Simple sphere shape
                geometry = new THREE.SphereGeometry(this.size, 16, 16);
                break;
            case 2:
                // Stage 2: More complex shape
                geometry = new THREE.IcosahedronGeometry(this.size, 1);
                break;
            case 3:
                // Stage 3: Advanced shape
                geometry = new THREE.TorusKnotGeometry(
                    this.size * 0.7, 
                    this.size * 0.3, 
                    64, 
                    8
                );
                break;
            default:
                geometry = new THREE.SphereGeometry(this.size, 16, 16);
        }
        
        // Create material with glowing effects
        const material = new THREE.MeshPhongMaterial({
            color: this.color,
            emissive: this.color.clone().multiplyScalar(0.3),
            specular: new THREE.Color(0xffffff),
            shininess: 30,
            transparent: true,
            opacity: 0.9
        });
        
        // Create mesh
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Store reference to this morph in the mesh
        this.mesh.userData.morph = this;
        
        // Add subtle animation
        this.originalScale = this.size;
        this.pulsePhase = Math.random() * Math.PI * 2;
    }
    
    update(time, deltaTime) {
        return true;
    }
    
    dispose() {
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
            this.mesh = null;
        }
    }
}

// Main game class
class GaiaMorphSphereGame {
    constructor() {
        try {
            console.log("Starting GaiaMorphSphere Game");
            
            // Basic setup
            this.container = document.getElementById('game-container');
            this.canvas = document.getElementById('game-canvas');
            
            // Game state
            this.morphs = [];
            this.playerPosition = new THREE.Vector3(0, 0, 15);
            this.nameIndicators = new Map();
            
            // Initialize GaiaScript neural network for generating morph data
            this.initGaiaNetwork();
            
            // Initialize Three.js scene
            this.initScene();
            
            // Initialize the world environment
            if (typeof World !== 'undefined') {
                this.world = new World(this.scene);
            } else {
                // Create a simple environment if World class is not available
                console.log("World class not available, creating simple environment");
                this.createSimpleEnvironment();
            }
            
            // Create a few morphs
            this.createSomeMorphs(3);
            
            // Set up basic controls
            this.setupControls();
            
            // Start rendering
            this.animate(0);
            
        } catch (error) {
            console.error("Error initializing game:", error);
        }
    }
    
    // Initialize GaiaScript network for morph data generation
    initGaiaNetwork() {
        try {
            // Display neural network if visualization element exists
            if (document.getElementById('network-visualization')) {
                if (typeof visualizeNetwork === 'function') {
                    visualizeNetwork('network-visualization');
                }
            }
            
            // Log network initialization
            if (typeof getNetworkSummary === 'function') {
                console.log('GaiaScript Network Summary:', getNetworkSummary());
            }
        } catch (error) {
            console.error("Error initializing GaiaScript network:", error);
        }
    }
    
    // Generate random morph data
    generateMorphData() {
        try {
            // Use GaiaScript forward function if available
            if (typeof forward === 'function') {
                const input = {
                    shape: [3, 64, 64],
                    data: new Array(3 * 64 * 64).fill(0).map(() => Math.random())
                };
                return forward(input, {});
            } else {
                // Fallback random data
                return {
                    data: new Array(10).fill(0).map(() => Math.random())
                };
            }
        } catch (error) {
            console.error("Error generating morph data:", error);
            return {
                data: new Array(10).fill(0).map(() => Math.random())
            };
        }
    }
    
    // Initialize ThreeJS scene
    initScene() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050520);
        this.scene.fog = new THREE.FogExp2(0x050520, 0.02);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            85, 
            this.container.clientWidth / this.container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.copy(this.playerPosition);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        
        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 30;
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x222233, 0.5);
        this.scene.add(ambientLight);
        
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(5, 10, 5);
        mainLight.castShadow = true;
        this.scene.add(mainLight);
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
    }
    
    // Create a simple environment if World class isn't available
    createSimpleEnvironment() {
        // Ground plane
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({ 
                color: 0x113322,
                roughness: 0.8,
                metalness: 0.2
            })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Add some random objects
        for (let i = 0; i < 20; i++) {
            const size = 0.5 + Math.random() * 2;
            const geometry = new THREE.BoxGeometry(size, size, size);
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(Math.random(), Math.random(), Math.random()),
                roughness: 0.7,
                metalness: 0.2
            });
            
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                (Math.random() - 0.5) * 30,
                size / 2,
                (Math.random() - 0.5) * 30
            );
            cube.castShadow = true;
            cube.receiveShadow = true;
            this.scene.add(cube);
        }
    }
    
    // Create some initial morphs
    createSomeMorphs(count) {
        for (let i = 0; i < count; i++) {
            this.createNewMorph();
        }
    }
    
    // Create a new morph
    createNewMorph(position) {
        try {
            // Get neural data for the morph
            const networkResult = this.generateMorphData();
            
            // Extract attributes from network output
            const attributes = {
                personality: Math.floor(networkResult.data[0] * 5),
                evolution: Math.floor(networkResult.data[1] * 3) + 1,
                ability: Math.floor(networkResult.data[2] * 5),
                size: 0.5 + networkResult.data[3] * 1.5,
                color: new THREE.Color(
                    networkResult.data[4] || Math.random(),
                    networkResult.data[5] || Math.random(),
                    networkResult.data[6] || Math.random()
                )
            };
            
            // Create the morph
            const morph = new GaiaMorph(position, attributes);
            this.morphs.push(morph);
            this.scene.add(morph.mesh);
            
            console.log(`Created morph: ${morph.name}`);
            return morph;
            
        } catch (error) {
            console.error("Error creating morph:", error);
        }
    }
    
    // Set up basic controls
    setupControls() {
        // Raycasting for selection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Handle clicks for selecting morphs
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / this.canvas.clientWidth) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / this.canvas.clientHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            const intersects = this.raycaster.intersectObjects(
                this.morphs.map(m => m.mesh)
            );
            
            if (intersects.length > 0) {
                const morph = intersects[0].object.userData.morph;
                console.log(`Selected morph: ${morph.name}`);
                console.log(`Personality: ${morph.personalityType}`);
                console.log(`Ability: ${morph.specialAbility}`);
            }
        });
    }
    
    // Animation loop
    animate(time) {
        requestAnimationFrame((t) => this.animate(t));
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Update morphs (minimal)
        for (const morph of this.morphs) {
            if (morph.mesh) {
                morph.mesh.rotation.y += 0.01;
            }
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Make the game class available globally
window.GaiaMorphSphereGame = GaiaMorphSphereGame;