/* ===== THREE.JS WEBGL BACKGROUND ===== */
const initWebGL = () => {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const particleCount = 2500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const color1 = new THREE.Color(0xd4a843);
    const color2 = new THREE.Color(0x8b6914);
    const color3 = new THREE.Color(0x3d2e0a);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 20;
        positions[i3 + 1] = (Math.random() - 0.5) * 20;
        positions[i3 + 2] = (Math.random() - 0.5) * 10;
        
        const mixedColor = new THREE.Color();
        const rand = Math.random();
        if (rand > 0.7) mixedColor.copy(color1);
        else if (rand > 0.4) mixedColor.copy(color2);
        else mixedColor.copy(color3);
        
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
            float wave1 = sin(pos.x * 2.0 + uTime * 0.8) * 0.3;
            float wave2 = sin(pos.y * 1.5 + uTime * 0.5) * 0.2;
            float wave3 = sin((pos.x + pos.y) * 1.0 + uTime * 0.3) * 0.15;
            pos.z += wave1 + wave2 + wave3;
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
        uniforms: { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(0, 0) } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    camera.position.z = 6;
    
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    const clock = new THREE.Clock();
    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        material.uniforms.uTime.value = elapsedTime;
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        material.uniforms.uMouse.value.set(mouseX, mouseY);
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
    
    const heroTl = gsap.timeline({ delay: 0.3 });
    heroTl
        .to('.hero-label', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
        .to('.hero-title .line', { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out' }, '-=0.4')
        .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
        .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');
    
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            scrollTrigger: { trigger: header, start: 'top 80%', toggleActions: 'play none none none' },
            opacity: 0, y: 30, duration: 0.8, ease: 'power3.out'
        });
    });
    
    gsap.utils.toArray('.section-intro').forEach(el => {
        gsap.from(el, {
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
            opacity: 0, y: 20, duration: 0.8, ease: 'power3.out'
        });
    });
    
    gsap.utils.toArray('.posture-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
            opacity: 0, y: 40, duration: 0.8, delay: i * 0.1, ease: 'power3.out'
        });
    });
    
    gsap.utils.toArray('.string-row').forEach((row, i) => {
        gsap.from(row, {
            scrollTrigger: { trigger: row, start: 'top 90%', toggleActions: 'play none none none' },
            opacity: 0, x: -20, duration: 0.6, delay: i * 0.08, ease: 'power3.out'
        });
    });
    
    gsap.utils.toArray('.explain-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
            opacity: 0, y: 30, duration: 0.8, delay: i * 0.12, ease: 'power3.out'
        });
    });
    
    gsap.utils.toArray('.tool-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
            opacity: 0, y: 40, duration: 0.8, delay: i * 0.1, ease: 'power3.out'
        });
    });
    
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        gsap.from(item, {
            scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none none' },
            opacity: 0, x: -30, duration: 0.8, delay: i * 0.15, ease: 'power3.out'
        });
    });
    
    gsap.utils.toArray('.chord-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
            opacity: 0, y: 30, scale: 0.95, duration: 0.6, delay: i * 0.08, ease: 'power3.out'
        });
    });
    
    gsap.utils.toArray('.routine-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
            opacity: 0, y: 40, duration: 0.8, delay: i * 0.12, ease: 'power3.out'
        });
    });
    
    gsap.utils.toArray('.resource-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
            opacity: 0, y: 40, duration: 0.8, delay: i * 0.08, ease: 'power3.out'
        });
    });
    
    gsap.utils.toArray('.mechanic-step').forEach((step, i) => {
        gsap.from(step, {
            scrollTrigger: { trigger: step, start: 'top 85%', toggleActions: 'play none none none' },
            opacity: 0, y: 30, duration: 0.8, delay: i * 0.15, ease: 'power3.out'
        });
    });
};

/* ===== NAVIGATION ===== */
const initNav = () => {
    const nav = document.querySelector('.nav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 100);
    });
};

