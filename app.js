/* ===== THREE.JS WEBGL BACKGROUND ===== */
const initWebGL = () => {
    const canvas = document.getElementById('webgl-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Particle system - golden strings vibrating
    const particleCount = 2500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const color1 = new THREE.Color(0xd4a843); // Gold
    const color2 = new THREE.Color(0x8b6914); // Dark gold
    const color3 = new THREE.Color(0x3d2e0a); // Very dark gold
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 10;
        
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
        
        const mixedColor = new THREE.Color();
        const rand = Math.random();
        if (rand > 0.7) {
            mixedColor.copy(color1);
        } else if (rand > 0.4) {
            mixedColor.copy(color2);
        } else {
            mixedColor.copy(color3);
        }
        
        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
        
        sizes[i] = Math.random() * 2 + 0.5;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const vertexShader = `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uTime;
        uniform vec2 uMouse;
        
        void main() {
            vColor = color;
            vec3 pos = position;
            
            // Wave motion like guitar strings
            float wave1 = sin(pos.x * 2.0 + uTime * 0.8) * 0.3;
            float wave2 = sin(pos.y * 1.5 + uTime * 0.5) * 0.2;
            float wave3 = sin((pos.x + pos.y) * 1.0 + uTime * 0.3) * 0.15;
            
            pos.z += wave1 + wave2 + wave3;
            
            // Mouse interaction - gentle repulsion
            float dist = distance(pos.xy, uMouse * 8.0);
            float influence = smoothstep(3.0, 0.0, dist);
            pos.z += influence * 0.5;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `;
    
    const fragmentShader = `
        varying vec3 vColor;
        uniform float uTime;
        
        void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            
            float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
            alpha *= 0.6 + 0.4 * sin(uTime + vColor.r * 10.0);
            
            gl_FragColor = vec4(vColor, alpha * 0.8);
        }
    `;
    
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) }
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    camera.position.z = 6;
    
    // Mouse tracking
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Animation loop
    const clock = new THREE.Clock();
    
    const animate = () => {
        requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();
        material.uniforms.uTime.value = elapsedTime;
        
        // Smooth mouse follow
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        material.uniforms.uMouse.value.set(mouseX, mouseY);
        
        // Gentle camera movement
        camera.position.x = Math.sin(elapsedTime * 0.1) * 0.3;
        camera.position.y = Math.cos(elapsedTime * 0.08) * 0.2;
        camera.lookAt(0, 0, 0);
        
        renderer.render(scene, camera);
    };
    
    animate();
};

/* ===== GSAP ANIMATIONS ===== */
const initAnimations = () => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Hero entrance
    const heroTl = gsap.timeline({ delay: 0.3 });
    
    heroTl
        .to('.hero-label', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        })
        .to('.hero-title .line', {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out'
        }, '-=0.4')
        .to('.hero-subtitle', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.6')
        .to('.hero-cta', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.5');
    
    // Section headers
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power3.out'
        });
    });
    
    // Tool cards
    gsap.utils.toArray('.tool-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power3.out'
        });
    });
    
    // Timeline items
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            x: -30,
            duration: 0.8,
            delay: i * 0.15,
            ease: 'power3.out'
        });
    });
    
    // Chord cards
    gsap.utils.toArray('.chord-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 30,
            scale: 0.95,
            duration: 0.6,
            delay: i * 0.08,
            ease: 'power3.out'
        });
    });
    
    // Routine cards
    gsap.utils.toArray('.routine-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            delay: i * 0.12,
            ease: 'power3.out'
        });
    });
    
    // Resource cards
    gsap.utils.toArray('.resource-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            delay: i * 0.08,
            ease: 'power3.out'
        });
    });
    
    // Quick start section
    const quickStart = document.querySelector('.quick-start');
    if (quickStart) {
        gsap.from(quickStart, {
            scrollTrigger: {
                trigger: quickStart,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power3.out'
        });
    }
};

