/**
 * MorphSphere - Tamagotchi-like Surreal AI Game
 */
class MorphSphereGame {
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
        
        // Initialize Three.js components
        this.initScene();
        this.initWorld();
        this.initMorphs(this.config.initialMorphCount);
        
        // Set up controls and event listeners
        this.setupControls();
        
        // Start game loop
        this.animate(0);
        
        // Add initial console messages
        this.addConsoleEntry("Welcome to MorphSphere, a Tamagotchi-like surreal pet simulator.");
        this.addConsoleEntry("Click on a Morph to select it, then use the buttons to interact.", "system");
    }
    
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
        // Create a new morph at the specified position or random
        const morph = new Morph(position);
        this.morphs.push(morph);
        this.scene.add(morph.mesh);
        
        // Create name indicator for the morph
        this.createMorphNameTag(morph);
        
        // Log the birth
        this.addConsoleEntry(`${morph.name} has appeared!`, "system");
        
        return morph;
    }
    
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
    
    createSelectionRing() {
        // Create a ring to show around selected morphs
        const ringGeometry = new THREE.TorusGeometry(1, 0.05, 16, 100);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x50e3c2,
            transparent: true,
            opacity: 0.6
        });
        
        this.selectionRing = new THREE.Mesh(ringGeometry, ringMaterial);
        this.selectionRing.visible = false;
        this.scene.add(this.selectionRing);
    }
    
    onCanvasClick(event) {
        // Only handle left clicks
        if (event.button !== 0) return;
        
        // Calculate mouse position in normalized device coordinates
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.canvas.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.canvas.clientHeight) * 2 + 1;
        
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
    
    deselectMorph() {
        if (this.selectedMorph) {
            // Update state
            this.selectedMorph.isSelected = false;
            this.selectedMorph = null;
            
            // Hide UI elements
            this.selectionRing.visible = false;
            this.morphInfo.container.classList.remove('visible');
            
            // Disable all morph-specific buttons
            this.disableMorphInteractionButtons();
        }
    }
    
    updateMorphInfoDisplay(morph) {
        // Update the morph info panel
        this.morphInfo.name.textContent = morph.name;
        this.morphInfo.personality.textContent = morph.personalityType;
        this.morphInfo.ability.textContent = morph.specialAbility;
        this.morphInfo.stage.textContent = `${morph.evolutionStage}/3`;
        
        // Update stat bars
        this.morphInfo.hungerBar.style.width = `${morph.hunger}%`;
        this.morphInfo.happinessBar.style.width = `${morph.happiness}%`;
    }
    
    enableMorphInteractionButtons(morph) {
        // Enable general interaction buttons
        this.buttons.feed.disabled = false;
        this.buttons.pet.disabled = false;
        this.buttons.play.disabled = false;
        this.buttons.speak.disabled = false;
        this.buttons.attack.disabled = false;
        
        // Enable or disable context-specific buttons
        this.buttons.heal.disabled = !morph.isSick;
        this.buttons.ability.disabled = morph.energy < 30;
        
        // Merge button requires at least one other morph
        this.buttons.merge.disabled = this.morphs.length < 2;
    }
    
    disableMorphInteractionButtons() {
        // Disable all morph-specific buttons
        this.buttons.feed.disabled = true;
        this.buttons.pet.disabled = true;
        this.buttons.play.disabled = true;
        this.buttons.speak.disabled = true;
        this.buttons.heal.disabled = true;
        this.buttons.ability.disabled = true;
        this.buttons.merge.disabled = true;
        this.buttons.attack.disabled = true;
    }
    
    feedMorph() {
        if (!this.selectedMorph) return;
        
        // Feed the morph
        const result = this.selectedMorph.feed();
        
        // Update UI
        this.updateMorphInfoDisplay(this.selectedMorph);
        
        // Show emoji feedback
        this.showEmojiFeedback(this.selectedMorph, '🍽️');
        
        // Log the result
        this.addConsoleEntry(result.message, result.success ? "success" : "error");
        
        // Update buttons state
        this.enableMorphInteractionButtons(this.selectedMorph);
    }
    
    petMorph() {
        if (!this.selectedMorph) return;
        
        // Pet the morph
        const result = this.selectedMorph.pet();
        
        // Update UI
        this.updateMorphInfoDisplay(this.selectedMorph);
        
        // Show emoji feedback
        this.showEmojiFeedback(this.selectedMorph, result.happiness > 70 ? '😊' : '😐');
        
        // Log the result
        this.addConsoleEntry(result.message, result.success ? "success" : "error");
        
        // Update buttons state
        this.enableMorphInteractionButtons(this.selectedMorph);
    }
    
    playWithMorph() {
        if (!this.selectedMorph) return;
        
        // Play with the morph
        const result = this.selectedMorph.playWith();
        
        // Update UI
        this.updateMorphInfoDisplay(this.selectedMorph);
        
        // Show emoji feedback
        this.showEmojiFeedback(this.selectedMorph, '🎮');
        
        // Log the result
        this.addConsoleEntry(result.message, result.success ? "success" : "error");
        
        // Update buttons state
        this.enableMorphInteractionButtons(this.selectedMorph);
    }
    
    speakToMorph() {
        if (!this.selectedMorph) return;
        
        // Speak to the morph
        const result = this.selectedMorph.speak();
        
        // Update UI
        this.updateMorphInfoDisplay(this.selectedMorph);
        
        // Show emoji feedback
        let emoji = '💬';
        switch(result.mood) {
            case 'ecstatic': emoji = '😄'; break;
            case 'happy': emoji = '😊'; break;
            case 'neutral': emoji = '😐'; break;
            case 'sad': emoji = '😢'; break;
            case 'depressed': emoji = '😭'; break;
            case 'sick': emoji = '🤒'; break;
            case 'sleeping': emoji = '💤'; break;
            case 'starving': emoji = '🍽️'; break;
        }
        this.showEmojiFeedback(this.selectedMorph, emoji);
        
        // Log the result
        this.addConsoleEntry(result.message, result.success ? "success" : "error");
    }
    
    healMorph() {
        if (!this.selectedMorph) return;
        
        // Heal the morph
        const result = this.selectedMorph.heal();
        
        // Update UI
        this.updateMorphInfoDisplay(this.selectedMorph);
        
        // Show emoji feedback
        this.showEmojiFeedback(this.selectedMorph, result.success ? '💊' : '❌');
        
        // Log the result
        this.addConsoleEntry(result.message, result.success ? "success" : "error");
        
        // Update buttons state
        this.enableMorphInteractionButtons(this.selectedMorph);
    }
    
    useMorphAbility() {
        if (!this.selectedMorph) return;
        
        // Use the morph's special ability
        const result = this.selectedMorph.useAbility();
        
        // Update UI
        this.updateMorphInfoDisplay(this.selectedMorph);
        
        // Show emoji feedback
        this.showEmojiFeedback(this.selectedMorph, '✨');
        
        // Log the result
        this.addConsoleEntry(result.message, result.success ? "success" : "error");
        
        // Update buttons state
        this.enableMorphInteractionButtons(this.selectedMorph);
        
        // Apply special effects based on ability
        this.applyAbilityEffects(result.effectType);
    }
    
    applyAbilityEffects(effectType) {
        // Apply visual effects based on ability type
        switch(effectType) {
            case 'glow':
                // Add brief screen flash
                const flash = document.createElement('div');
                flash.style.position = 'fixed';
                flash.style.top = '0';
                flash.style.left = '0';
                flash.style.width = '100%';
                flash.style.height = '100%';
                flash.style.backgroundColor = 'rgba(80, 227, 194, 0.3)';
                flash.style.pointerEvents = 'none';
                flash.style.zIndex = '9999';
                flash.style.transition = 'opacity 1s ease-out';
                document.body.appendChild(flash);
                
                setTimeout(() => {
                    flash.style.opacity = '0';
                    setTimeout(() => {
                        document.body.removeChild(flash);
                    }, 1000);
                }, 100);
                break;
                
            case 'teleport':
                // Already handled in the morph's ability method
                break;
                
            case 'energize':
                // Increase player energy
                this.playerStats.energy = Math.min(100, this.playerStats.energy + 20);
                this.updateStatsDisplay();
                break;
                
            case 'harmonize':
                // Increase happiness of all morphs
                this.morphs.forEach(morph => {
                    if (morph !== this.selectedMorph) {
                        morph.happiness = Math.min(100, morph.happiness + 10);
                    }
                });
                break;
        }
    }
    
    mergeMorphs() {
        if (!this.selectedMorph) return;
        
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
            this.addConsoleEntry("No suitable morph nearby to merge with.", "error");
            return;
        }
        
        // Show merger emoji
        this.showEmojiFeedback(this.selectedMorph, '🧬');
        this.showEmojiFeedback(nearestMorph, '🧬');
        
        // Create a new merged morph
        const mergedMorph = this.selectedMorph.merge(nearestMorph);
        
        // Remove name indicators for the original morphs
        const selectedIndicator = this.nameIndicators.get(this.selectedMorph);
        const nearestIndicator = this.nameIndicators.get(nearestMorph);
        
        if (selectedIndicator) document.body.removeChild(selectedIndicator);
        if (nearestIndicator) document.body.removeChild(nearestIndicator);
        
        this.nameIndicators.delete(this.selectedMorph);
        this.nameIndicators.delete(nearestMorph);
        
        // Remove the original morphs
        this.removeMorph(this.selectedMorph);
        this.removeMorph(nearestMorph);
        
        // Add the new merged morph
        this.morphs.push(mergedMorph);
        this.scene.add(mergedMorph.mesh);
        this.createMorphNameTag(mergedMorph);
        
        // Select the new morph
        this.selectMorph(mergedMorph);
        
        // Log the merge
        this.addConsoleEntry(`${this.selectedMorph.name} was created from a merger!`, "success");
        this.updateStatsDisplay();
    }
    
    createNewCreature() {
        if (this.morphs.length >= this.config.maxMorphs) {
            this.addConsoleEntry(`Cannot create more morphs. Maximum (${this.config.maxMorphs}) reached.`, "error");
            return;
        }
        
        if (this.playerStats.energy < 20) {
            this.addConsoleEntry("Not enough energy to create a new creature.", "error");
            return;
        }
        
        // Use energy to create a new creature
        this.playerStats.energy -= 20;
        
        // Create a sound node at a random position
        const position = new THREE.Vector3(
            this.camera.position.x + (Math.random() - 0.5) * 8,
            this.camera.position.y + (Math.random() - 0.5) * 8,
            this.camera.position.z + (Math.random() - 0.5) * 8
        );
        
        const soundNode = this.world.createSoundNode(position);
        
        // Create new morph
        const newMorph = this.createNewMorph(position);
        
        // Update stats
        this.updateStatsDisplay();
        
        // Add console entry
        this.addConsoleEntry(`A new creature named ${newMorph.name} has been created!`, "success");
    }
    
    attackMorph() {
        if (!this.selectedMorph) return;
        
        // Attack the morph
        const result = this.selectedMorph.attack(15);
        
        // Update UI
        this.updateMorphInfoDisplay(this.selectedMorph);
        
        // Show emoji feedback
        this.showEmojiFeedback(this.selectedMorph, '⚡');
        
        // Log the result
        this.addConsoleEntry(result.message, "error");
        
        // Check if morph died from attack
        if (result.healthRemaining <= 0) {
            this.addConsoleEntry(`${this.selectedMorph.name} has been defeated!`, "error");
            
            // Add essence to player
            this.playerStats.capturedEssence += this.selectedMorph.essence;
            
            // Remove the morph with a delay
            setTimeout(() => {
                if (this.selectedMorph) {
                    this.removeMorph(this.selectedMorph);
                    this.deselectMorph();
                    this.updateStatsDisplay();
                }
            }, 1000);
        } else {
            // Update buttons state
            this.enableMorphInteractionButtons(this.selectedMorph);
        }
    }
    
    runGaiaScript() {
        const code = this.gaiaCode.value;
        this.addConsoleEntry("Executing GaiaScript...", "system");
        
        // Glitch effect on execution
        document.body.classList.add('executing');
        setTimeout(() => {
            document.body.classList.remove('executing');
        }, 1000);
        
        // Simulate GaiaScript execution
        setTimeout(() => {
            // Parse different parts of the code to affect different aspects
            const worldEffects = code.includes('W:');
            const agentEffects = code.includes('A:');
            const perceptionEffects = code.includes('P:');
            
            // Create some new morphs
            let newMorphCount = 0;
            
            if (this.morphs.length < this.config.maxMorphs) {
                newMorphCount = Math.min(
                    this.config.maxMorphs - this.morphs.length,
                    Math.floor(Math.random() * 3) + 1
                );
                
                for (let i = 0; i < newMorphCount; i++) {
                    if (Math.random() > 0.5) {
                        // Create at random position
                        this.createNewMorph();
                    } else {
                        // Create near camera
                        const position = new THREE.Vector3(
                            this.camera.position.x + (Math.random() - 0.5) * 10,
                            this.camera.position.y + (Math.random() - 0.5) * 10,
                            this.camera.position.z + (Math.random() - 0.5) * 10
                        );
                        this.createNewMorph(position);
                    }
                }
            }
            
            // Apply environmental changes if world code is present
            if (worldEffects) {
                // Change terrain properties
                this.world.noiseScale = 0.05 + Math.random() * 0.15;
                this.world.distortion = 0.5 + Math.random() * 0.5;
                
                // Update existing morphs
                this.morphs.forEach(morph => {
                    // Random chance of evolution
                    if (morph.evolutionStage < 3 && Math.random() < 0.2) {
                        morph.evolve();
                        this.addConsoleEntry(`${morph.name} has evolved to stage ${morph.evolutionStage}!`, "success");
                    }
                });
            }
            
            // Apply agent intelligence changes if agent code is present
            if (agentEffects) {
                // Make morphs behave differently
                this.morphs.forEach(morph => {
                    // Randomize personality traits
                    if (Math.random() < 0.3) {
                        morph.personalityType = morph.generatePersonality();
                        this.addConsoleEntry(`${morph.name}'s personality has changed to ${morph.personalityType}!`, "system");
                    }
                    
                    // Add random effects
                    if (Math.random() < 0.2) {
                        const effectTypes = ['speed_boost', 'healing'];
                        morph.effects.push({
                            type: effectTypes[Math.floor(Math.random() * effectTypes.length)],
                            duration: 100
                        });
                    }
                });
            }
            
            // Apply perception changes if perception code is present
            if (perceptionEffects) {
                // Increase player perception
                this.playerStats.perception++;
                
                // Heal player
                this.playerStats.health = Math.min(100, this.playerStats.health + 20);
                this.playerStats.energy = Math.min(100, this.playerStats.energy + 20);
                
                // Update camera effects
                this.camera.fov = 75 + Math.random() * 20;
                this.camera.updateProjectionMatrix();
            }
            
            this.addConsoleEntry(`GaiaScript execution complete. ${newMorphCount > 0 ? `Generated ${newMorphCount} new morphs.` : 'Environment transformed.'}`, "success");
            this.updateStatsDisplay();
        }, 1500);
    }
    
    showEmojiFeedback(morph, emoji) {
        if (!morph || !morph.mesh) return;
        
        // Project morph position to screen coordinates
        const position = morph.mesh.position.clone();
        position.project(this.camera);
        
        // Create emoji element
        const emojiElement = document.createElement('div');
        emojiElement.className = 'emoji-feedback';
        emojiElement.textContent = emoji;
        
        // Position emoji at morph
        const x = (position.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(position.y * 0.5) + 0.5) * window.innerHeight;
        
        emojiElement.style.left = `${x}px`;
        emojiElement.style.top = `${y}px`;
        
        // Add to document
        document.body.appendChild(emojiElement);
        
        // Remove after animation completes
        setTimeout(() => {
            if (document.body.contains(emojiElement)) {
                document.body.removeChild(emojiElement);
            }
        }, 2000);
    }
    
    removeMorph(morph) {
        const index = this.morphs.indexOf(morph);
        if (index !== -1) {
            // Remove from morphs array
            this.morphs.splice(index, 1);
            
            // Remove from scene
            this.scene.remove(morph.mesh);
            
            // Remove name indicator
            const indicator = this.nameIndicators.get(morph);
            if (indicator && document.body.contains(indicator)) {
                document.body.removeChild(indicator);
            }
            this.nameIndicators.delete(morph);
            
            // Dispose resources
            morph.dispose();
        }
    }
    
    updateStatsDisplay() {
        // Update player stats display
        this.statsElements.morphCount.textContent = this.morphs.length;
        this.statsElements.perceptionLevel.textContent = this.playerStats.perception;
        this.statsElements.healthBar.style.width = `${this.playerStats.health}%`;
        this.statsElements.energyBar.style.width = `${this.playerStats.energy}%`;
        
        // Update selected morph info if there is one
        if (this.selectedMorph) {
            this.updateMorphInfoDisplay(this.selectedMorph);
            this.enableMorphInteractionButtons(this.selectedMorph);
        }
    }
    
    addConsoleEntry(message, type = "") {
        const entry = document.createElement('div');
        entry.className = `console-entry ${type}`;
        entry.textContent = message;
        this.console.appendChild(entry);
        
        // Auto-scroll to the bottom
        this.console.scrollTop = this.console.scrollHeight;
        
        // Limit number of entries
        while (this.console.children.length > 15) {
            this.console.removeChild(this.console.firstChild);
        }
    }
    
    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    
    updateMorphNameTags() {
        // Update position of all morph name tags
        for (const [morph, element] of this.nameIndicators.entries()) {
            if (!morph.mesh) {
                // Morph is no longer valid
                if (document.body.contains(element)) {
                    document.body.removeChild(element);
                }
                this.nameIndicators.delete(morph);
                continue;
            }
            
            // Calculate screen position
            const position = morph.mesh.position.clone();
            position.project(this.camera);
            
            // Only show if in front of camera
            if (position.z < 1) {
                const x = (position.x * 0.5 + 0.5) * window.innerWidth;
                const y = (-(position.y * 0.5) + 0.5) * window.innerHeight;
                
                // Position just above the morph
                element.style.left = `${x}px`;
                element.style.top = `${y - 40}px`;
                element.style.display = 'block';
                
                // Update status dot based on morph state
                const statusDot = element.querySelector('.morph-status-dot');
                if (statusDot) {
                    statusDot.className = 'morph-status-dot';
                    
                    if (morph.isSick) {
                        statusDot.classList.add('status-sick');
                    } else if (morph.isSleeping) {
                        statusDot.classList.add('status-sleeping');
                    } else if (morph.isHungry) {
                        statusDot.classList.add('status-hungry');
                    } else if (morph.isHappy) {
                        statusDot.classList.add('status-happy');
                    } else if (morph.happiness < 30) {
                        statusDot.classList.add('status-sad');
                    }
                }
            } else {
                // Hide if behind camera
                element.style.display = 'none';
            }
        }
    }
    
    updateSelectionRing() {
        // Update selection ring position and rotation
        if (this.selectedMorph && this.selectionRing.visible) {
            this.selectionRing.position.copy(this.selectedMorph.mesh.position);
            this.selectionRing.rotation.x += 0.01;
            this.selectionRing.rotation.y += 0.02;
        }
    }
    
    update(time) {
        // Calculate delta time for consistent updates
        if (this.lastFrameTime > 0) {
            this.deltaTime = (time - this.lastFrameTime) * 0.001; // Convert to seconds
        }
        this.lastFrameTime = time;
        
        // Cap delta time to avoid huge jumps
        this.deltaTime = Math.min(this.deltaTime, 0.1);
        
        // Update morphs with Tamagotchi-like behaviors
        for (let i = this.morphs.length - 1; i >= 0; i--) {
            const morph = this.morphs[i];
            const alive = morph.update(time, this.deltaTime * 10); // Scale time for game balance
            
            if (!alive) {
                // Morph died of old age or other causes
                this.addConsoleEntry(`${morph.name} has passed away...`, "system");
                
                // Remove if currently selected
                if (this.selectedMorph === morph) {
                    this.deselectMorph();
                }
                
                // Remove the morph
                this.removeMorph(morph);
            }
        }
        
        // Update world with LCD/Seaman-inspired trippy effects
        this.world.update(time);
        
        // Update orbit controls
        this.controls.update();
        
        // Position name tags and selection ring
        this.updateMorphNameTags();
        this.updateSelectionRing();
        
        // Player state updates
        this.updatePlayerState();
        
        // Environment events
        this.processEnvironmentEvents();
        
        // Update stats display occasionally
        if (time - this.lastStatsUpdate > 1000) {
            this.updateStatsDisplay();
            this.lastStatsUpdate = time;
        }
    }
    
    updatePlayerState() {
        // Slowly decrease energy
        this.playerStats.energy = Math.max(0, this.playerStats.energy - this.config.energyDecayRate * this.deltaTime);
        
        // Increase perception if enough essence gathered
        if (this.playerStats.capturedEssence >= 1) {
            this.playerStats.capturedEssence -= 1;
            this.playerStats.perception++;
            this.addConsoleEntry(`Your perception has increased to level ${this.playerStats.perception}!`, "success");
        }
    }
    
    processEnvironmentEvents() {
        // Spawn new morphs randomly
        if (Math.random() < this.config.morphSpawnChance * this.deltaTime && 
            this.morphs.length < this.config.maxMorphs) {
            this.createNewMorph();
        }
        
        // Check for potential morph interactions with each other
        this.processMorphInteractions();
    }
    
    processMorphInteractions() {
        // Process potential reproduction between compatible morphs
        if (this.morphs.length >= 2 && this.morphs.length < this.config.maxMorphs) {
            for (let i = 0; i < this.morphs.length; i++) {
                const morph1 = this.morphs[i];
                
                // Only attempt reproduction for morphs that can reproduce
                if (!morph1.canReproduce) continue;
                
                for (let j = i + 1; j < this.morphs.length; j++) {
                    const morph2 = this.morphs[j];
                    
                    // Check if both can reproduce and are close enough
                    if (morph2.canReproduce && 
                        morph1.position.distanceTo(morph2.position) < 3 &&
                        Math.random() < 0.01 * this.deltaTime) {
                        
                        // Attempt reproduction
                        const result = morph1.reproduce(morph2);
                        
                        if (result.success) {
                            // Add the child to the world
                            this.morphs.push(result.child);
                            this.scene.add(result.child.mesh);
                            this.createMorphNameTag(result.child);
                            
                            // Log the birth
                            this.addConsoleEntry(result.message, "success");
                            this.updateStatsDisplay();
                            
                            // Show emoji feedback
                            this.showEmojiFeedback(morph1, '👶');
                            this.showEmojiFeedback(morph2, '👶');
                            
                            // Only one reproduction per update
                            return;
                        }
                    }
                }
            }
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
        
        // Remove name indicators
        for (const element of this.nameIndicators.values()) {
            if (document.body.contains(element)) {
                document.body.removeChild(element);
            }
        }
        this.nameIndicators.clear();
        
        // Clean up THREE.js resources
        this.renderer.dispose();
        if (this.selectionRing) {
            this.selectionRing.geometry.dispose();
            this.selectionRing.material.dispose();
        }
    }
}

// Start the game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new MorphSphereGame();
    
    // Store game instance for debugging
    window.game = game;
});