/**
 * Morph class - represents Tamagotchi-like evolving entities in the game
 */
class Morph {
    constructor(position, size, complexity, personality) {
        // Physical properties
        this.position = position || new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        this.size = size || Math.random() * 1.5 + 0.5;
        this.complexity = complexity || Math.floor(Math.random() * 3) + 1;
        this.baseColor = new THREE.Color(
            0.5 + Math.random() * 0.5,
            0.5 + Math.random() * 0.5,
            0.5 + Math.random() * 0.5
        );
        this.phase = Math.random() * Math.PI * 2;
        this.speed = 0.005 + Math.random() * 0.01;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;

        // Rendering properties
        this.geometry = null;
        this.material = null;
        this.mesh = null;
        this.glowMesh = null;
        this.emotionParticles = null;
        this.namePlate = null;

        // Tamagotchi-like vital statistics
        this.name = this.generateName();
        this.hunger = 20 + Math.floor(Math.random() * 60);
        this.happiness = 50 + Math.floor(Math.random() * 50);
        this.energy = 70 + Math.floor(Math.random() * 30);
        this.health = 100;
        this.age = 0;
        this.maxAge = 300 + Math.floor(Math.random() * 700);
        this.evolutionStage = 1;
        this.evolutionThreshold = 150 + Math.floor(Math.random() * 100);
        this.essence = Math.random(); // Used for merging and spiritual value
        this.lastFed = 0;
        this.lastPet = 0;
        this.personalityType = personality || this.generatePersonality();
        this.memories = []; // Remember interactions
        this.mood = "neutral";
        this.specialAbility = this.generateAbility();
        this.friends = []; // Other morphs this one likes

        // Reproduction
        this.canReproduce = false;
        this.reproductionCooldown = 0;
        this.offspringCount = 0;
        this.maxOffspring = 2 + Math.floor(Math.random() * 3);
        
        // Status effects
        this.effects = [];
        this.isSelected = false;
        this.isSick = false;
        this.isSleeping = false;
        this.isHungry = this.hunger < 30;
        this.isHappy = this.happiness > 70;
        
        // UI elements
        this.statusBars = null;
        this.emotionIcon = null;
        
        // Create 3D representation
        this.createMesh();
        this.updateAppearanceBasedOnStats();
    }

    generateName() {
        const prefixes = ['Xo', 'Pi', 'Za', 'Qu', 'Mo', 'Vy', 'Zo', 'Ni', 'Ku', 'Ga'];
        const suffixes = ['rp', 'bl', 'xi', 'th', 'ra', 'sh', 'lo', 'ma', 'pp', 'tz'];
        const middleSyllables = ['ta', 'ki', 'lu', 'me', 'jo', 'sa', 'di', 'vu', 'pa', ''];
        
        const useMiddle = Math.random() > 0.5;
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const middle = useMiddle ? middleSyllables[Math.floor(Math.random() * middleSyllables.length)] : '';
        
        return prefix + middle + suffix;
    }

    generatePersonality() {
        const personalities = [
            'playful',  // Likes to be petted, moves a lot
            'shy',      // Stays away from others, needs gentle care
            'curious',  // Explores, likes new things
            'grumpy',   // Often unhappy, needs extra attention
            'lazy',     // Moves slowly, sleeps a lot, low energy
            'hyper',    // High energy, needs lots of activity
            'friendly', // Likes to be near other morphs
            'solitary', // Prefers to be alone
            'hungry',   // Needs more food than others
            'musical'   // Makes sounds/music when happy
        ];
        
        return personalities[Math.floor(Math.random() * personalities.length)];
    }

    generateAbility() {
        const abilities = [
            'glow',           // Can emit light
            'teleport',       // Can jump to random locations
            'duplicate',      // Can create temporary copies
            'heal',           // Can heal other morphs
            'energize',       // Can give energy to player or morphs
            'harmonize',      // Can make other morphs happier
            'metamorphosis',  // Can temporarily change shape
            'terraforming',   // Can alter nearby environment
            'foresight',      // Can predict events
            'dreamshare'      // Can share memories with other morphs
        ];
        
        return abilities[Math.floor(Math.random() * abilities.length)];
    }

