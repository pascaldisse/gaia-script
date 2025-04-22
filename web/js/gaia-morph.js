/**
 * GaiaScript-powered Morph class
 * This version of the Morph class uses the GaiaScript neural network
 * to enhance the behavior of morphs.
 */

import * as gaiaRuntime from './gaia-runtime.js';

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
        
        // Neural attributes from GaiaScript
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
        
        // Movement
        this.velocity = new THREE.Vector3();
        this.targetPosition = this.position.clone();
        this.speed = 0.01 + Math.random() * 0.03;
        this.changeDirectionTime = 0;
        
        // Personality traits
        this.personalityType = attributes.personality !== undefined ? 
            this.getPersonalityType(attributes.personality) : 
            this.generatePersonality();
        
        // Special abilities
        this.specialAbility = attributes.ability !== undefined ? 
            this.getSpecialAbility(attributes.ability) : 
            this.generateAbility();
        
        // Reproduction attributes
        this.canReproduce = Math.random() > 0.3;
        this.lastReproduced = 0;
        this.reproductionCooldown = 300; // time units
        this.essence = Math.floor(Math.random() * 5) + 1;
        
        // Create visual representation
        this.createMesh();
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
    
    // Update the morph's state
    update(time, deltaTime) {
        // Skip update if deleted
        if (!this.mesh) return false;
        
        // Update age
        this.age += deltaTime * 0.1;
        
        // Update vital stats
        this.updateVitalStats(deltaTime);
        
        // Update position
        this.updatePosition(time, deltaTime);
        
        // Update appearance
        this.updateAppearance(time);
        
        // Update effects
        this.updateEffects(deltaTime);
        
        // Check if morph is dead
        if (this.health <= 0 || this.age > 200) {
            return false; // Dead
        }
        
        return true; // Still alive
    }
    
    // Update vital stats like hunger, happiness, etc.
    updateVitalStats(deltaTime) {
        // Decrease stats
        const baseDecay = this.decayRate * deltaTime;
        
        if (!this.isSleeping) {
            this.hunger = Math.max(0, this.hunger - baseDecay * 1.2);
            this.happiness = Math.max(0, this.happiness - baseDecay);
            this.energy = Math.max(0, this.energy - baseDecay * 0.8);
        } else {
            // Sleeping restores energy but hunger decreases faster
            this.energy = Math.min(100, this.energy + baseDecay * 2);
            this.hunger = Math.max(0, this.hunger - baseDecay * 0.5);
        }
        
        // Health consequences
        if (this.hunger < 20 || this.happiness < 20) {
            this.health = Math.max(0, this.health - baseDecay * 1.5);
        }
        
        // Random chance of getting sick
        if (Math.random() < 0.0001 * deltaTime) {
            this.isSick = true;
        }
        
        // Sickness effects
        if (this.isSick) {
            this.health = Math.max(0, this.health - baseDecay * 3);
            this.energy = Math.max(0, this.energy - baseDecay * 2);
            this.happiness = Math.max(0, this.happiness - baseDecay * 2);
        }
        
        // Toggle sleep state
        if (this.energy < 10 && !this.isSleeping) {
            this.isSleeping = true;
        } else if (this.energy > 90 && this.isSleeping) {
            this.isSleeping = false;
        }
        
        // Calculate derived states
        this.isHungry = this.hunger < 30;
        this.isHappy = this.happiness > 70;
    }
    
    // Update position and movement
    updatePosition(time, deltaTime) {
        // No movement if sleeping
        if (this.isSleeping) return;
        
        // Occasionally change direction
        if (time > this.changeDirectionTime) {
            const range = 20;
            this.targetPosition = new THREE.Vector3(
                (Math.random() - 0.5) * range,
                (Math.random() - 0.5) * range / 2,
                (Math.random() - 0.5) * range
            );
            this.changeDirectionTime = time + 5000 + Math.random() * 10000;
        }
        
        // Calculate direction to target
        const direction = new THREE.Vector3().subVectors(this.targetPosition, this.position);
        
        // Only move if far enough from target
        if (direction.length() > 0.5) {
            direction.normalize();
            
            // Apply personality modifiers to movement
            let speedModifier = 1;
            switch(this.personalityType) {
                case 'Curious': speedModifier = 1.2; break;
                case 'Shy': speedModifier = 0.7; break;
                case 'Aggressive': speedModifier = 1.5; break;
                case 'Playful': speedModifier = 1.3; break;
                case 'Friendly': speedModifier = 1.0; break;
            }
            
            // Apply effects to movement
            this.effects.forEach(effect => {
                if (effect.type === 'speed_boost') {
                    speedModifier *= 1.5;
                }
            });
            
            // Move towards target
            const moveSpeed = this.speed * speedModifier * deltaTime;
            this.velocity.copy(direction).multiplyScalar(moveSpeed);
            this.position.add(this.velocity);
            
            // Update mesh position
            this.mesh.position.copy(this.position);
        }
    }
    
    // Update visual appearance
    updateAppearance(time) {
        // Pulse animation
        const pulseAmount = 0.05 * Math.sin(time * 0.001 + this.pulsePhase);
        this.mesh.scale.set(
            this.originalScale * (1 + pulseAmount),
            this.originalScale * (1 + pulseAmount),
            this.originalScale * (1 + pulseAmount)
        );
        
        // Different appearance based on stats
        if (this.isSick) {
            // Sickly color
            this.mesh.material.emissive.setRGB(0.2, 0.1, 0.2);
            this.mesh.material.opacity = 0.7;
        } else if (this.isSleeping) {
            // Sleeping appearance
            this.mesh.material.emissive.setRGB(0.1, 0.1, 0.3);
            this.mesh.material.opacity = 0.6;
        } else if (this.isHungry) {
            // Hungry appearance
            this.mesh.material.emissive.setRGB(0.3, 0.2, 0.1);
            this.mesh.material.opacity = 0.8;
        } else if (this.isHappy) {
            // Happy glowing appearance
            this.mesh.material.emissive.copy(this.color).multiplyScalar(0.5);
            this.mesh.material.opacity = 1.0;
        } else {
            // Default appearance
            this.mesh.material.emissive.copy(this.color).multiplyScalar(0.3);
            this.mesh.material.opacity = 0.9;
        }
        
        // Rotation animation
        if (!this.isSleeping) {
            this.mesh.rotation.x += 0.005 * Math.sin(time * 0.001);
            this.mesh.rotation.y += 0.01;
            this.mesh.rotation.z += 0.003 * Math.cos(time * 0.001);
        }
    }
    
    // Update temporary effects
    updateEffects(deltaTime) {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.duration -= deltaTime;
            if (effect.duration <= 0) {
                this.effects.splice(i, 1);
            }
        }
    }
    
    // Feed the morph
    feed() {
        if (this.isSleeping) {
            return {
                success: false,
                message: `${this.name} is sleeping. It doesn't notice the food.`
            };
        }
        
        if (this.hunger >= 90) {
            return {
                success: false,
                message: `${this.name} is already full!`
            };
        }
        
        // Increase hunger
        this.hunger = Math.min(100, this.hunger + 30);
        
        // Slight happiness boost
        this.happiness = Math.min(100, this.happiness + 5);
        
        return {
            success: true,
            message: `${this.name} eats happily. Hunger restored.`
        };
    }
    
    // Pet the morph
    pet() {
        if (this.isSleeping) {
            this.isSleeping = false;
            return {
                success: true,
                message: `${this.name} wakes up as you pet it.`,
                happiness: this.happiness
            };
        }
        
        // Personality affects how much they like being pet
        let happinessGain = 20;
        
        switch (this.personalityType) {
            case 'Friendly':
                happinessGain = 30;
                break;
            case 'Shy':
                happinessGain = 10;
                break;
            case 'Aggressive':
                happinessGain = 5;
                break;
            case 'Playful':
                happinessGain = 15;
                break;
        }
        
        // Increase happiness
        this.happiness = Math.min(100, this.happiness + happinessGain);
        
        return {
            success: true,
            message: `${this.name} ${this.happiness > 80 ? 'purrs contentedly' : 'seems to enjoy your attention'}.`,
            happiness: this.happiness
        };
    }
    
    // Play with the morph
    playWith() {
        if (this.isSleeping) {
            this.isSleeping = false;
            return {
                success: true,
                message: `${this.name} wakes up, ready to play!`
            };
        }
        
        if (this.energy < 20) {
            return {
                success: false,
                message: `${this.name} is too tired to play right now.`
            };
        }
        
        // Personality affects how much they enjoy playing
        let happinessGain = 15;
        let energyLoss = 10;
        
        switch (this.personalityType) {
            case 'Playful':
                happinessGain = 30;
                energyLoss = 5;
                break;
            case 'Shy':
                happinessGain = 5;
                energyLoss = 15;
                break;
            case 'Aggressive':
                happinessGain = 20;
                energyLoss = 8;
                break;
            case 'Curious':
                happinessGain = 25;
                energyLoss = 12;
                break;
        }
        
        // Increase happiness, decrease energy
        this.happiness = Math.min(100, this.happiness + happinessGain);
        this.energy = Math.max(0, this.energy - energyLoss);
        
        // Increase hunger from activity
        this.hunger = Math.max(0, this.hunger - 5);
        
        return {
            success: true,
            message: `${this.name} ${this.isHappy ? 'plays excitedly' : 'plays cautiously'} with you.`
        };
    }
    
    // Speak to the morph
    speak() {
        // Determine current mood
        let mood;
        let response;
        
        if (this.isSick) {
            mood = 'sick';
            response = `${this.name} makes a weak sound. It needs healing.`;
        } else if (this.isSleeping) {
            mood = 'sleeping';
            response = `${this.name} is sleeping peacefully. It doesn't respond.`;
        } else if (this.hunger < 20) {
            mood = 'starving';
            response = `${this.name} makes a hungry noise. It needs food.`;
        } else if (this.happiness < 30) {
            mood = 'sad';
            response = `${this.name} seems sad and lonely. It needs attention.`;
        } else if (this.happiness < 50) {
            mood = 'neutral';
            response = `${this.name} responds with a neutral tone.`;
        } else if (this.happiness < 80) {
            mood = 'happy';
            response = `${this.name} responds cheerfully.`;
        } else {
            mood = 'ecstatic';
            response = `${this.name} bubbles with joy and makes happy sounds!`;
        }
        
        // Add personality-specific response
        switch (this.personalityType) {
            case 'Curious':
                response += ` It seems interested in learning more.`;
                break;
            case 'Playful':
                response += ` It bounces around playfully.`;
                break;
            case 'Shy':
                response += ` It seems a bit hesitant to respond fully.`;
                break;
            case 'Aggressive':
                response += ` It responds with an assertive tone.`;
                break;
            case 'Friendly':
                response += ` It seems to genuinely enjoy your company.`;
                break;
        }
        
        // Small happiness boost from attention
        if (!this.isSleeping) {
            this.happiness = Math.min(100, this.happiness + 5);
        }
        
        return {
            success: true,
            message: response,
            mood: mood
        };
    }
    
    // Heal the morph
    heal() {
        if (!this.isSick && this.health > 80) {
            return {
                success: false,
                message: `${this.name} is already healthy.`
            };
        }
        
        // Cure sickness
        this.isSick = false;
        
        // Restore health
        this.health = Math.min(100, this.health + 40);
        
        // Small energy boost
        this.energy = Math.min(100, this.energy + 10);
        
        return {
            success: true,
            message: `${this.name} has been healed! Its health is improving.`
        };
    }
    
    // Use the morph's special ability
    useAbility() {
        if (this.energy < 30) {
            return {
                success: false,
                message: `${this.name} is too tired to use its ${this.specialAbility} ability.`
            };
        }
        
        // Energy cost
        this.energy = Math.max(0, this.energy - 30);
        
        // Effect based on ability type
        let effectType = '';
        let message = '';
        
        switch (this.specialAbility) {
            case 'Glow':
                effectType = 'glow';
                message = `${this.name} emits a bright, pulsating glow that illuminates the surroundings!`;
                break;
            case 'Teleport':
                effectType = 'teleport';
                // Random teleport
                this.position.set(
                    (Math.random() - 0.5) * 30,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 30
                );
                this.mesh.position.copy(this.position);
                message = `${this.name} teleports to a new location in a flash of light!`;
                break;
            case 'Energize':
                effectType = 'energize';
                message = `${this.name} radiates energy, revitalizing itself and those around it!`;
                // Self-energize
                this.energy = Math.min(100, this.energy + 20);
                break;
            case 'Harmonize':
                effectType = 'harmonize';
                message = `${this.name} creates a harmonic resonance that soothes all nearby morphs!`;
                break;
            case 'Camouflage':
                effectType = 'camouflage';
                message = `${this.name} blends with its surroundings, becoming almost invisible!`;
                // Visual effect
                this.mesh.material.opacity = 0.3;
                // Add temporary effect
                this.effects.push({
                    type: 'camouflage',
                    duration: 100
                });
                break;
        }
        
        return {
            success: true,
            message: message,
            effectType: effectType
        };
    }
    
    // Evolve to the next stage
    evolve() {
        if (this.evolutionStage >= 3) {
            return {
                success: false,
                message: `${this.name} has already reached its final form.`
            };
        }
        
        // Increment evolution stage
        this.evolutionStage++;
        
        // Recreate mesh with new appearance
        const oldPosition = this.position.clone();
        const scene = this.mesh.parent;
        
        if (scene) {
            scene.remove(this.mesh);
        }
        
        this.createMesh();
        this.position.copy(oldPosition);
        this.mesh.position.copy(oldPosition);
        
        if (scene) {
            scene.add(this.mesh);
        }
        
        // Evolution buffs
        this.health = 100;
        this.energy = 100;
        this.happiness = 100;
        this.essence += 2;
        
        // Chance to gain a new ability
        if (Math.random() < 0.3) {
            const abilities = ['Glow', 'Teleport', 'Energize', 'Harmonize', 'Camouflage'];
            const newAbilityIndex = Math.floor(Math.random() * abilities.length);
            if (abilities[newAbilityIndex] !== this.specialAbility) {
                this.specialAbility = abilities[newAbilityIndex];
            }
        }
        
        return {
            success: true,
            message: `${this.name} has evolved to stage ${this.evolutionStage}!`,
            stage: this.evolutionStage
        };
    }
    
    // Attack the morph
    attack(damage) {
        const actualDamage = Math.min(this.health, damage);
        this.health -= actualDamage;
        
        // Apply mood effect
        this.happiness = Math.max(0, this.happiness - 30);
        
        let reactionMessage = '';
        
        // Reaction based on personality
        switch (this.personalityType) {
            case 'Aggressive':
                reactionMessage = `${this.name} growls and attempts to fight back!`;
                break;
            case 'Shy':
                reactionMessage = `${this.name} cowers and tries to hide!`;
                break;
            case 'Friendly':
                reactionMessage = `${this.name} looks hurt and confused by your attack!`;
                break;
            case 'Playful':
                reactionMessage = `${this.name} tries to dodge but gets hit!`;
                break;
            case 'Curious':
                reactionMessage = `${this.name} seems puzzled by your aggression!`;
                break;
        }
        
        return {
            message: reactionMessage,
            damage: actualDamage,
            healthRemaining: this.health
        };
    }
    
    // Reproduce with another morph
    reproduce(otherMorph) {
        // Check if reproduction is possible
        if (!this.canReproduce || !otherMorph.canReproduce) {
            return {
                success: false,
                message: "One or both morphs cannot reproduce right now."
            };
        }
        
        // Check cooldown
        const currentTime = Date.now();
        if (currentTime - this.lastReproduced < this.reproductionCooldown || 
            currentTime - otherMorph.lastReproduced < otherMorph.reproductionCooldown) {
            return {
                success: false,
                message: "The morphs need more time to rest before reproducing."
            };
        }
        
        // Create child position
        const childPosition = new THREE.Vector3().addVectors(this.position, otherMorph.position).multiplyScalar(0.5);
        
        // Mix attributes using GaiaScript-style blending
        // We could enhance this with actual neural network computation
        const childAttributes = {
            size: (this.size + otherMorph.size) * 0.5 * (0.9 + Math.random() * 0.2),
            color: new THREE.Color(
                (this.color.r + otherMorph.color.r) * 0.5,
                (this.color.g + otherMorph.color.g) * 0.5,
                (this.color.b + otherMorph.color.b) * 0.5
            ),
            personality: Math.floor(Math.random() * 5),
            ability: Math.floor(Math.random() * 5),
            evolution: Math.min(this.evolutionStage, otherMorph.evolutionStage)
        };
        
        // Create child morph
        const childMorph = new GaiaMorph(childPosition, childAttributes);
        
        // Update parent stats
        this.energy = Math.max(0, this.energy - 30);
        otherMorph.energy = Math.max(0, otherMorph.energy - 30);
        this.lastReproduced = currentTime;
        otherMorph.lastReproduced = currentTime;
        
        return {
            success: true,
            message: `${this.name} and ${otherMorph.name} have created a new morph named ${childMorph.name}!`,
            child: childMorph
        };
    }
    
    // Merge with another morph (advanced reproduction)
    merge(otherMorph) {
        // Calculate merged position
        const mergedPosition = new THREE.Vector3().addVectors(this.position, otherMorph.position).multiplyScalar(0.5);
        
        // Combine colors with a slight variation
        const mergedColor = new THREE.Color(
            (this.color.r + otherMorph.color.r) * 0.5,
            (this.color.g + otherMorph.color.g) * 0.5,
            (this.color.b + otherMorph.color.b) * 0.5
        );
        
        // Add slight random variation
        mergedColor.r += (Math.random() - 0.5) * 0.2;
        mergedColor.g += (Math.random() - 0.5) * 0.2;
        mergedColor.b += (Math.random() - 0.5) * 0.2;
        
        // Clamp values
        mergedColor.r = Math.max(0, Math.min(1, mergedColor.r));
        mergedColor.g = Math.max(0, Math.min(1, mergedColor.g));
        mergedColor.b = Math.max(0, Math.min(1, mergedColor.b));
        
        // Calculate maximum evolution stage
        const mergedEvolution = Math.max(this.evolutionStage, otherMorph.evolutionStage);
        
        // Calculate merged attributes
        const mergedAttributes = {
            size: Math.max(this.size, otherMorph.size) * 1.2,
            color: mergedColor,
            personality: Math.floor(Math.random() * 5),
            ability: Math.floor(Math.random() * 5),
            evolution: mergedEvolution
        };
        
        // Create merged morph
        const mergedMorph = new GaiaMorph(mergedPosition, mergedAttributes);
        mergedMorph.health = 100;
        mergedMorph.energy = 100;
        mergedMorph.happiness = 100;
        mergedMorph.essence = this.essence + otherMorph.essence;
        
        return mergedMorph;
    }
    
    // Clean up resources
    dispose() {
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
            this.mesh = null;
        }
    }
}

export default GaiaMorph;