/* ===== NAVIGATION SCROLL EFFECT ===== */
const initNav = () => {
    const nav = document.querySelector('.nav');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        if (currentScroll > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
};

/* ===== MOBILE NAV ===== */
const initMobileNav = () => {
    const toggle = document.querySelector('.nav-toggle');
    const mobileMenu = document.querySelector('.nav-mobile');
    const mobileLinks = document.querySelectorAll('.nav-mobile a');
    
    if (!toggle || !mobileMenu) return;
    
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
};

/* ===== CHORD DIAGRAMS ===== */
const chordData = {
    C: { name: 'Do Mayor', fingers: [[1, 0], [2, 1], [3, 0], [4, 2], [5, 3], [0, null]], barre: null },
    G: { name: 'Sol Mayor', fingers: [[0, 3], [1, 2], [2, 0], [3, 0], [4, 0], [5, 3]], barre: null },
    D: { name: 'Re Mayor', fingers: [[0, null], [1, null], [2, 0], [3, 2], [4, 3], [5, 2]], barre: null },
    Em: { name: 'Mi Menor', fingers: [[0, 0], [1, 2], [2, 2], [3, 0], [4, 0], [5, 0]], barre: null },
    Am: { name: 'La Menor', fingers: [[0, null], [1, 0], [2, 2], [3, 2], [4, 1], [5, 0]], barre: null }
};

const drawChordDiagram = (container, chordName) => {
    const chord = chordData[chordName];
    if (!chord) return;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 120');
    svg.style.width = '100%';
    svg.style.height = '100%';
    
    const stringCount = 6;
    const fretCount = 4;
    const marginX = 15;
    const marginY = 20;
    const stringSpacing = (100 - marginX * 2) / (stringCount - 1);
    const fretSpacing = (100 - marginY * 2) / fretCount;
    
    // Draw strings
    for (let i = 0; i < stringCount; i++) {
        const x = marginX + i * stringSpacing;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', marginY);
        line.setAttribute('x2', x);
        line.setAttribute('y2', marginY + fretCount * fretSpacing);
        line.setAttribute('stroke', '#6b655c');
        line.setAttribute('stroke-width', i < 2 ? 1.5 : 1);
        svg.appendChild(line);
    }
    
    // Draw frets
    for (let i = 0; i <= fretCount; i++) {
        const y = marginY + i * fretSpacing;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', marginX);
        line.setAttribute('y1', y);
        line.setAttribute('x2', marginX + (stringCount - 1) * stringSpacing);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#6b655c');
        line.setAttribute('stroke-width', i === 0 ? 3 : 1);
        svg.appendChild(line);
    }
    
    // Draw fingers
    chord.fingers.forEach((finger, stringIndex) => {
        const fret = finger[1];
        if (fret === null) {
            // X mark
            const x = marginX + stringIndex * stringSpacing;
            const cross = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            cross.setAttribute('x', x);
            cross.setAttribute('y', marginY - 5);
            cross.setAttribute('text-anchor', 'middle');
            cross.setAttribute('fill', '#9c958a');
            cross.setAttribute('font-size', '10');
            cross.setAttribute('font-family', 'Inter, sans-serif');
            cross.textContent = '×';
            svg.appendChild(cross);
        } else if (fret === 0) {
            // Open string
            const x = marginX + stringIndex * stringSpacing;
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', marginY - 8);
            circle.setAttribute('r', 3);
            circle.setAttribute('stroke', '#9c958a');
            circle.setAttribute('stroke-width', '1');
            circle.setAttribute('fill', 'none');
            svg.appendChild(circle);
        } else {
            // Finger position
            const x = marginX + stringIndex * stringSpacing;
            const y = marginY + (fret - 0.5) * fretSpacing;
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', 5);
            circle.setAttribute('fill', '#d4a843');
            svg.appendChild(circle);
        }
    });
    
    container.innerHTML = '';
    container.appendChild(svg);
};

const initChords = () => {
    // Main chord diagram in tools section
    const mainDiagram = document.getElementById('chord-diagram');
    if (mainDiagram) {
        drawChordDiagram(mainDiagram, 'C');
        
        // Tab switching
        document.querySelectorAll('.chord-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.chord-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                drawChordDiagram(mainDiagram, tab.dataset.chord);
            });
        });
    }
    
    // Chord cards in showcase
    document.querySelectorAll('.chord-card').forEach(card => {
        const svg = card.querySelector('.chord-svg');
        if (svg) {
            drawChordDiagram(svg, card.dataset.chord);
        }
    });
};

/* ===== METRONOME ===== */
const initMetronome = () => {
    const bpmDisplay = document.querySelector('.metronome-bpm');
    const beatIndicator = document.querySelector('.metronome-beat');
    const toggleBtn = document.getElementById('metro-toggle');
    const minusBtn = document.getElementById('metro-minus');
    const plusBtn = document.getElementById('metro-plus');
    
    let bpm = 60;
    let isPlaying = false;
    let intervalId = null;
    let audioContext = null;
    
    const updateDisplay = () => {
        bpmDisplay.textContent = bpm;
    };
    
    const playClick = () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = 1000;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
        
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.05);
        
        // Visual beat
        beatIndicator.classList.add('active');
        setTimeout(() => beatIndicator.classList.remove('active'), 100);
    };
    
    const start = () => {
        if (isPlaying) return;
        isPlaying = true;
        toggleBtn.textContent = 'Detener';
        
        const interval = 60000 / bpm;
        playClick();
        intervalId = setInterval(playClick, interval);
    };
    
    const stop = () => {
        isPlaying = false;
        toggleBtn.textContent = 'Iniciar';
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };
    
    toggleBtn.addEventListener('click', () => {
        if (isPlaying) {
            stop();
        } else {
            start();
        }
    });
    
    minusBtn.addEventListener('click', () => {
        if (bpm > 40) {
            bpm -= 5;
            updateDisplay();
            if (isPlaying) {
                stop();
                start();
            }
        }
    });
    
    plusBtn.addEventListener('click', () => {
        if (bpm < 208) {
            bpm += 5;
            updateDisplay();
            if (isPlaying) {
                stop();
                start();
            }
        }
    });
};