    createMesh() {
        // Create different geometries based on complexity and evolution stage
        this.createGeometry();
        
        // Create material with unique properties
        this.material = new THREE.MeshPhongMaterial({
            color: this.baseColor,
            emissive: new THREE.Color(this.baseColor.r * 0.2, this.baseColor.g * 0.2, this.baseColor.b * 0.2),
            shininess: 50,
            transparent: true,
            opacity: 0.9,
            wireframe: this.personalityType === 'curious' || this.complexity === 3
        });

        // Main mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(this.position);
        this.mesh.userData.morph = this;
        
        // Add glow effect for certain abilities or states
        if (this.specialAbility === 'glow' || this.evolutionStage > 2) {
            this.addGlowEffect();
        }
        
        // Add name plate
        this.createNamePlate();
        
        // Add status indicators
        this.createStatusIndicators();
    }
    
    createGeometry() {
        const evolvedFactor = Math.pow(1.1, this.evolutionStage - 1);
        const sizeMultiplier = this.size * evolvedFactor;
        
        switch(this.evolutionStage) {
            case 1: // Basic form
                switch(this.complexity) {
                    case 1:
                        this.geometry = new THREE.IcosahedronGeometry(sizeMultiplier, 1);
                        break;
                    case 2:
                        this.geometry = new THREE.TorusKnotGeometry(
                            sizeMultiplier, sizeMultiplier * 0.3, 64, 8, 2, 3
                        );
                        break;
                    case 3:
                        this.geometry = new THREE.OctahedronGeometry(sizeMultiplier, 2);
                        break;
                    default:
                        this.geometry = new THREE.SphereGeometry(sizeMultiplier, 16, 16);
                }
                break;
                
            case 2: // Evolved form - more complex
                switch(this.complexity) {
                    case 1:
                        this.geometry = new THREE.DodecahedronGeometry(sizeMultiplier, 2);
                        break;
                    case 2:
                        this.geometry = new THREE.TorusKnotGeometry(
                            sizeMultiplier, sizeMultiplier * 0.3, 64, 8, 3, 4
                        );
                        break;
                    case 3:
                        // Custom geometry - merge multiple shapes
                        const baseGeom = new THREE.IcosahedronGeometry(sizeMultiplier, 1);
                        const spheres = new THREE.SphereGeometry(sizeMultiplier * 0.3, 8, 8);
                        
                        // Add spheres at vertices
                        const vertexCount = 5;
                        for (let i = 0; i < vertexCount; i++) {
                            const phi = Math.acos(-1 + (2 * i) / vertexCount);
                            const theta = Math.sqrt(vertexCount * Math.PI) * phi;
                            
                            const x = sizeMultiplier * Math.cos(theta) * Math.sin(phi);
                            const y = sizeMultiplier * Math.sin(theta) * Math.sin(phi);
                            const z = sizeMultiplier * Math.cos(phi);
                            
                            const sphereMesh = new THREE.Mesh(spheres);
                            sphereMesh.position.set(x, y, z);
                            
                            // We would merge geometries here in a full implementation
                        }
                        
                        this.geometry = baseGeom;
                        break;
                    default:
                        this.geometry = new THREE.TetrahedronGeometry(sizeMultiplier, 2);
                }
                break;
                
            case 3: // Final form - most complex and unique
                // In a full implementation, we would create truly custom geometries
                // For now, we'll use more complex THREE.js geometries
                switch(this.personalityType) {
                    case 'playful':
                        this.geometry = new THREE.TorusKnotGeometry(
                            sizeMultiplier, sizeMultiplier * 0.4, 128, 16, 2, 5
                        );
                        break;
                    case 'shy':
                        this.geometry = new THREE.SphereGeometry(sizeMultiplier, 32, 32);
                        // Would add indentations in full implementation
                        break;
                    case 'curious':
                        this.geometry = new THREE.OctahedronGeometry(sizeMultiplier, 3);
                        break;
                    case 'grumpy':
                        this.geometry = new THREE.BoxGeometry(
                            sizeMultiplier, sizeMultiplier, sizeMultiplier
                        );
                        // Would add spikes in full implementation
                        break;
                    default:
                        // Create a unique "final form" based on personality
                        this.geometry = new THREE.IcosahedronGeometry(sizeMultiplier, 3);
                }
                break;
        }
    }
    
