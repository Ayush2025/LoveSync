import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Load the model
useGLTF.preload('/models/Joy_Materials.gltf');

interface RobotModelProps {
  onModelLoad?: (data: any) => void;
  externalAnimationPath?: string;
}

function RobotModel({ onModelLoad, externalAnimationPath }: RobotModelProps) {
  const { scene, animations: modelAnimations } = useGLTF('/models/Joy_Materials.gltf');
  const [externalAnimClips, setExternalAnimClips] = useState<THREE.AnimationClip[]>([]);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<{ [key: string]: THREE.AnimationAction }>({});
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);
  const previousActionRef = useRef<THREE.AnimationAction | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const modelCenterRef = useRef<THREE.Vector3 | null>(null);

  // Load .anim file if provided
  useEffect(() => {
    if (!externalAnimationPath) return;
    
    // Check if it's a .anim file
    if (externalAnimationPath.endsWith('.anim')) {
      const loader = new THREE.FileLoader();
      loader.setResponseType('json');
      loader.load(
        externalAnimationPath,
        (data: any) => {
          try {
            // Handle different .anim file formats
            let clips: THREE.AnimationClip[] = [];
            
            // If data is an array of animation clips
            if (Array.isArray(data)) {
              clips = data.map((clipData: any) => {
                if (clipData instanceof THREE.AnimationClip) {
                  return clipData;
                }
                // Try parsing, or create manually if parse fails
                try {
                  return THREE.AnimationClip.parse(clipData);
                } catch {
                  // Fallback: create clip manually from JSON structure
                  return new THREE.AnimationClip(
                    clipData.name || 'Animation',
                    clipData.duration || -1,
                    clipData.tracks ? clipData.tracks.map((track: any) => {
                      if (track instanceof THREE.KeyframeTrack) return track;
                      return THREE.KeyframeTrack.parse(track);
                    }) : []
                  );
                }
              });
            }
            // If data is a single animation clip object
            else if (data.name || data.tracks) {
              try {
                clips = [THREE.AnimationClip.parse(data)];
              } catch {
                // Fallback: create clip manually
                clips = [new THREE.AnimationClip(
                  data.name || 'Animation',
                  data.duration || -1,
                  data.tracks ? data.tracks.map((track: any) => {
                    if (track instanceof THREE.KeyframeTrack) return track;
                    return THREE.KeyframeTrack.parse(track);
                  }) : []
                )];
              }
            }
            // If data has an animations array
            else if (data.animations && Array.isArray(data.animations)) {
              clips = data.animations.map((clipData: any) => {
                try {
                  return THREE.AnimationClip.parse(clipData);
                } catch {
                  return new THREE.AnimationClip(
                    clipData.name || 'Animation',
                    clipData.duration || -1,
                    clipData.tracks ? clipData.tracks.map((track: any) => {
                      if (track instanceof THREE.KeyframeTrack) return track;
                      return THREE.KeyframeTrack.parse(track);
                    }) : []
                  );
                }
              });
            }
            // If data is a single clip in object format
            else {
              try {
                clips = [THREE.AnimationClip.parse(data)];
              } catch {
                clips = [new THREE.AnimationClip(
                  data.name || 'Animation',
                  data.duration || -1,
                  data.tracks ? data.tracks.map((track: any) => {
                    if (track instanceof THREE.KeyframeTrack) return track;
                    return THREE.KeyframeTrack.parse(track);
                  }) : []
                )];
              }
            }
            
            setExternalAnimClips(clips);
          } catch (error) {
            console.error('Error parsing .anim file:', error);
          }
        },
        undefined,
        (error: any) => {
          console.error('Error loading .anim file:', error);
        }
      );
    } else {
      // For GLB/GLTF files, use useGLTF hook (handled separately)
      setExternalAnimClips([]);
    }
  }, [externalAnimationPath]);

  // Try to load GLB/GLTF animation file (only if not .anim)
  const externalAnimData = externalAnimationPath && !externalAnimationPath.endsWith('.anim') 
    ? useGLTF(externalAnimationPath) 
    : null;

  // Define fadeToAction function
  const fadeToAction = (name: string, duration: number) => {
    previousActionRef.current = activeActionRef.current;
    activeActionRef.current = actionsRef.current[name];

    if (previousActionRef.current !== activeActionRef.current && previousActionRef.current) {
      previousActionRef.current.fadeOut(duration);
    }

    if (activeActionRef.current) {
      activeActionRef.current
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(duration)
        .play();
    }
  };

  useEffect(() => {
    if (!scene || !groupRef.current) return;

    // Calculate bounding box to find model center
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const center = new THREE.Vector3();
    box.getCenter(center);
    modelCenterRef.current = center;

    // Find the head for morph targets
    const face = groupRef.current.getObjectByName('Head_4') as THREE.Object3D;

    // Create animation mixer
    mixerRef.current = new THREE.AnimationMixer(groupRef.current);

    // Combine model animations with external animations
    let allAnimations = [...modelAnimations];
    
    // Add animations from GLB/GLTF file
    if (externalAnimData?.animations && externalAnimData.animations.length > 0) {
      allAnimations = [...allAnimations, ...externalAnimData.animations];
    }
    
    // Add animations from .anim file
    if (externalAnimClips.length > 0) {
      allAnimations = [...allAnimations, ...externalAnimClips];
    }

    // Create actions for all animations (model + external)
    allAnimations.forEach((clip) => {
      const action = mixerRef.current!.clipAction(clip);
      actionsRef.current[clip.name] = action;

      // Set one-time animations
      const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
      const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];
      
      if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
      }
    });

    // Start with Walking animation if available, otherwise first animation
    activeActionRef.current = actionsRef.current['Walking'] || Object.values(actionsRef.current)[0];
    if (activeActionRef.current) {
      activeActionRef.current.play();
    }

    // Notify parent that model is loaded
    if (onModelLoad) {
      onModelLoad({
        mixer: mixerRef.current,
        actions: actionsRef.current,
        setState: (state: string) => {
          fadeToAction(state, 0.5);
        },
        face: face,
        center: modelCenterRef.current,
        allAnimations: allAnimations.map(clip => clip.name),
      });
    }

    return () => {
      // Cleanup
      if (mixerRef.current) {
        allAnimations.forEach((clip) => {
          const action = actionsRef.current[clip.name];
          if (action) {
            action.stop();
          }
        });
      }
    };
  }, [scene, modelAnimations, externalAnimData, externalAnimClips, onModelLoad]);

  // Animation loop
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return <primitive ref={groupRef} object={scene} />;
}

