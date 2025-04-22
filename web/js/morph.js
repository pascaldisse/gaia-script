/**
 * Morph class - represents the evolving entities in the game
 */
class Morph {
    constructor(position, size, complexity) {
        this.position = position || new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        this.size = size || Math.random() * 1.5 + 0.5;
        this.complexity = complexity || Math.floor(Math.random() * 3) + 1;
        this.color = new THREE.Color(
            0.5 + Math.random() * 0.5,
            0.5 + Math.random() * 0.5,
            0.5 + Math.random() * 0.5
        );
        this.phase = Math.random() * Math.PI * 2;
        this.speed = 0.005 + Math.random() * 0.01;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.geometry = null;
        this.material = null;
        this.mesh = null;
        this.lifespan = 100 + Math.random() * 200;
        this.age = 0;
        this.essence = Math.random();

        this.createMesh();
    }

    createMesh() {
        // Create different geometries based on complexity
        switch(this.complexity) {
            case 1:
                this.geometry = new THREE.IcosahedronGeometry(this.size, 1);
                break;
            case 2:
                this.geometry = new THREE.TorusKnotGeometry(
                    this.size, this.size * 0.3, 64, 8, 2, 3
                );
                break;
            case 3:
                this.geometry = new THREE.OctahedronGeometry(this.size, 2);
                break;
            default:
                this.geometry = new THREE.SphereGeometry(this.size, 16, 16);
        }

        // Create material with unique properties
        this.material = new THREE.MeshPhongMaterial({
            color: this.color,
            emissive: new THREE.Color(this.color.r * 0.2, this.color.g * 0.2, this.color.b * 0.2),
            shininess: 50,
            transparent: true,
            opacity: 0.8,
            wireframe: this.complexity === 3
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(this.position);
        this.mesh.userData.morph = this;
    }

    update(time) {
        if (!this.mesh) return;
        
        // Age the morph
        this.age++;
        
        // Movement pattern based on sine waves
        this.position.x += Math.sin(time * this.speed + this.phase) * 0.01;
        this.position.y += Math.cos(time * this.speed + this.phase * 2) * 0.01;
        this.position.z += Math.sin(time * this.speed + this.phase * 3) * 0.01;
        
        this.mesh.position.copy(this.position);
        
        // Rotation
        this.mesh.rotation.x += this.rotationSpeed;
        this.mesh.rotation.y += this.rotationSpeed * 1.5;
        
        // Pulsing effect
        const scale = 1 + Math.sin(time * 0.001 + this.phase) * 0.1;
        this.mesh.scale.set(scale, scale, scale);
        
        // Color shifting
        const hue = (time * 0.0001 + this.phase) % 1;
        this.material.color.setHSL(hue, 0.7, 0.5);
        this.material.emissive.setHSL(hue, 0.7, 0.2);
        
        // Decrease opacity as morph ages
        if (this.age > this.lifespan * 0.7) {
            const opacityFactor = 1 - ((this.age - (this.lifespan * 0.7)) / (this.lifespan * 0.3));
            this.material.opacity = 0.8 * Math.max(0, opacityFactor);
        }
        
        return this.age < this.lifespan;
    }

    merge(otherMorph) {
        // Create a new morph that's a combination of this and other
        const newPosition = new THREE.Vector3(
            (this.position.x + otherMorph.position.x) / 2,
            (this.position.y + otherMorph.position.y) / 2,
            (this.position.z + otherMorph.position.z) / 2
        );
        
        const newSize = (this.size + otherMorph.size) * 0.6; // Slightly smaller than the sum
        const newComplexity = Math.min(3, Math.ceil((this.complexity + otherMorph.complexity) / 2) + 1);
        
        const newMorph = new Morph(newPosition, newSize, newComplexity);
        newMorph.essence = (this.essence + otherMorph.essence) / 2;
        
        return newMorph;
    }

    dispose() {
        if (this.geometry) {
            this.geometry.dispose();
        }
        if (this.material) {
            this.material.dispose();
        }
    }
}