const initMobileNav = () => {
    const toggle = document.querySelector('.nav-toggle');
    const mobileMenu = document.querySelector('.nav-mobile');
    if (!toggle || !mobileMenu) return;
    
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    document.querySelectorAll('.nav-mobile a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
};

/* ===== GUITAR DIAGRAM INTERACTIVE ===== */
const initGuitarDiagram = () => {
    const hotspots = document.querySelectorAll('.hotspot');
    const partLabels = document.querySelectorAll('.part-label');
    const infoPanels = document.querySelectorAll('.part-info');
    const defaultInfo = document.getElementById('info-default');
    
    const showPart = (partName) => {
        infoPanels.forEach(p => p.classList.remove('active'));
        partLabels.forEach(l => l.classList.remove('active'));
        
        const targetInfo = document.getElementById(`info-${partName}`);
        const targetLabel = document.querySelector(`.part-label[data-part="${partName}"]`);
        
        if (targetInfo) targetInfo.classList.add('active');
        if (targetLabel) targetLabel.classList.add('active');
    };
    
    const resetPart = () => {
        infoPanels.forEach(p => p.classList.remove('active'));
        partLabels.forEach(l => l.classList.remove('active'));
        if (defaultInfo) defaultInfo.classList.add('active');
    };
    
    hotspots.forEach(spot => {
        spot.addEventListener('mouseenter', () => showPart(spot.dataset.part));
        spot.addEventListener('mouseleave', resetPart);
        spot.addEventListener('click', () => showPart(spot.dataset.part));
    });
    
    partLabels.forEach(label => {
        label.addEventListener('mouseenter', () => showPart(label.dataset.part));
        label.addEventListener('mouseleave', resetPart);
    });
};

/* ===== STRING SOUNDS (Web Audio API) ===== */
let audioCtx = null;
const getAudioCtx = () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
};

const playStringNote = (frequency, duration = 1.5) => {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 4, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
};

const initStringSounds = () => {
    document.querySelectorAll('.string-row').forEach(row => {
        const btn = row.querySelector('.string-play-btn');
        const freq = parseFloat(row.dataset.freq);
        
        btn.addEventListener('click', () => {
            playStringNote(freq);
            row.classList.add('playing');
            btn.classList.add('playing');
            btn.textContent = '🔊 Sonando';
            
            setTimeout(() => {
                row.classList.remove('playing');
                btn.classList.remove('playing');
                btn.textContent = '▶ Escuchar';
            }, 1500);
        });
    });
};

/* ===== TUNING SLIDER DEMO ===== */
const initTuningSlider = () => {
    const handle = document.querySelector('.tuning-slider-handle');
    const track = document.querySelector('.tuning-slider-track');
    const status = document.querySelector('.tuning-status');
    const playBtn = document.querySelector('.tuning-play-demo');
    
    if (!handle || !track) return;
    
    let isDragging = false;
    
    const updateSlider = (clientX) => {
        const rect = track.getBoundingClientRect();
        let pct = ((clientX - rect.left) / rect.width) * 100;
        pct = Math.max(5, Math.min(95, pct));
        handle.style.left = `${pct}%`;
        
        const tuned = pct >= 42 && pct <= 58;
        handle.classList.toggle('tuned', tuned);
        
        if (tuned) status.textContent = '✅ Afinada';
        else if (pct < 30) status.textContent = 'Muy floja';
        else if (pct < 42) status.textContent = 'Un poco floja';
        else if (pct > 70) status.textContent = 'Muy tensa';
        else status.textContent = 'Un poco tensa';
    };
    
    handle.addEventListener('mousedown', (e) => { isDragging = true; e.preventDefault(); });
    document.addEventListener('mousemove', (e) => { if (isDragging) updateSlider(e.clientX); });
    document.addEventListener('mouseup', () => { isDragging = false; });
    
    track.addEventListener('click', (e) => updateSlider(e.clientX));
    
    // Touch support
    handle.addEventListener('touchstart', (e) => { isDragging = true; });
    document.addEventListener('touchmove', (e) => { if (isDragging) updateSlider(e.touches[0].clientX); });
    document.addEventListener('touchend', () => { isDragging = false; });
    
    playBtn.addEventListener('click', () => {
        const pct = parseFloat(handle.style.left) || 50;
        const baseFreq = 82.41;
        const detune = ((pct - 50) / 50) * 20;
        playStringNote(baseFreq * Math.pow(2, detune / 1200), 1);
    });
};

