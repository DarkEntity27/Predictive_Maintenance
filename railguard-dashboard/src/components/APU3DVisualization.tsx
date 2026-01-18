import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { MetroCar } from '../types';

interface APU3DVisualizationProps {
  metroCars: MetroCar[];
  onCarSelect?: (carId: number) => void;
}

const APU3DVisualization: React.FC<APU3DVisualizationProps> = ({ metroCars, onCarSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const apuBoxesRef = useRef<THREE.Mesh[]>([]);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      5000
    );
    camera.position.set(0, 2, 7);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // CSS2D Renderer for labels
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    containerRef.current.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.update();
    controlsRef.current = controls;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3.0);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2.0));

    // Load train model
    const loader = new GLTFLoader();
    loader.load(
      '/models/train.glb',
      (gltf) => {
        const train = gltf.scene;
        train.scale.set(0.01, 0.01, 0.01);
        scene.add(train);

        const bbox = new THREE.Box3().setFromObject(train);
        const center = bbox.getCenter(new THREE.Vector3());
        const length = bbox.max.z - bbox.min.z;

        controls.target.copy(center);
        controls.update();

        // Create APU boxes for each car
        metroCars.forEach((car, index) => {
          const zOffset = (-length / 2) + (length / (metroCars.length + 1)) * (index + 1);
          createAPU(scene, center, zOffset, car, bbox.max.y, index);
        });
      },
      undefined,
      (error) => {
        console.error('Error loading train model:', error);
      }
    );

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      controls.update();

      // Pulse animation for APU boxes
      apuBoxesRef.current.forEach((box, i) => {
        const car = metroCars[i];
        if (!car) return;
        
        const pulseSpeed = car.status === 'Critical' ? 0.005 : car.status === 'Warning' ? 0.004 : 0.003;
        const pulse = (Math.sin(Date.now() * pulseSpeed + i) + 1) * 0.15;
        if (box.material && 'opacity' in box.material) {
          box.material.opacity = 0.5 + pulse;
        }
        if (box.material && 'emissiveIntensity' in box.material) {
          box.material.emissiveIntensity = 0.6 + pulse * 2;
        }
      });

      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer || !labelRenderer) return;

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      labelRenderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      if (containerRef.current && labelRenderer.domElement) {
        containerRef.current.removeChild(labelRenderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update APU boxes when car data changes
  useEffect(() => {
    apuBoxesRef.current.forEach((box, index) => {
      const car = metroCars[index];
      if (!car || !box.material) return;

      const color = getColorFromStatus(car.status);
      const threeColor = new THREE.Color(color);
      
      if ('color' in box.material) {
        box.material.color = threeColor;
      }
      if ('emissive' in box.material) {
        box.material.emissive = threeColor;
      }

      // Update label
      box.children.forEach((child) => {
        if (child instanceof CSS2DObject) {
          const div = child.element as HTMLDivElement;
          div.style.borderLeftColor = color;
          div.innerHTML = `
<span class="key">Car:</span> <span class="val">${car.id}</span>
<span class="key">RUL:</span> <span class="val">${car.rul.toFixed(1)} h</span>
<span class="key">Status:</span> <span class="val">${car.status}</span>
<span class="key">Conf:</span> <span class="val">${car.confidence.toFixed(1)}%</span>
`;
        }
      });
    });
  }, [metroCars]);

  const getColorFromStatus = (status: string): string => {
    switch (status) {
      case 'Critical':
        return '#ff0000';
      case 'Warning':
        return '#ffa500';
      default:
        return '#00ff00';
    }
  };

  const createAPU = (
    scene: THREE.Scene,
    center: THREE.Vector3,
    zOffset: number,
    car: MetroCar,
    trainMaxY: number,
    index: number
  ) => {
    const color = new THREE.Color(getColorFromStatus(car.status));

    // APU cabinet geometry
    const geo = new THREE.BoxGeometry(0.3, 0.15, 0.25);
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.65,
    });

    const box = new THREE.Mesh(geo, mat);

    // Position at top inside train
    box.position.set(center.x, trainMaxY - 0.08, center.z + zOffset);

    scene.add(box);
    apuBoxesRef.current.push(box);

    // Add clickable interaction
    box.userData = { carId: car.id };

    // Create label
    const div = document.createElement('div');
    div.className = 'apu-3d-label';
    div.style.background = 'rgba(0,0,0,0.85)';
    div.style.border = '1px solid #444';
    div.style.borderLeft = `4px solid ${getColorFromStatus(car.status)}`;
    div.style.color = '#fff';
    div.style.fontFamily = 'monospace';
    div.style.fontSize = '11px';
    div.style.padding = '6px';
    div.style.borderRadius = '4px';
    div.style.whiteSpace = 'pre';
    div.style.pointerEvents = 'none';

    div.innerHTML = `
<span class="key">Car:</span> <span class="val">${car.id}</span>
<span class="key">RUL:</span> <span class="val">${car.rul.toFixed(1)} h</span>
<span class="key">Status:</span> <span class="val">${car.status}</span>
<span class="key">Conf:</span> <span class="val">${car.confidence.toFixed(1)}%</span>
`;

    const label = new CSS2DObject(div);
    label.position.set(0.5, 0, 0);
    box.add(label);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '500px',
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#0a0e1a',
      }}
    />
  );
};

export default APU3DVisualization;
