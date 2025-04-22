/**
 * World class - manages the environment and landscape
 */
class World {
    constructor(scene) {
        this.scene = scene;
        this.terrainMesh = null;
        this.noiseScale = 0.1;
        this.morphingSpeed = 0.0005;
        this.lastUpdateTime = 0;
        this.updateInterval = 100; // milliseconds
        this.terrainSize = 40;
        this.terrainResolution = 64;
        this.soundNodes = [];
        
        this.initTerrain();
        this.addLighting();
    }
    
    initTerrain() {
        // Create terrain geometry
        const geometry = new THREE.PlaneGeometry(
            this.terrainSize, this.terrainSize, 
            this.terrainResolution, this.terrainResolution
        );
        
        // Create material with custom shader for trippy LCD-inspired look
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                colorA: { value: new THREE.Color(0x050520) },
                colorB: { value: new THREE.Color(0x503080) },
                colorC: { value: new THREE.Color(0x50e3c2) },
                colorD: { value: new THREE.Color(0xff00ff) },
                colorE: { value: new THREE.Color(0x00ffff) },
                gridSize: { value: 40.0 },
                distortion: { value: 0.8 }
            },
            vertexShader: `
                uniform float time;
                uniform float distortion;
                
                varying vec2 vUv;
                varying float vElevation;
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                // Simplex noise functions
                vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
                
                float snoise(vec2 v) {
                    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
                    vec2 i  = floor(v + dot(v, C.yy));
                    vec2 x0 = v -   i + dot(i, C.xx);
                    vec2 i1;
                    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                    vec4 x12 = x0.xyxy + C.xxzz;
                    x12.xy -= i1;
                    i = mod(i, 289.0);
                    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                        + i.x + vec3(0.0, i1.x, 1.0 ));
                    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                        dot(x12.zw,x12.zw)), 0.0);
                    m = m*m;
                    m = m*m;
                    vec3 x = 2.0 * fract(p * C.www) - 1.0;
                    vec3 h = abs(x) - 0.5;
                    vec3 ox = floor(x + 0.5);
                    vec3 a0 = x - ox;
                    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                    vec3 g;
                    g.x  = a0.x  * x0.x  + h.x  * x0.y;
                    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                    return 130.0 * dot(m, g);
                }
                
                // Rotate point around axis
                vec3 rotate(vec3 p, vec3 axis, float angle) {
                    float s = sin(angle);
                    float c = cos(angle);
                    float oc = 1.0 - c;
                    
                    mat3 rotMatrix = mat3(
                        oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s,
                        oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s,
                        oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c
                    );
                    
                    return rotMatrix * p;
                }
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    vNormal = normal;
                    
                    // Multiple octaves of noise for more interesting terrain
                    float elevation = 0.0;
                    float frequency = 1.0;
                    float amplitude = 1.0;
                    float maxValue = 0.0;
                    
                    // Add 3D wavelike distortion to UV coordinates
                    vec2 distortedUv = vUv;
                    distortedUv.x += sin(vUv.y * 10.0 + time * 0.3) * 0.1 * distortion;
                    distortedUv.y += cos(vUv.x * 8.0 + time * 0.2) * 0.1 * distortion;
                    
                    for(int i = 0; i < 5; i++) {
                        // Animate each octave differently with more extreme motion
                        float noiseValue = snoise(distortedUv * frequency + vec2(time * 0.15 * float(i), time * 0.1 * sin(time * 0.05)));
                        
                        // Add some chaos at higher frequencies
                        if (i > 2) {
                            noiseValue *= sin(time * 0.2 + vUv.x * 5.0) * 0.5 + 0.5;
                        }
                        
                        elevation += noiseValue * amplitude;
                        maxValue += amplitude;
                        amplitude *= 0.65;
                        frequency *= 2.2;
                    }
                    
                    elevation /= maxValue; // Normalize
                    
                    // More extreme terrain shaping for trippy effect
                    elevation = pow(abs(elevation), 0.7) * sign(elevation) * 6.0;
                    elevation += sin(vUv.x * 20.0 + time) * cos(vUv.y * 20.0 + time * 0.7) * 0.5 * distortion;
                    
                    vElevation = elevation;
                    
                    // Create new position with dynamic waves
                    vec3 newPosition = position;
                    newPosition.z = elevation;
                    
                    // Add subtle wobble to entire mesh
                    float wobble = sin(time * 0.2) * 0.05;
                    newPosition = rotate(newPosition, vec3(0.0, 0.0, 1.0), wobble);
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 colorA;
                uniform vec3 colorB;
                uniform vec3 colorC;
                uniform vec3 colorD;
                uniform vec3 colorE;
                uniform float gridSize;
                
                varying vec2 vUv;
                varying float vElevation;
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                // GLSL utils
                float map(float value, float min1, float max1, float min2, float max2) {
                    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
                }
                
                // LCD pixel effect
                float lcdPixel(vec2 p) {
                    vec2 grid = fract(p * gridSize);
                    return smoothstep(0.1, 0.2, grid.x) * smoothstep(0.1, 0.2, grid.y) *
                           smoothstep(grid.x, 0.9, grid.x) * smoothstep(grid.y, 0.9, grid.y);
                }
                
                void main() {
                    // Color based on elevation with more extreme color shifts
                    float colorMix = (vElevation + 6.0) / 12.0;
                    colorMix = pow(colorMix, 1.5); // Make color transitions more extreme
                    
                    // Oscillate between multiple colors based on time and position
                    float timeFactor = sin(time * 0.3) * 0.5 + 0.5;
                    vec3 baseColorA = mix(colorA, colorD, timeFactor);
                    vec3 baseColorB = mix(colorB, colorE, 1.0-timeFactor);
                    
                    vec3 color = mix(baseColorA, baseColorB, colorMix);
                    
                    // Add highlights to peaks with more intensity
                    if (vElevation > 3.0) {
                        float peakMix = pow((vElevation - 3.0) / 3.0, 1.2);
                        color = mix(color, colorC, peakMix);
                        
                        // Add glowing effect to peaks
                        float glow = sin(time * 3.0 + vUv.x * 10.0) * 0.5 + 0.5;
                        color += colorE * 0.3 * glow * peakMix;
                    }
                    
                    // Add trippy wave patterns
                    float waves = sin((vUv.x * 20.0 + time) * 2.0) * sin((vUv.y * 15.0 - time * 0.7) * 2.0) * 0.5 + 0.5;
                    color = mix(color, colorD, waves * 0.15);
                    
                    // Add LCD-like screen effect
                    float lcd = lcdPixel(vUv);
                    color *= 0.8 + lcd * 0.4;
                    
                    // Add scan lines effect
                    float scanline = sin(vUv.y * 100.0 + time * 5.0) * 0.5 + 0.5;
                    color *= 0.8 + scanline * 0.2;
                    
                    // Add RGB split effect (chromatic aberration)
                    float rgbSplit = sin(time * 0.2) * 0.01;
                    float r = sin(vUv.x * 10.0 + time + rgbSplit) * 0.5 + 0.5;
                    float g = sin(vUv.y * 10.0 + time) * 0.5 + 0.5;
                    float b = sin((vUv.x + vUv.y) * 10.0 + time - rgbSplit) * 0.5 + 0.5;
                    
                    color.r *= 1.0 + r * 0.2;
                    color.g *= 1.0 + g * 0.2;
                    color.b *= 1.0 + b * 0.2;
                    
                    // Add edge highlight for LCD screen look
                    float edge = 1.0 - max(abs(vUv.x - 0.5) * 2.0, abs(vUv.y - 0.5) * 2.0);
                    edge = pow(edge, 3.0);
                    color = mix(color, vec3(0.9, 1.0, 1.0), edge * 0.1);
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.DoubleSide
        });
        
        this.terrainMesh = new THREE.Mesh(geometry, material);
        this.terrainMesh.rotation.x = -Math.PI / 2;
        this.terrainMesh.position.y = -8;
        this.terrainMesh.receiveShadow = true;
        
        this.scene.add(this.terrainMesh);
    }
    
    addLighting() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
        this.scene.add(ambientLight);
        
        // Add directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(10, 20, 10);
        mainLight.castShadow = true;
        this.scene.add(mainLight);
        
        // Add some point lights for atmosphere
        const colors = [0x50e3c2, 0x9050e3, 0xe35050];
        
        for (let i = 0; i < 3; i++) {
            const pointLight = new THREE.PointLight(colors[i], 1, 15);
            pointLight.position.set(
                (Math.random() - 0.5) * 20,
                Math.random() * 10,
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
    }
    
    update(time) {
        // Update terrain shader time uniform
        if (this.terrainMesh && this.terrainMesh.material.uniforms) {
            this.terrainMesh.material.uniforms.time.value = time * 0.001;
        }
        
        // Update sound nodes
        this.soundNodes.forEach(node => {
            // Pulse effect
            const scale = 1 + Math.sin(time * 0.002 + node.phase) * 0.2;
            node.scale.set(scale, scale, scale);
            
            // Color cycling
            const hue = (time * 0.0001 + node.phase) % 1;
            if (node.material.color) {
                node.material.color.setHSL(hue, 0.8, 0.6);
                node.material.emissive.setHSL(hue, 0.8, 0.3);
            }
        });
    }
    
    createSoundNode(position) {
        // Create a visual representation of a sound node
        const geometry = new THREE.TorusGeometry(1, 0.3, 16, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x50e3c2,
            emissive: 0x50e3c2,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8,
            shininess: 70
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.phase = Math.random() * Math.PI * 2;
        this.scene.add(mesh);
        
        this.soundNodes.push(mesh);
        return mesh;
    }
    
    dispose() {
        if (this.terrainMesh) {
            this.scene.remove(this.terrainMesh);
            this.terrainMesh.geometry.dispose();
            this.terrainMesh.material.dispose();
        }
        
        // Dispose all sound nodes
        this.soundNodes.forEach(node => {
            this.scene.remove(node);
            node.geometry.dispose();
            node.material.dispose();
        });
        this.soundNodes = [];
    }
}