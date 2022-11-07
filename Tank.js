"use strict";
import * as THREE from './libs/three.module.js'
import { OrbitControls } from './libs/controls/OrbitControls.js';
import { OBJLoader } from './libs/loaders/OBJLoader.js';
import { GUI } from './libs/dat.gui.module.js';
import { MTLLoader } from './libs/loaders/MTLLoader.js';

let renderer = null, scene = null, camera = null, orbitControls = null, tankGroup = null, turretGroup = null;
let treeGroup = null;
let ambientLight = null;

let mapUrl = "./checker_large.gif";

const tankModel = { obj: './Resources/Tank.obj', texture: './Resources/Tank_texture.jpg' };
const turretModel = { obj: './Resources/Turret.obj', texture: './Resources/Tank_texture.jpg' };
const treeModel = { obj: './Resources/Lowpoly_tree_sample.obj', mtl: './Resources/Lowpoly_tree_sample.mtl' };

async function loadObj(objModelUrl, group,scale) {
    try {
        const objLoader = new OBJLoader();
        const object = await objLoader.loadAsync(objModelUrl.obj, onProgress, onError);

        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = false;
                child.material.map = new THREE.TextureLoader().load(objModelUrl.texture);
                child.material.color.setHex(0x629163);
            }
        });
        object.scale.set(scale,scale,scale);
        group.add(object);
        scene.add(group);
    }
    catch (err) {
        onError(err);
    }
}
async function loadObjMtl(objModelUrl, group, scale)
{
    try
    {
        const mtlLoader = new MTLLoader();

        const materials = await mtlLoader.loadAsync(objModelUrl.mtl, onProgress, onError);

        materials.preload();
        
        const objLoader = new OBJLoader();

        objLoader.setMaterials(materials);

        const object = await objLoader.loadAsync(objModelUrl.obj, onProgress, onError);
    
        object.traverse(function (child) {
            if (child.isMesh)
            {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        console.log(object);

        group.position.y += 1;
        group.scale.set(scale, scale, scale);

        group.add(object);
        scene.add(group);
    }
    catch (err)
    {
        onError(err);
    }
}
function onError(err) { console.error(err); };

function onProgress(xhr) {
    if (xhr.lengthComputable) {

        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log(xhr.target.responseURL, Math.round(percentComplete, 2) + '% downloaded');
    }
}

function main() {
    const canvas = document.getElementById("webglcanvas");

    createScene(canvas);

    update();
}

function update() {
    requestAnimationFrame(function () { update(); });

    renderer.render(scene, camera);

    orbitControls.update();
}

async function createScene(canvas) {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(canvas.width, canvas.height);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000);
    camera.position.set(1, 4, 12);

    orbitControls = new OrbitControls(camera, renderer.domElement);

    ambientLight = new THREE.AmbientLight(0x444444, 0.8);
    scene.add(ambientLight);

    //Create a PointLight and turn on shadows for the light
    const light = new THREE.PointLight(0xffffff, 1, 50);
    light.position.set(0, 6, 6);
    light.castShadow = true; // default false
    scene.add(light);

    //Set up shadow properties for the light
    light.shadow.mapSize.width = canvas.width; // default
    light.shadow.mapSize.height = canvas.height; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 500; // default 



    const map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    let geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ map: map, side: THREE.DoubleSide }));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    tankGroup = new THREE.Object3D();
    turretGroup = new THREE.Object3D();
    treeGroup = new THREE.Object3D();
    tankGroup.position.x = 1;
    tankGroup.position.z = 1;
    tankGroup.rotation.y = 1.9;
    turretGroup.position.x = 1;
    turretGroup.position.y = 1.5;
    turretGroup.position.z = 1;
    loadObj(tankModel, tankGroup, 4);
    loadObj(turretModel, turretGroup, 4);
    loadObjMtl(treeModel, treeGroup, 0.1);
    scene.add(mesh);

    
}

main();