/* ===== TUNER ===== */
const initTuner = () => {
    const toggleBtn = document.getElementById('tuner-toggle');
    const needle = document.querySelector('.tuner-needle');
    const noteDisplay = document.querySelector('.tuner-note');
    const stringDisplay = document.querySelector('.tuner-string');
    
    const notes = ['E', 'A', 'D', 'G', 'B', 'E'];
    const stringNames = ['6ª Cuerda', '5ª Cuerda', '4ª Cuerda', '3ª Cuerda', '2ª Cuerda', '1ª Cuerda'];
    const frequencies = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];
    
    let isActive = false;
    let audioContext = null;
    let analyser = null;
    let mediaStream = null;
    let animationId = null;
    
    // For demo purposes, simulate tuner behavior
    let currentString = 0;
    let simulationInterval = null;
    
    const updateTunerDisplay = (inTune) => {
        const offset = inTune ? 0 : (Math.random() - 0.5) * 60;
        needle.style.left = `calc(50% + ${offset}%)`;
        
        if (Math.abs(offset) < 5) {
            needle.style.background = '#4ade80';
            noteDisplay.style.color = '#4ade80';
        } else {
            needle.style.background = '#d4a843';
            noteDisplay.style.color = '#faf6f1';
        }
    };
    
    const simulateTuner = () => {
        // Cycle through strings
        simulationInterval = setInterval(() => {
            currentString = (currentString + 1) % 6;
            noteDisplay.textContent = notes[currentString];
            stringDisplay.textContent = stringNames[currentString];
            
            // Random in/out of tune
            const inTune = Math.random() > 0.3;
            updateTunerDisplay(inTune);
        }, 2000);
    };
    
    toggleBtn.addEventListener('click', async () => {
        if (isActive) {
            isActive = false;
            toggleBtn.textContent = 'Activar Afinador';
            if (simulationInterval) clearInterval(simulationInterval);
            needle.style.left = '50%';
            needle.style.background = '#d4a843';
            noteDisplay.textContent = 'E';
            stringDisplay.textContent = '6ª Cuerda';
            
            // Stop real audio if running
            if (animationId) cancelAnimationFrame(animationId);
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        } else {
            isActive = true;
            toggleBtn.textContent = 'Desactivar';
            
            // Try to use real audio input, fall back to simulation
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 2048;
                
                const source = audioContext.createMediaStreamSource(mediaStream);
                source.connect(analyser);
                
                const buffer = new Float32Array(analyser.fftSize);
                
                const analyze = () => {
                    if (!isActive) return;
                    analyser.getFloatTimeDomainData(buffer);
                    
                    // Simple pitch detection (autocorrelation)
                    let bestOffset = -1;
                    let bestCorrelation = 0;
                    
                    for (let offset = 20; offset < buffer.length / 2; offset++) {
                        let correlation = 0;
                        for (let i = 0; i < buffer.length / 2; i++) {
                            correlation += buffer[i] * buffer[i + offset];
                        }
                        if (correlation > bestCorrelation) {
                            bestCorrelation = correlation;
                            bestOffset = offset;
                        }
                    }
                    
                    if (bestOffset > 0) {
                        const frequency = audioContext.sampleRate / bestOffset;
                        
                        // Find closest note
                        let closestNote = 0;
                        let closestDiff = Infinity;
                        
                        frequencies.forEach((freq, i) => {
                            const diff = Math.abs(frequency - freq);
                            if (diff < closestDiff) {
                                closestDiff = diff;
                                closestNote = i;
                            }
                        });
                        
                        noteDisplay.textContent = notes[closestNote];
                        stringDisplay.textContent = stringNames[closestNote];
                        
                        const cents = 1200 * Math.log2(frequency / frequencies[closestNote]);
                        const normalizedCents = Math.max(-50, Math.min(50, cents));
                        needle.style.left = `calc(50% + ${normalizedCents}%)`;
                        
                        if (Math.abs(cents) < 5) {
                            needle.style.background = '#4ade80';
                            noteDisplay.style.color = '#4ade80';
                        } else {
                            needle.style.background = '#d4a843';
                            noteDisplay.style.color = '#faf6f1';
                        }
                    }
                    
                    animationId = requestAnimationFrame(analyze);
                };
                
                analyze();
            } catch (err) {
                console.log('Microphone not available, using simulation');
                simulateTuner();
            }
        }
    });
};

/* ===== SMOOTH SCROLL ===== */
const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
};

/* ===== INITIALIZATION ===== */
document.addEventListener('DOMContentLoaded', () => {
    initWebGL();
    initAnimations();
    initNav();
    initMobileNav();
    initChords();
    initMetronome();
    initTuner();
    initSmoothScroll();
});