    addGlowEffect() {
        // Add a larger transparent mesh for glow effect
        const glowGeometry = this.geometry.clone();
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.baseColor,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        
        this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.glowMesh.scale.multiplyScalar(1.2);
        this.mesh.add(this.glowMesh);
    }
    
    createNamePlate() {
        // In a full implementation, we would create a proper name plate
        // For simplicity, we'll just store the name for now
        this.displayName = this.name;
    }
    
    createStatusIndicators() {
        // In a full implementation, we would create 3D UI elements
        // For now, we'll just log the creation
        this.hasStatusIndicators = true;
    }

    update(time, deltaTime = 1) {
        if (!this.mesh) return false;
        
        // Apply status effects
        this.applyEffects(time);
        
        // Update vital stats based on personality
        this.updateVitalStats(deltaTime);
        
        // Check for evolution
        this.checkEvolution();
        
        // Check reproduction ability
        this.updateReproductionStatus(deltaTime);
        
        // Movement pattern based on personality and mood
        this.updateMovement(time);
        
        // Rotation and scaling
        this.updateAppearance(time);
        
        // Update mood and behavior
        this.updateMood();
        
        // Return whether the morph is still alive
        return this.health > 0 && this.age < this.maxAge;
    }
    
    applyEffects(time) {
        // Process active effects
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            
            // Apply effect
            switch(effect.type) {
                case 'speed_boost':
                    this.speed = this.speed * 1.5;
                    break;
                case 'healing':
                    this.health += 0.1;
                    break;
                case 'sickness':
                    this.health -= 0.1;
                    this.happiness -= 0.2;
                    break;
                // Add more effects as needed
            }
            
            // Decrease duration
            effect.duration--;
            
            // Remove expired effects
            if (effect.duration <= 0) {
                this.effects.splice(i, 1);
            }
        }
        
