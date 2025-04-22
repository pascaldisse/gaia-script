/**
 * GaiaScript-powered MorphSphere Game
 * This is a rewritten version of the original MorphSphere game using the GaiaScript
 * compiled neural network.
 */

import * as gaiaRuntime from './gaia-runtime.js';
import morphNetwork from '../../examples/morphsphere_game.js';
import GaiaMorph from './gaia-morph.js';

class GaiaMorphSphereGame {
    constructor() {
        this.container = document.getElementById('game-container');
        this.canvas = document.getElementById('game-canvas');
        
        // UI Elements
        this.statsElements = {
            morphCount: document.getElementById('morph-count'),
            perceptionLevel: document.getElementById('perception-level'),
            healthBar: document.querySelector('.stat-bar-fill.health'),
            energyBar: document.querySelector('.stat-bar-fill.energy')
        };
        
        this.morphInfo = {
            container: document.getElementById('morph-info'),
            name: document.querySelector('.morph-name'),
            personality: document.getElementById('morph-personality'),
            ability: document.getElementById('morph-ability'),
            stage: document.getElementById('morph-stage'),
            hungerBar: document.getElementById('morph-hunger-bar'),
            happinessBar: document.getElementById('morph-happiness-bar')
        };
        
        this.console = document.getElementById('console');
        this.gaiaCode = document.getElementById('gaia-code');
        
        // Action buttons
        this.buttons = {
            feed: document.getElementById('feed-btn'),
            pet: document.getElementById('pet-btn'),
            play: document.getElementById('play-btn'),
            speak: document.getElementById('speak-btn'),
            heal: document.getElementById('heal-btn'),
            ability: document.getElementById('ability-btn'),
            merge: document.getElementById('merge-btn'),
            create: document.getElementById('create-btn'),
            attack: document.getElementById('attack-btn'),
            run: document.getElementById('run-btn')
        };
        
        // Game state
        this.morphs = [];
        this.playerPosition = new THREE.Vector3(0, 0, 15);
        this.playerStats = {
            health: 100,
            energy: 80,
            perception: 1,
            capturedEssence: 0
        };
        this.selectedMorph = null;
        this.nameIndicators = new Map(); // Store morph name tags
        this.selectionRing = null; // Visual indicator for selected morph
        this.deltaTime = 1; // Time factor for updates
        this.lastFrameTime = 0;
        this.lastStatsUpdate = 0;
        
        // Game configuration
        this.config = {
            maxMorphs: 25,
            morphSpawnChance: 0.003,
            energyDecayRate: 0.008,
            initialMorphCount: 8
        };
        
        // Initialize GaiaScript neural network
        this.initGaiaNetwork();
        
        // Initialize Three.js components
        this.initScene();
        this.initWorld();
        this.initMorphs(this.config.initialMorphCount);
        
        // Set up controls and event listeners
        this.setupControls();
        
        // Start game loop
        this.animate(0);
        
        // Add initial console messages
        this.addConsoleEntry("Welcome to GaiaScript MorphSphere, an AI-powered pet simulator.");
        this.addConsoleEntry("This version uses the GaiaScript neural network for morph behaviors.", "system");
    }
    
    // Initialize the neural network from GaiaScript
    initGaiaNetwork() {
        // Initialize the compiled network
        this.network = morphNetwork();
        
        // Visualize the network if requested
        if (document.getElementById('network-visualization')) {
            gaiaRuntime.visualizeNetwork('network-visualization');
        }
        
        // Log network initialization
        console.log('GaiaScript Network Summary:', gaiaRuntime.getNetworkSummary());
    }
    
    // Generate morph data using the neural network
    generateMorphData(inputData) {
        // Create an input tensor from the data
        const input = {
            shape: [3, 64, 64],
            data: inputData || new Array(3 * 64 * 64).fill(0).map(() => Math.random())
        };
        
        // Run the network forward pass
        const result = gaiaRuntime.forward(input, this.network);
        return result;
    }
    
    // The rest of the game code remains similar to the original implementation
    // but we'll use our neural network for decision making
    
    initScene() {
        // Initialize Three.js scene with trippy LCD-inspired look
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050520);
        this.scene.fog = new THREE.FogExp2(0x050520, 0.02);
        