/* ===== RHYTHM DEMO ===== */
const initRhythmDemo = () => {
    const buttons = document.querySelectorAll('.rhythm-btn');
    const beatNumber = document.querySelector('.beat-number');
    const beatProgress = document.querySelector('.beat-progress');
    let rhythmInterval = null;
    let currentBeat = 1;
    let bpm = 60;
    let isPlaying = false;
    
    const tempos = { slow: 40, medium: 60, fast: 90 };
    
    const playBeatSound = () => {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = currentBeat === 1 ? 1200 : 800;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
    };
    
    const updateBeat = () => {
        beatNumber.textContent = currentBeat;
        playBeatSound();
        
        // Animate dots
        document.querySelectorAll('.beat-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i + 1 === currentBeat);
            if (i + 1 === currentBeat) {
                dot.classList.remove('pulse');
                void dot.offsetWidth;
                dot.classList.add('pulse');
            }
        });
        
        // Progress bar
        beatProgress.style.transition = 'none';
        beatProgress.style.width = '0%';
        void beatProgress.offsetWidth;
        beatProgress.style.transition = `width ${60000 / bpm}ms linear`;
        beatProgress.style.width = '100%';
        
        currentBeat = currentBeat >= 4 ? 1 : currentBeat + 1;
    };
    
    const start = () => {
        if (isPlaying) return;
        isPlaying = true;
        currentBeat = 1;
        updateBeat();
        rhythmInterval = setInterval(updateBeat, 60000 / bpm);
    };
    
    const stop = () => {
        isPlaying = false;
        clearInterval(rhythmInterval);
        rhythmInterval = null;
        beatProgress.style.width = '0%';
        document.querySelectorAll('.beat-dot').forEach(d => d.classList.remove('active', 'pulse'));
    };
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            bpm = tempos[btn.dataset.tempo];
            stop();
            setTimeout(start, 100);
        });
    });
    
    // Auto-start with medium tempo on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isPlaying) {
                buttons.forEach(b => b.classList.toggle('active', b.dataset.tempo === 'medium'));
                bpm = 60;
                start();
            }
        });
    }, { threshold: 0.5 });
    
    const rhythmSection = document.querySelector('.rhythm-exercise');
    if (rhythmSection) observer.observe(rhythmSection);
};

/* ===== CHORD DIAGRAMS ===== */
const chordData = {
    C: { name: 'Do Mayor', fingers: [[1, 0], [2, 1], [3, 0], [4, 2], [5, 3], [0, null]], instruction: 'Índice en 1er traste de la 2ª cuerda · Medio en 2º traste de la 4ª · Anular en 3er traste de la 5ª' },
    G: { name: 'Sol Mayor', fingers: [[0, 3], [1, 2], [2, 0], [3, 0], [4, 0], [5, 3]], instruction: 'Medio en 2º traste de la 5ª · Índice en 2º traste de la 6ª · Anular en 3er traste de la 1ª · Meñique en 3er traste de la 6ª' },
    D: { name: 'Re Mayor', fingers: [[0, null], [1, null], [2, 0], [3, 2], [4, 3], [5, 2]], instruction: 'Índice en 2º traste de la 3ª · Medio en 2º traste de la 1ª · Anular en 3er traste de la 2ª' },
    Em: { name: 'Mi Menor', fingers: [[0, 0], [1, 2], [2, 2], [3, 0], [4, 0], [5, 0]], instruction: 'Medio en 2º traste de la 5ª · Anular en 2º traste de la 4ª — ¡Solo 2 dedos!' },
    Am: { name: 'La Menor', fingers: [[0, null], [1, 0], [2, 2], [3, 2], [4, 1], [5, 0]], instruction: 'Índice en 1er traste de la 2ª · Medio en 2º traste de la 4ª · Anular en 2º traste de la 3ª' }
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
    
    for (let i = 0; i < stringCount; i++) {
        const x = marginX + i * stringSpacing;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x); line.setAttribute('y1', marginY);
        line.setAttribute('x2', x); line.setAttribute('y2', marginY + fretCount * fretSpacing);
        line.setAttribute('stroke', '#6b655c');
        line.setAttribute('stroke-width', i < 2 ? 1.5 : 1);
        svg.appendChild(line);
    }
    
    for (let i = 0; i <= fretCount; i++) {
        const y = marginY + i * fretSpacing;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', marginX); line.setAttribute('y1', y);
        line.setAttribute('x2', marginX + (stringCount - 1) * stringSpacing); line.setAttribute('y2', y);
        line.setAttribute('stroke', '#6b655c');
        line.setAttribute('stroke-width', i === 0 ? 3 : 1);
        svg.appendChild(line);
    }
    
    chord.fingers.forEach((finger, stringIndex) => {
        const fret = finger[1];
        const x = marginX + stringIndex * stringSpacing;
        if (fret === null) {
            const cross = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            cross.setAttribute('x', x); cross.setAttribute('y', marginY - 5);
            cross.setAttribute('text-anchor', 'middle');
            cross.setAttribute('fill', '#9c958a');
            cross.setAttribute('font-size', '10');
            cross.setAttribute('font-family', 'Inter, sans-serif');
            cross.textContent = '×';
            svg.appendChild(cross);
        } else if (fret === 0) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x); circle.setAttribute('cy', marginY - 8);
            circle.setAttribute('r', 3);
            circle.setAttribute('stroke', '#9c958a');
            circle.setAttribute('stroke-width', '1');
            circle.setAttribute('fill', 'none');
            svg.appendChild(circle);
        } else {
            const y = marginY + (fret - 0.5) * fretSpacing;
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x); circle.setAttribute('cy', y);
            circle.setAttribute('r', 5);
            circle.setAttribute('fill', '#d4a843');
            svg.appendChild(circle);
        }
    });
    
    container.innerHTML = '';
    container.appendChild(svg);
};