interface ThreeJSAnimationProps {
  className?: string;
  externalAnimationPath?: string;
}

export function ThreeJSAnimation({ className, externalAnimationPath }: ThreeJSAnimationProps) {
  const [modelData, setModelData] = useState<any>(null);
  const [selectedState, setSelectedState] = useState('Walking');
  const [modelCenter, setModelCenter] = useState<[number, number, number]>([0, 0, 0]);
  const controlsRef = useRef<any>(null);
  const [availableAnimations, setAvailableAnimations] = useState<string[]>([]);

  const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
  const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];

  const handleStateChange = (state: string) => {
    if (modelData?.setState) {
      modelData.setState(state);
      setSelectedState(state);
    }
  };

  // Update model center when model loads
  useEffect(() => {
    if (modelData?.center) {
      const center = modelData.center;
      setModelCenter([center.x, center.y, center.z]);
      // Update controls target
      if (controlsRef.current) {
        controlsRef.current.target.set(center.x, center.y, center.z);
        controlsRef.current.update();
      }
    }
    // Update available animations list
    if (modelData?.allAnimations) {
      setAvailableAnimations(modelData.allAnimations);
    }
  }, [modelData]);

  return (
    <div className={`w-full h-full ${className || ''}`}>
      <div className="h-96 w-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
        <Canvas
          camera={{ position: [-5, 3, 10], fov: 45 }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.5} />
          <hemisphereLight intensity={3} position={[0, 20, 0]} />
          <directionalLight intensity={3} position={[0, 20, 10]} />
          
          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[2000, 2000]} />
            <meshPhongMaterial color={0xcbcbcb} depthWrite={false} />
          </mesh>
          
          {/* Grid helper */}
          <gridHelper args={[200, 40, 0x000000, 0x000000]} />
          
          {/* Robot model */}
          <RobotModel onModelLoad={setModelData} externalAnimationPath={externalAnimationPath} />
          
          {/* Camera controls */}
          <OrbitControls
            ref={controlsRef}
            target={modelCenter}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={100}
            mouseButtons={{
              LEFT: THREE.MOUSE.PAN,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.ROTATE
            }}
            touches={{
              ONE: THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN
            }}
          />
        </Canvas>
      </div>

      {/* Controls */}
      <div className="mt-4 space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">States</h4>
          <div className="flex flex-wrap gap-2">
            {states.map((state) => (
              <button
                key={state}
                onClick={() => handleStateChange(state)}
                disabled={!modelData?.actions?.[state]}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectedState === state
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                } ${!modelData?.actions?.[state] ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Emotes</h4>
          <div className="flex flex-wrap gap-2">
            {emotes.map((emote) => (
              <button
                key={emote}
                onClick={() => handleStateChange(emote)}
                disabled={!modelData?.actions?.[emote]}
                className={`px-3 py-1 rounded text-sm bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-300 dark:hover:bg-purple-700 transition-colors ${
                  !modelData?.actions?.[emote] ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {emote}
              </button>
            ))}
          </div>
        </div>

        {/* External Animations */}
        {availableAnimations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              All Available Animations
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableAnimations.map((animName) => (
                <button
                  key={animName}
                  onClick={() => handleStateChange(animName)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedState === animName
                      ? 'bg-green-500 text-white'
                      : 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 hover:bg-green-300 dark:hover:bg-green-700'
                  }`}
                >
                  {animName}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

