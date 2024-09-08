import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

const ModelViewer = ({ commands }) => {
  const mount = useRef(null);
  const renderer = useRef(null);
  const scene = useRef(null);
  const camera = useRef(null);
  const model = useRef(null);
  const controls = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadTime, setLoadTime] = useState(null);

  const [renderTime, setRenderTime] = useState(null);
  const [downloadTime, setDownloadTime] = useState(null);
    
  const [cpuInfo, setCpuInfo] = useState(null);
  const [memoryInfo, setMemoryInfo] = useState(null);

  const [modelDimensions, setModelDimensions] = useState(null); // State for model dimensions


  useEffect(() => {
    scene.current = new THREE.Scene();

    camera.current = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.current.position.z = 5;

    renderer.current = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.current.setSize(mount.current.offsetWidth, mount.current.offsetHeight);


    const startTime = performance.now(); 
    mount.current.appendChild(renderer.current.domElement);
    const endTime = performance.now()
    setRenderTime((endTime - startTime).toFixed(2));
    controls.current = new OrbitControls(camera.current, renderer.current.domElement);
    controls.current.enableRotate = true;
    controls.current.enableZoom = true;
    controls.current.enablePan = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.current.add(ambientLight);

    const animate = () => {
        requestAnimationFrame(animate);
        renderer.current.render(scene.current, camera.current);
    };
      
    animate();
      
    return () => {
      mount.current.removeChild(renderer.current.domElement);
    };
  }, []);

  useEffect(() => {
    const executeCommands = async () => {
      for (const command of commands) {
        if (command.action === 'load') {
          const startTime = performance.now();
          await loadModel(command.params[0]);
          const endTime = performance.now();
          setLoadTime((endTime - startTime).toFixed(2));
          setModelLoaded(true); // Model is loaded

          // Gather CPU/GPU/memory info after model load
          setCpuInfo(navigator.hardwareConcurrency);
          if (performance.memory) {
            setMemoryInfo({
              totalJSHeapSize: performance.memory.totalJSHeapSize,
              usedJSHeapSize: performance.memory.usedJSHeapSize,
              jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            });
          } else {
            console.warn('performance.memory is not available');
            setMemoryInfo({
              totalJSHeapSize: 'N/A',
              usedJSHeapSize: 'N/A',
              jsHeapSizeLimit: 'N/A',
            });
          }
        } else if (modelLoaded) {
          switch (command.action) {
            case 'resize':
              resizeModel(command.params);
              break;
            case 'color':
              changeColor(command.params[0]);
              break;
            default:
              console.log('Unknown command:', command.action);
          }
        }
      }
    };

    executeCommands();
  }, [commands, modelLoaded]);

  const loadModel = async (modelName) => {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();

      const loadGltfModel = () => {
        loader.load(
          `/models/${modelName}.gltf`,
          (gltf) => {
            if (model.current) {
              scene.current.remove(model.current);
            }
            model.current = gltf.scene;
            scene.current.add(model.current);

            updateModelDimensions();
            resolve();
          },
          undefined,
          (error) => {
            console.error('Error loading GLTF model', error);
            // Try loading .glb file if .gltf fails
            loadGlbModel();
          }
        );
      };

      const loadGlbModel = () => {
        loader.load(
          `/models/${modelName}.glb`,
          (gltf) => {
            if (model.current) {
              scene.current.remove(model.current);
            }
            model.current = gltf.scene;
            scene.current.add(model.current);

            updateModelDimensions();
            resolve();
          },
          undefined,
          (error) => {
            console.error('Error loading GLB model', error);
            reject(error);
          }
        );
      };

      // Start by trying to load the .gltf model
      loadGltfModel();
    });
  };

  const updateModelDimensions = () => {
    if (model.current) {
      const box = new THREE.Box3().setFromObject(model.current); // Create a bounding box around the model
      const size = new THREE.Vector3();
      box.getSize(size); // Get the size of the box (width, height, depth)
      setModelDimensions({ width: size.x/2, height: size.y/2, depth: size.z/2 }); // Update state with new dimensions
    }
  };

  const resizeModel = (params) => {
    if (!model.current) return;
    const [x, y, z] = params.map(Number);
    model.current.scale.set(x, y, z);
    updateModelDimensions();
  };

  const changeColor = (color) => {
    if (!model.current) return;
    model.current.traverse((child) => {
      if (child.isMesh) {
        child.material.color.set(color);
      }
    });
  };

  const handleDownloadModel = () => {
    if (!model.current) {
      alert('Model not loaded yet.');
      return;
    }

    const startTime = performance.now();
   
    const exporter = new GLTFExporter();
    exporter.parse(
      model.current,
      (result) => {
        const output = JSON.stringify(result, null, 2);
        const blob = new Blob([output], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'modified_model.glb';
        link.click();
        const dimensions = {
          width: modelDimensions.width,
          height: modelDimensions.height,
          depth: modelDimensions.depth
        };
        const metadataBlob = new Blob([JSON.stringify(dimensions, null, 2)], { type: 'application/json' });
        const metadataUrl = URL.createObjectURL(metadataBlob);
        
        // Download the metadata
        const metadataLink = document.createElement('a');
        metadataLink.href = metadataUrl;
        metadataLink.download = 'model_dimensions.json';
        metadataLink.click();
  

        const endTime = performance.now()
        setDownloadTime((endTime - startTime).toFixed(2));
      },
      (error) => {
        console.error('An error happened during the export:', error);
      },
      { binary: false } // Change to true if you want to export as GLB
    );
  };

  return (
    <div
      ref={mount}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden', // Ensures no overflow from absolutely positioned elements
      }}
    >
      <button onClick={handleDownloadModel} style={{ position: 'absolute', top: '10px', left: '10px' }}>Download Model</button>
      {loadTime && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '10px',
          borderRadius: '5px',
          textAlign: 'right',
          zIndex: 1000 // Ensure it appears above other content
        }}>
          <p>Model Load Time: {loadTime} ms</p>
          <p>Render Time: {renderTime} ms</p>
          <p>Download Time: {downloadTime} ms</p>
          <p>CPU Cores: {cpuInfo}</p>
          {memoryInfo && (
            <div>
              <p>Total JS Heap Size: {memoryInfo.totalJSHeapSize}</p>
              <p>Used JS Heap Size: {memoryInfo.usedJSHeapSize}</p>
              <p>JS Heap Size Limit: {memoryInfo.jsHeapSizeLimit}</p>
            </div>
          )}
          {modelDimensions && (
          <div>
            <p>Model Width: {modelDimensions.width}</p>
            <p>Model Height: {modelDimensions.height}</p>
            <p>Model Depth: {modelDimensions.depth}</p>
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default ModelViewer;