const initChords = () => {
    const mainDiagram = document.getElementById('chord-diagram');
    const instruction = document.getElementById('chord-instruction');
    
    if (mainDiagram) {
        drawChordDiagram(mainDiagram, 'C');
        
        document.querySelectorAll('.chord-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.chord-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const chord = chordData[tab.dataset.chord];
                drawChordDiagram(mainDiagram, tab.dataset.chord);
                
                if (instruction && chord) {
                    instruction.querySelector('h4').textContent = chord.name;
                    instruction.querySelector('p').textContent = chord.instruction;
                }
            });
        });
    }
    
    document.querySelectorAll('.chord-card').forEach(card => {
        const svg = card.querySelector('.chord-svg');
        if (svg) drawChordDiagram(svg, card.dataset.chord);
    });
};

/* ===== METRONOME ===== */
const initMetronome = () => {
    const bpmDisplay = document.querySelector('.metronome-bpm');
    const beatIndicator = document.querySelector('.metronome-beat');
    const toggleBtn = document.getElementById('metro-toggle');
    const minusBtn = document.getElementById('metro-minus');
    const plusBtn = document.getElementById('metro-plus');
    
    if (!toggleBtn) return;
    
    let bpm = 60;
    let isPlaying = false;
    let intervalId = null;
    let metroCtx = null;
    
    const updateDisplay = () => { if (bpmDisplay) bpmDisplay.textContent = bpm; };
    
    const playClick = () => {
        if (!metroCtx) metroCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = metroCtx.createOscillator();
        const gain = metroCtx.createGain();
        osc.connect(gain);
        gain.connect(metroCtx.destination);
        osc.frequency.value = 1000;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, metroCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, metroCtx.currentTime + 0.05);
        osc.start(metroCtx.currentTime);
        osc.stop(metroCtx.currentTime + 0.05);
        
        if (beatIndicator) {
            beatIndicator.classList.add('active');
            setTimeout(() => beatIndicator.classList.remove('active'), 100);
        }
    };
    
    const start = () => {
        if (isPlaying) return;
        isPlaying = true;
        toggleBtn.textContent = 'Detener';
        playClick();
        intervalId = setInterval(playClick, 60000 / bpm);
    };
    
    const stop = () => {
        isPlaying = false;
        toggleBtn.textContent = 'Iniciar';
        if (intervalId) { clearInterval(intervalId); intervalId = null; }
    };
    
    toggleBtn.addEventListener('click', () => isPlaying ? stop() : start());
    
    if (minusBtn) minusBtn.addEventListener('click', () => {
        if (bpm > 40) { bpm -= 5; updateDisplay(); if (isPlaying) { stop(); start(); } }
    });
    
    if (plusBtn) plusBtn.addEventListener('click', () => {
        if (bpm < 208) { bpm += 5; updateDisplay(); if (isPlaying) { stop(); start(); } }
    });
};

