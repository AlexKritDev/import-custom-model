import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";

// Debug
const gui = new dat.GUI();

const debugObj = {
    envMapIntensity: 5
};

//upd all materials

const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObj.envMapIntensity
            child.material.needsUpdate = true;
            child.receiveShadow = true;
            child.castShadow = true;
        }
    })
}

//loaders
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/')
const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMap = cubeTextureLoader
    .setPath('/textures/environmentMaps/1/')
    .load([
        'px.jpg',
        'nx.jpg',
        'py.jpg',
        'ny.jpg',
        'pz.jpg',
        'nz.jpg'
    ])
environmentMap.encoding = THREE.sRGBEncoding;

// dracoLoader.load(
//     '/models/my_hamburger.glb',
//     (file) => {
//         console.log(file)
//     },
//     ()=>{
//
//     },
//     (err)=>{
//         console.log(err)
//     }
// )
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.load(
    // '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    '/models/my_hamburger.glb',
    (gltf) => {
        const helmet = gltf.scene;
        helmet.scale.set(1, 1, 1)
        helmet.position.set(0, -1, 0)
        helmet.rotation.y = Math.PI * .5;
        scene.add(helmet)

        updateAllMaterials()
        gui.add(helmet.rotation, 'y', -Math.PI, Math.PI, .001).name('rotation')
    }
)


/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

scene.background = environmentMap;
scene.environment = environmentMap;

// light
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(0.25, 3, -2.25)
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(512, 512)
directionalLight.shadow.normalBias = .05;
scene.add(directionalLight)

// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(directionalLightCameraHelper)
gui.add(directionalLight, 'intensity', 0, 10, .001).name('nameIntensity')
gui.add(directionalLight.position, 'x', -5, 5, .01).name('lightX')
gui.add(directionalLight.position, 'y', -5, 5, .01).name('lightY')
gui.add(directionalLight.position, 'z', -5, 5, .01).name('lightZ')

gui.add(debugObj, 'envMapIntensity', 0, 10, .001).onChange(updateAllMaterials)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 1, -4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap

gui.add(renderer, 'toneMapping', {
    NO: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilimc: THREE.ACESFilmicToneMapping,
}).onChange(() => {
    renderer.toneMapping = Number(renderer.toneMapping)
    updateAllMaterials()
})
gui.add(renderer, 'toneMappingExposure', 0, 10, .01)

/**
 * Animate
 */
const tick = () => {
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()