        // Cap stats to valid ranges
        this.health = Math.min(100, Math.max(0, this.health));
    }
    
    updateVitalStats(deltaTime) {
        // Age increases over time
        this.age += deltaTime * 0.1;
        
        // Hunger increases over time
        const hungerRate = this.personalityType === 'hungry' ? 0.3 : 0.15;
        this.hunger = Math.max(0, this.hunger - hungerRate * deltaTime);
        
        // Happiness decreases if hungry or not pet recently
        let happinessChange = 0;
        
        if (this.hunger < 20) {
            happinessChange -= 0.2 * deltaTime;
            this.isHungry = true;
        } else {
            this.isHungry = false;
        }
        
        if (this.age - this.lastPet > 100 && this.personalityType !== 'solitary') {
            happinessChange -= 0.1 * deltaTime;
        }
        
        // Personality affects happiness changes
        if (this.personalityType === 'grumpy') {
            happinessChange -= 0.05 * deltaTime;
        } else if (this.personalityType === 'playful') {
            happinessChange += 0.05 * deltaTime;
        }
        
        this.happiness = Math.min(100, Math.max(0, this.happiness + happinessChange));
        this.isHappy = this.happiness > 70;
        
        // Energy decreases with movement and increases when sleeping
        if (this.isSleeping) {
            this.energy = Math.min(100, this.energy + 0.3 * deltaTime);
        } else {
            const energyRate = this.personalityType === 'lazy' ? 0.05 : 
                              (this.personalityType === 'hyper' ? 0.2 : 0.1);
            this.energy = Math.max(0, this.energy - energyRate * deltaTime);
        }
        
        // Health decreases if hungry or low energy
        if (this.hunger < 10 || this.energy < 10) {
            this.health = Math.max(0, this.health - 0.1 * deltaTime);
        }
        
        // Random chance of getting sick
        if (Math.random() < 0.0002 * deltaTime) {
            this.isSick = true;
            this.effects.push({
                type: 'sickness',
                duration: 100
            });
        }
        
        // Start sleeping if energy is too low
        if (this.energy < 15 && !this.isSleeping) {
            this.isSleeping = true;
        } else if (this.energy > 90 && this.isSleeping) {
            this.isSleeping = false;
        }
        
        // Update appearance based on new stats
        this.updateAppearanceBasedOnStats();
    }
    
    checkEvolution() {
        // Check if ready to evolve
        if (this.age > this.evolutionThreshold && this.evolutionStage < 3 && this.health > 50) {
            this.evolve();
        }
    }
    
    evolve() {
        // Increment evolution stage
        this.evolutionStage++;
        
        // Update evolution threshold for next stage
        this.evolutionThreshold = this.age + 200;
        
        // Improve stats
        this.health = 100;
        this.energy = 100;
        this.maxAge += 300;
        
        // Recreate mesh with new form
        this.disposeMesh();
        this.createGeometry();
        
        // Update material
        this.material = new THREE.MeshPhongMaterial({
            color: this.baseColor,
            emissive: new THREE.Color(this.baseColor.r * 0.3, this.baseColor.g * 0.3, this.baseColor.b * 0.3),
            shininess: 70,
            transparent: true,
            opacity: 0.9,
            wireframe: this.personalityType === 'curious' || this.complexity === 3
        });
        
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(this.position);
        this.mesh.userData.morph = this;
        
        // Add glow effect for higher evolution stages
        this.addGlowEffect();
        
        // Memory of evolution
        this.memories.push({
            type: 'evolution',
            stage: this.evolutionStage,
            age: this.age
        });
    }
    
    updateReproductionStatus(deltaTime) {
        // Update reproduction cooldown
        if (this.reproductionCooldown > 0) {
            this.reproductionCooldown -= deltaTime;
        }
        
        // Check if can reproduce
        this.canReproduce = (
            this.evolutionStage > 1 && 
            this.health > 70 && 
            this.energy > 50 && 
            this.hunger > 50 && 
            this.offspringCount < this.maxOffspring && 
            this.reproductionCooldown <= 0
        );
    }
    
    updateMovement(time) {
        // Skip movement if sleeping
        if (this.isSleeping) {
            return;
        }
        
        // Personality affects movement
        let speedMultiplier = 1.0;
        
        switch(this.personalityType) {
            case 'lazy':
                speedMultiplier = 0.5;
                break;
            case 'hyper':
                speedMultiplier = 2.0;
                break;
            case 'shy':
                // Shy morphs move away from player/other morphs
                speedMultiplier = 1.2;
                break;
            case 'curious':
                // More erratic movement
                speedMultiplier = 1.5;
                break;
        }
        
        // Energy affects movement speed
        if (this.energy < 30) {
            speedMultiplier *= 0.5;
        }
        
        // Base movement with sine waves
        const moveSpeed = this.speed * speedMultiplier;
        
        this.position.x += Math.sin(time * moveSpeed + this.phase) * 0.01;
        this.position.y += Math.cos(time * moveSpeed + this.phase * 2) * 0.01;
        this.position.z += Math.sin(time * moveSpeed + this.phase * 3) * 0.01;
        
        // Special movement for some personalities
        if (this.personalityType === 'teleport' && Math.random() < 0.001) {
            // Occasionally teleport to a new location
            this.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );
        }
        
        // Update mesh position
        this.mesh.position.copy(this.position);
    }
    
    updateAppearance(time) {
        if (!this.mesh) return;
        
        // Rotation - affected by personality
        let rotMultiplier = this.personalityType === 'lazy' ? 0.5 : 
                          (this.personalityType === 'hyper' ? 2.0 : 1.0);
        
        // Sleeping morphs rotate much slower
        if (this.isSleeping) {
            rotMultiplier = 0.1;
        }
        
        this.mesh.rotation.x += this.rotationSpeed * rotMultiplier;
        this.mesh.rotation.y += this.rotationSpeed * 1.5 * rotMultiplier;
        
        // Pulsing effect based on mood and health
        let pulseIntensity = 0.1;
        
        if (this.isHappy) {
            pulseIntensity = 0.15;
        } else if (this.isSick) {
            pulseIntensity = 0.05;
        }
        
        const scale = 1 + Math.sin(time * 0.001 + this.phase) * pulseIntensity;
        this.mesh.scale.set(scale, scale, scale);
        
        // Color changes based on mood and state
        this.updateColorBasedOnState(time);
    }
    
    updateColorBasedOnState(time) {
        // Start with base hue from the morph's original color
        let baseHue, baseSaturation, baseLightness;
        this.baseColor.getHSL({h: baseHue, s: baseSaturation, l: baseLightness});
        
        let hue = (time * 0.0001 + this.phase) % 1; // Slow cycling
        let saturation = 0.7;
        let lightness = 0.5;
        
        // Mood affects color
        if (this.isHappy) {
            // Brighter, more vivid colors when happy
            saturation = 0.8;
            lightness = 0.6;
        } else if (this.happiness < 30) {
            // Desaturated colors when sad
            saturation = 0.3;
            lightness = 0.3;
        }
        
        // Health affects color
        if (this.health < 50) {
            // More red tint when low health
            hue = hue * 0.5 + 0.95; // Shift toward red
            lightness *= 0.8; // Darker
        }
        
        // Special states
        if (this.isSleeping) {
            // Darker, bluish when sleeping
            hue = 0.6; // Blue
            saturation = 0.3;
            lightness = 0.3;
        } else if (this.isSick) {
            // Greenish tint when sick
            hue = 0.3; // Green
            saturation = 0.6;
            lightness = 0.4;
        } else if (this.isSelected) {
            // Highlighted when selected
            lightness = 0.7;
            saturation = 1.0;
        }
        
        // Apply color to material
        this.material.color.setHSL(hue, saturation, lightness);
        this.material.emissive.setHSL(hue, saturation, lightness * 0.4);
        
        // Update glow mesh if it exists
        if (this.glowMesh) {
            this.glowMesh.material.color.setHSL(hue, saturation, lightness + 0.2);
        }
    }
    
    updateAppearanceBasedOnStats() {
        if (!this.material) return;
        
        // Opacity based on health
        this.material.opacity = 0.5 + (this.health / 100) * 0.5;
        
        // Emissive intensity based on energy
        const emissiveIntensity = this.energy / 100;
        this.material.emissiveIntensity = emissiveIntensity;
        
        // Size based on hunger (shrink when hungry)
        if (this.isHungry && this.mesh) {
            this.mesh.scale.multiplyScalar(0.95);
        }
    }
    
    updateMood() {
        // Determine mood based on stats
        if (this.happiness > 80) {
            this.mood = "ecstatic";
        } else if (this.happiness > 60) {
            this.mood = "happy";
        } else if (this.happiness > 40) {
            this.mood = "neutral";
        } else if (this.happiness > 20) {
            this.mood = "sad";
        } else {
            this.mood = "depressed";
        }
        
        // Override for special states
        if (this.isSick) {
            this.mood = "sick";
        } else if (this.isSleeping) {
            this.mood = "sleeping";
        } else if (this.isHungry && this.hunger < 10) {
            this.mood = "starving";
        }
    }

    // Interaction methods
    feed(foodAmount = 30) {
        // Increase hunger
        this.hunger = Math.min(100, this.hunger + foodAmount);
        this.lastFed = this.age;
        
        // Being fed makes the morph happier
        this.happiness = Math.min(100, this.happiness + 10);
        
        // Record memory
        this.memories.push({
            type: 'fed',
            amount: foodAmount,
            age: this.age
        });
        
        // Return result of feeding
        return {
            success: true,
            message: `${this.name} enjoys the food! Hunger: ${Math.floor(this.hunger)}/100`
        };
    }
    
    pet() {
        // Being pet increases happiness
        let happinessBoost = 15;
        
        // Personality affects response to petting
        if (this.personalityType === 'playful') {
            happinessBoost = 25;
        } else if (this.personalityType === 'grumpy') {
            happinessBoost = 5;
        } else if (this.personalityType === 'shy') {
            // Shy morphs don't like excessive petting
            const timeSinceLastPet = this.age - this.lastPet;
            if (timeSinceLastPet < 20) {
                happinessBoost = -5;
            }
        }
        
        this.happiness = Math.min(100, this.happiness + happinessBoost);
        this.lastPet = this.age;
        
        // Record memory
        this.memories.push({
            type: 'pet',
            response: happinessBoost > 0 ? 'positive' : 'negative',
            age: this.age
        });
        
        // Return result of petting
        return {
            success: true,
            happiness: Math.floor(this.happiness),
            message: happinessBoost > 0 ? 
                `${this.name} enjoys being pet!` : 
                `${this.name} doesn't seem to enjoy that.`
        };
    }
    
    speak() {
        // Generate response based on mood and personality
        let response = "";
        
        switch(this.mood) {
            case "ecstatic":
                response = "🎵 " + this.name + " vibrates with joyful energy!";
                break;
            case "happy":
                response = "✨ " + this.name + " responds with a gentle glow.";
                break;
            case "neutral":
                response = "〰️ " + this.name + " hums a neutral tone.";
                break;
            case "sad":
                response = "↘️ " + this.name + " emits a low, melancholy signal.";
                break;
            case "depressed":
                response = "⬇️ " + this.name + " barely responds.";
                break;
            case "sick":
                response = "🤒 " + this.name + " makes a distressed noise.";
                break;
            case "sleeping":
                response = "💤 " + this.name + " makes gentle sleeping sounds.";
                break;
            case "starving":
                response = "⚠️ " + this.name + " makes desperate hungry noises!";
                break;
        }
        
        // Add personality flavor
        if (this.personalityType === 'musical' && this.mood !== "sleeping") {
            response += " 🎵 It creates a small melody.";
        }
        
        // Record communication
        this.memories.push({
            type: 'communication',
            mood: this.mood,
            age: this.age
        });
        
        // Speaking increases bond slightly
        this.happiness = Math.min(100, this.happiness + 2);
        
        return {
            success: true,
            message: response,
            mood: this.mood
        };
    }
    
    heal() {
        if (!this.isSick) {
            return {
                success: false,
                message: `${this.name} is not sick.`
            };
        }
        
        // Remove sickness effect
        for (let i = this.effects.length - 1; i >= 0; i--) {
            if (this.effects[i].type === 'sickness') {
                this.effects.splice(i, 1);
            }
        }
        
        this.isSick = false;
        this.health = Math.min(100, this.health + 20);
        
        // Being healed makes the morph happier
        this.happiness = Math.min(100, this.happiness + 15);
        
        // Record memory
        this.memories.push({
            type: 'healed',
            age: this.age
        });
        
        return {
            success: true,
            message: `${this.name} has been healed!`
        };
    }
    
    attack(power = 10) {
        // Take damage
        this.health = Math.max(0, this.health - power);
        
        // Being attacked makes the morph unhappy
        this.happiness = Math.max(0, this.happiness - 20);
        
        // Record trauma
        this.memories.push({
            type: 'attacked',
            damage: power,
            age: this.age
        });
        
        // Determine reaction based on personality
        let reaction = "";
        
        if (this.personalityType === 'shy') {
            reaction = `${this.name} cowers and tries to escape!`;
        } else if (this.personalityType === 'grumpy') {
            reaction = `${this.name} glows angrily!`;
        } else {
            reaction = `${this.name} trembles with fear!`;
        }
        
        return {
            success: true,
            healthRemaining: Math.floor(this.health),
            message: reaction
        };
    }
    
    playWith() {
        // Playing increases happiness and uses energy
        let funFactor = 20;
        let energyCost = 15;
        
        // Personality affects play response
        if (this.personalityType === 'playful') {
            funFactor = 30;
        } else if (this.personalityType === 'lazy') {
            funFactor = 10;
            energyCost = 25;
        } else if (this.personalityType === 'grumpy') {
            funFactor = 5;
        }
        
        // Low energy reduces enjoyment
        if (this.energy < 30) {
            funFactor /= 2;
        }
        
        this.happiness = Math.min(100, this.happiness + funFactor);
        this.energy = Math.max(0, this.energy - energyCost);
        
        // Playing increases hunger slightly
        this.hunger = Math.max(0, this.hunger - 5);
        
        // Record memory
        this.memories.push({
            type: 'played',
            enjoyment: funFactor,
            age: this.age
        });
        
        let message = "";
        if (this.energy < 10) {
            message = `${this.name} enjoys playing but is now very tired.`;
        } else if (funFactor > 15) {
            message = `${this.name} loves playing! It seems much happier.`;
        } else {
            message = `${this.name} plays a little bit.`;
        }
        
        return {
            success: true,
            message: message,
            energyLeft: Math.floor(this.energy)
        };
    }
    
    reproduce(partner) {
        // Check if reproduction is possible
        if (!this.canReproduce || !partner.canReproduce) {
            return {
                success: false,
                message: "Reproduction not possible at this time."
            };
        }
        
        // Create offspring
        const childPosition = new THREE.Vector3(
            (this.position.x + partner.position.x) / 2,
            (this.position.y + partner.position.y) / 2,
            (this.position.z + partner.position.z) / 2
        );
        
        // Mix parents' traits
        const childSize = (this.size + partner.size) / 2 * 0.6; // Children start smaller
        const childComplexity = Math.min(3, Math.ceil((this.complexity + partner.complexity) / 2));
        
        // Mix personalities with a chance of mutation
        const personalities = [this.personalityType, partner.personalityType];
        const childPersonality = Math.random() < 0.8 ? 
            personalities[Math.floor(Math.random() * 2)] : // Inherit from a parent
            null; // New random personality (mutation)
        
        // Create child
        const child = new Morph(childPosition, childSize, childComplexity, childPersonality);
        
        // Mix colors
        const childColor = new THREE.Color();
        childColor.r = (this.baseColor.r + partner.baseColor.r) / 2;
        childColor.g = (this.baseColor.g + partner.baseColor.g) / 2;
        childColor.b = (this.baseColor.b + partner.baseColor.b) / 2;
        child.baseColor = childColor;
        
        // Update parents
        this.offspringCount++;
        partner.offspringCount++;
        this.reproductionCooldown = 150;
        partner.reproductionCooldown = 150;
        
        // Parents lose energy and get hungry
        this.energy = Math.max(0, this.energy - 30);
        partner.energy = Math.max(0, partner.energy - 30);
        this.hunger = Math.max(0, this.hunger - 20);
        partner.hunger = Math.max(0, partner.hunger - 20);
        
        // Record the birth in memory
        this.memories.push({
            type: 'reproduction',
            partner: partner.name,
            childName: child.name,
            age: this.age
        });
        
        partner.memories.push({
            type: 'reproduction',
            partner: this.name,
            childName: child.name,
            age: partner.age
        });
        
        return {
            success: true,
            message: `${this.name} and ${partner.name} created ${child.name}!`,
            child: child
        };
    }
    
    useAbility(target) {
        // Check if the morph has enough energy to use ability
        if (this.energy < 30) {
            return {
                success: false,
                message: `${this.name} is too tired to use its ability.`
            };
        }
        
        // Use energy
        this.energy = Math.max(0, this.energy - 30);
        
        // Effect depends on the special ability
        let result = {
            success: true,
            message: `${this.name} uses its ${this.specialAbility} ability!`,
            effectType: this.specialAbility
        };
        
        switch(this.specialAbility) {
            case 'glow':
                // Enhance glow effect and potentially heal nearby morphs
                result.message += " It emits a bright, healing light!";
                // In a full implementation, this would heal nearby morphs
                break;
                
            case 'teleport':
                // Teleport to a new location
                this.position.set(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                );
                this.mesh.position.copy(this.position);
                result.message += " It teleports to a new location!";
                break;
                
            case 'heal':
                // Heal target if provided
                if (target && target.isSick) {
                    target.heal();
                    result.message += ` It heals ${target.name}!`;
                } else {
                    result.message += " But there's no one to heal nearby.";
                }
                break;
                
            case 'energize':
                // Give energy to target
                if (target) {
                    target.energy = Math.min(100, target.energy + 50);
                    result.message += ` It energizes ${target.name}!`;
                } else {
                    // Self-energize if no target
                    this.energy += 20;
                    result.message += " It energizes itself!";
                }
                break;
                
            case 'harmonize':
                // Make nearby morphs happier
                result.message += " Surrounding morphs feel happier!";
                // In a full implementation, this would affect nearby morphs
                break;
                
            default:
                result.message += " The effect is mysterious.";
        }
        
        // Record ability use
        this.memories.push({
            type: 'ability_used',
            ability: this.specialAbility,
            target: target ? target.name : null,
            age: this.age
        });
        
        return result;
    }

    merge(otherMorph) {
        // Create a new morph that's a combination of this and other
        const newPosition = new THREE.Vector3(
            (this.position.x + otherMorph.position.x) / 2,
            (this.position.y + otherMorph.position.y) / 2,
            (this.position.z + otherMorph.position.z) / 2
        );
        
        const newSize = (this.size + otherMorph.size) * 0.7;
        const newComplexity = Math.min(3, Math.ceil((this.complexity + otherMorph.complexity) / 2) + 1);
        
        // Create merged morph
        const newMorph = new Morph(newPosition, newSize, newComplexity);
        
        // Merge colors
        const mergedColor = new THREE.Color();
        mergedColor.r = (this.baseColor.r + otherMorph.baseColor.r) / 2;
        mergedColor.g = (this.baseColor.g + otherMorph.baseColor.g) / 2;
        mergedColor.b = (this.baseColor.b + otherMorph.baseColor.b) / 2;
        newMorph.baseColor = mergedColor;
        
        // Merge personality traits
        const personalities = [this.personalityType, otherMorph.personalityType];
        newMorph.personalityType = Math.random() < 0.7 ? 
            personalities[Math.floor(Math.random() * 2)] : // Inherit from a parent
            null; // New random personality
        
        // Transfer memories from both parents
        newMorph.memories = [
            ...this.memories.slice(-3),
            ...otherMorph.memories.slice(-3),
            {
                type: 'merger',
                parents: [this.name, otherMorph.name],
                age: 0
            }
        ];
        
        // Set essence as combination of both
        newMorph.essence = (this.essence + otherMorph.essence) / 2 + 0.1;
        
        // Advanced evolution
        newMorph.evolutionStage = Math.max(this.evolutionStage, otherMorph.evolutionStage);
        if (newMorph.evolutionStage < 3 && Math.random() < 0.3) {
            newMorph.evolutionStage++; // Chance of instant evolution
        }
        
        // Create fresh mesh for the new morph
        newMorph.createMesh();
        
        return newMorph;
    }

    dispose() {
        this.disposeMesh();
    }
    
    disposeMesh() {
        if (this.geometry) {
            this.geometry.dispose();
        }
        if (this.material) {
            this.material.dispose();
        }
        if (this.glowMesh && this.glowMesh.geometry) {
            this.glowMesh.geometry.dispose();
        }
        if (this.glowMesh && this.glowMesh.material) {
            this.glowMesh.material.dispose();
        }
    }
}