/* ===== TUNER ===== */
const initTuner = () => {
    const toggleBtn = document.getElementById('tuner-toggle');
    const needle = document.querySelector('.tuner-needle');
    const noteDisplay = document.querySelector('.tuner-note');
    const stringDisplay = document.querySelector('.tuner-string');
    
    if (!toggleBtn) return;
    
    const notes = ['E', 'A', 'D', 'G', 'B', 'E'];
    const stringNames = ['6ª Cuerda', '5ª Cuerda', '4ª Cuerda', '3ª Cuerda', '2ª Cuerda', '1ª Cuerda'];
    const frequencies = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];
    
    let isActive = false;
    let tunerCtx = null;
    let analyser = null;
    let mediaStream = null;
    let animationId = null;
    let simInterval = null;
    let currentString = 0;
    
    const updateDisplay = (inTune) => {
        const offset = inTune ? 0 : (Math.random() - 0.5) * 60;
        if (needle) needle.style.left = `calc(50% + ${offset}%)`;
        const isTuned = Math.abs(offset) < 5;
        if (needle) needle.style.background = isTuned ? '#4ade80' : '#d4a843';
        if (noteDisplay) noteDisplay.style.color = isTuned ? '#4ade80' : '#faf6f1';
    };
    
    const simulate = () => {
        simInterval = setInterval(() => {
            currentString = (currentString + 1) % 6;
            if (noteDisplay) noteDisplay.textContent = notes[currentString];
            if (stringDisplay) stringDisplay.textContent = stringNames[currentString];
            updateDisplay(Math.random() > 0.3);
        }, 2000);
    };
    
    toggleBtn.addEventListener('click', async () => {
        if (isActive) {
            isActive = false;
            toggleBtn.textContent = 'Activar Afinador';
            if (simInterval) clearInterval(simInterval);
            if (needle) { needle.style.left = '50%'; needle.style.background = '#d4a843'; }
            if (noteDisplay) { noteDisplay.textContent = 'E'; noteDisplay.style.color = '#faf6f1'; }
            if (stringDisplay) stringDisplay.textContent = '6ª Cuerda';
            if (animationId) cancelAnimationFrame(animationId);
            if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
        } else {
            isActive = true;
            toggleBtn.textContent = 'Desactivar';
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                tunerCtx = new (window.AudioContext || window.webkitAudioContext)();
                analyser = tunerCtx.createAnalyser();
                analyser.fftSize = 2048;
                const source = tunerCtx.createMediaStreamSource(mediaStream);
                source.connect(analyser);
                const buffer = new Float32Array(analyser.fftSize);
                
                const analyze = () => {
                    if (!isActive) return;
                    analyser.getFloatTimeDomainData(buffer);
                    let bestOffset = -1, bestCorrelation = 0;
                    for (let offset = 20; offset < buffer.length / 2; offset++) {
                        let correlation = 0;
                        for (let i = 0; i < buffer.length / 2; i++) correlation += buffer[i] * buffer[i + offset];
                        if (correlation > bestCorrelation) { bestCorrelation = correlation; bestOffset = offset; }
                    }
                    if (bestOffset > 0) {
                        const frequency = tunerCtx.sampleRate / bestOffset;
                        let closestNote = 0, closestDiff = Infinity;
                        frequencies.forEach((freq, i) => {
                            const diff = Math.abs(frequency - freq);
                            if (diff < closestDiff) { closestDiff = diff; closestNote = i; }
                        });
                        if (noteDisplay) noteDisplay.textContent = notes[closestNote];
                        if (stringDisplay) stringDisplay.textContent = stringNames[closestNote];
                        const cents = 1200 * Math.log2(frequency / frequencies[closestNote]);
                        const normalized = Math.max(-50, Math.min(50, cents));
                        if (needle) needle.style.left = `calc(50% + ${normalized}%)`;
                        const isTuned = Math.abs(cents) < 5;
                        if (needle) needle.style.background = isTuned ? '#4ade80' : '#d4a843';
                        if (noteDisplay) noteDisplay.style.color = isTuned ? '#4ade80' : '#faf6f1';
                    }
                    animationId = requestAnimationFrame(analyze);
                };
                analyze();
            } catch (err) {
                console.log('Microphone not available, using simulation');
                simulate();
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
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
};

/* ===== INITIALIZATION ===== */
document.addEventListener('DOMContentLoaded', () => {
    initWebGL();
    initAnimations();
    initNav();
    initMobileNav();
    initGuitarDiagram();
    initStringSounds();
    initTuningSlider();
    initRhythmDemo();
    initChords();
    initMetronome();
    initTuner();
    initSmoothScroll();
});