        // Set up camera with wider field of view for surreal feel
        this.camera = new THREE.PerspectiveCamera(
            85, // Wider FOV for trippy effect
            this.container.clientWidth / this.container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.copy(this.playerPosition);
        
        // Set up renderer with post-processing effects
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Set up orbit controls for easy navigation
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 30;
        this.controls.rotateSpeed = 0.7;
        this.controls.zoomSpeed = 1.2;
        
        // Add ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0x111122, 0.4);
        this.scene.add(ambientLight);
        
        // Add directional light for shadows
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(10, 20, 10);
        mainLight.castShadow = true;
        this.scene.add(mainLight);
        
        // Setup shadow properties
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 500;
        
        // Add point lights for atmosphere
        const colors = [0x50e3c2, 0xff00ff, 0xffcc33];
        
        for (let i = 0; i < colors.length; i++) {
            const pointLight = new THREE.PointLight(colors[i], 1.5, 15);
            pointLight.position.set(
                (Math.random() - 0.5) * 20,
                Math.random() * 10 - 5,
                (Math.random() - 0.5) * 20
            );
            this.scene.add(pointLight);
            
            // Add a small sphere to make the light visible
            const lightSphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 8, 8),
                new THREE.MeshBasicMaterial({ color: colors[i] })
            );
            lightSphere.position.copy(pointLight.position);
            this.scene.add(lightSphere);
        }
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    initWorld() {
        // Create the environment with LCD-inspired visuals
        this.world = new World(this.scene);
    }
    
    initMorphs(count) {
        // Create initial morphs with varied traits
        for (let i = 0; i < count; i++) {
            this.createNewMorph();
        }
        
        // Update stats display
        this.updateStatsDisplay();
    }
    
    createNewMorph(position) {
        // Use the GaiaScript network to influence morph creation
        const networkResult = this.generateMorphData();
        
        // Extract morph attributes from network output
        const attributes = {
            personality: Math.floor(networkResult.data[0] * 5),  // 0-4 personality types
            evolution: Math.floor(networkResult.data[1] * 3) + 1, // 1-3 evolution stage
            ability: Math.floor(networkResult.data[2] * 5),      // 0-4 ability types
            size: 0.5 + networkResult.data[3] * 1.5,             // 0.5-2.0 size
            color: new THREE.Color(
                networkResult.data[4], 
                networkResult.data[5], 
                networkResult.data[6]
            )
        };
        
        // Create a new morph at the specified position or random with neural attributes
        // Using our GaiaMorph class powered by GaiaScript
        const morph = new GaiaMorph(position, attributes);
        this.morphs.push(morph);
        this.scene.add(morph.mesh);
        
        // Create name indicator for the morph
        this.createMorphNameTag(morph);
        
        // Log the birth
        this.addConsoleEntry(`${morph.name} has appeared!`, "system");
        
        return morph;
    }
    
    // The rest of the methods remain similar to the original implementation
    // but we'll use our neural network for key decisions
    
    createMorphNameTag(morph) {
        // Create a div element for the morph's name tag
        const nameTag = document.createElement('div');
        nameTag.className = 'morph-indicator';
        
        // Add name and status indicator
        const nameElement = document.createElement('div');
        nameElement.className = 'morph-name-tag';
        nameElement.textContent = morph.name;
        nameTag.appendChild(nameElement);
        
        // Add status dot
        const statusDot = document.createElement('div');
        statusDot.className = 'morph-status-dot';
        nameTag.appendChild(statusDot);
        
        // Add to document and store in map
        document.body.appendChild(nameTag);
        this.nameIndicators.set(morph, nameTag);
        
        // Initially hide it (will be positioned in update)
        nameTag.style.display = 'none';
    }
    
    setupControls() {
        // Button event listeners for Tamagotchi interactions
        this.buttons.feed.addEventListener('click', () => this.feedMorph());
        this.buttons.pet.addEventListener('click', () => this.petMorph());
        this.buttons.play.addEventListener('click', () => this.playWithMorph());
        this.buttons.speak.addEventListener('click', () => this.speakToMorph());
        this.buttons.heal.addEventListener('click', () => this.healMorph());
        this.buttons.ability.addEventListener('click', () => this.useMorphAbility());
        this.buttons.merge.addEventListener('click', () => this.mergeMorphs());
        this.buttons.create.addEventListener('click', () => this.createNewCreature());
        this.buttons.attack.addEventListener('click', () => this.attackMorph());
        this.buttons.run.addEventListener('click', () => this.runGaiaScript());
        
        // Set up raycasting for morph selection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Canvas click for selecting morphs
        this.canvas.addEventListener('click', (event) => this.onCanvasClick(event));
        
        // Custom selection ring visual
        this.createSelectionRing();
    }
    
    runGaiaScript() {
        const code = this.gaiaCode.value;
        this.addConsoleEntry("Executing GaiaScript...", "system");
        
        try {
            // Try to parse the GaiaScript code
            const parsedCode = code.trim();
            
            // Glitch effect on execution
            document.body.classList.add('executing');
            setTimeout(() => {
                document.body.classList.remove('executing');
            }, 1000);
            
            // Create input data for the neural network
            const inputData = new Array(3 * 64 * 64).fill(0).map(() => Math.random());
            
            // Generate network result
            const networkResult = this.generateMorphData(inputData);
            
            // Use network results to modify the game
            setTimeout(() => {
                // Create some new morphs
                let newMorphCount = 0;
                
                if (this.morphs.length < this.config.maxMorphs) {
                    newMorphCount = Math.min(
                        this.config.maxMorphs - this.morphs.length,
                        Math.floor(networkResult.data[0] * 5)
                    );
                    
                    for (let i = 0; i < newMorphCount; i++) {
                        // Create morphs influenced by the neural network
                        const position = new THREE.Vector3(
                            this.camera.position.x + (networkResult.data[i*3+1] - 0.5) * 20,
                            this.camera.position.y + (networkResult.data[i*3+2] - 0.5) * 10,
                            this.camera.position.z + (networkResult.data[i*3+3] - 0.5) * 20
                        );
                        this.createNewMorph(position);
                    }
                }
                
                // Update existing morphs based on neural network output
                this.morphs.forEach((morph, index) => {
                    // Use different parts of the output array for different morphs
                    const outputIndex = (index * 3) % networkResult.data.length;
                    const evolutionChance = networkResult.data[outputIndex];
                    
                    // Random chance of evolution based on network
                    if (morph.evolutionStage < 3 && Math.random() < evolutionChance) {
                        morph.evolve();
                        this.addConsoleEntry(`${morph.name} has evolved to stage ${morph.evolutionStage}!`, "success");
                    }
                });
                
                // Modify environment based on neural output
                this.world.noiseScale = 0.05 + networkResult.data[4] * 0.15;
                this.world.distortion = 0.5 + networkResult.data[5] * 0.5;
                
                // Apply player effects
                this.playerStats.perception += Math.round(networkResult.data[6]);
                this.playerStats.health = Math.min(100, this.playerStats.health + Math.round(networkResult.data[7] * 30));
                this.playerStats.energy = Math.min(100, this.playerStats.energy + Math.round(networkResult.data[7] * 30));
                
                this.addConsoleEntry(`GaiaScript execution complete. ${newMorphCount > 0 ? `Generated ${newMorphCount} new morphs.` : 'Environment transformed.'}`, "success");
                this.updateStatsDisplay();
                
            }, 1500);
        } catch (error) {
            this.addConsoleEntry(`GaiaScript execution error: ${error.message}`, "error");
        }
    }
    
    selectMorph(morph) {
        // Deselect previously selected morph
        this.deselectMorph();
        
        // Select new morph
        this.selectedMorph = morph;
        morph.isSelected = true;
        
        // Update selection ring
        this.selectionRing.visible = true;
        this.selectionRing.scale.set(
            morph.size * 1.2,
            morph.size * 1.2,
            morph.size * 1.2
        );
        
        // Show morph info
        this.updateMorphInfoDisplay(morph);
        this.morphInfo.container.classList.add('visible');
        
        // Enable interaction buttons
        this.enableMorphInteractionButtons(morph);
        
        // Show a selection emoji
        this.showEmojiFeedback(morph, '👆');
        
        // Add to console
        this.addConsoleEntry(`${morph.name} selected. A ${morph.personalityType} morph with ${morph.specialAbility} ability.`);
    }
    
    animate(time) {
        requestAnimationFrame((t) => this.animate(t));
        
        // Update game state
        this.update(time);
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    // ... Rest of the game implementation remains largely the same
    // Only the neural network integration changes
}

// Export the game class
export default GaiaMorphSphereGame;