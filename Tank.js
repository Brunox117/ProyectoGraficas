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
let paredGroup = null;
const materials = {};
const ladrilloURL = "./Resources/ladrilloTexture.jpg";


const tankModel = { obj: './Resources/Tank.obj', texture: './Resources/Tank_texture.jpg' };
const turretModel = { obj: './Resources/Turret.obj', texture: './Resources/Tank_texture.jpg' };
const treeModel = { obj: './Resources/treeSample.obj', mtl: './Resources/treeSample.mtl' };
const rocaModel = { obj: './Resources/roca1.obj', mtl: './Resources/roca1.mtl' };
const torreta = { obj: './Resources/torreta.obj', mtl: './Resources/torreta.mtl' };
const tanque = { obj: './Resources/tanque.obj', mtl: './Resources/tanque.mtl'};
//const arbolModel = { obj: './Resources/arbol2.obj', mtl: './Resources/arbol2.mtl' }; 
//const tanque2Model = {obj: './Resources/tanque2.obj', mtl: './Resources/tanque2.mtl'}
const arbol3Model = { obj: './Resources/arbol3.obj', mtl: './Resources/arbol3.mtl' }; 
const arbol4Model = { obj: './Resources/arbol4.obj', mtl: './Resources/arbol4.mtl' };
const balaModel = { obj: './Resources/bala.obj', mtl: './Resources/bala.mtl' };
const bala2Model = { obj: './Resources/bala2.obj', mtl: './Resources/bala2.mtl' };
const roca2Model = { obj: './Resources/roca2.obj', mtl: './Resources/roca2.mtl' };

//pasto y decoración
const pasto1Model = { obj: './Resources/pasto1.obj', mtl: './Resources/pasto1.mtl' };
const pasto2Model = { obj: './Resources/pasto2.obj', mtl: './Resources/pasto2.mtl' };
const hongoModel = { obj: './Resources/hongo.obj', mtl: './Resources/hongo.mtl' };

async function loadObj(objModelUrl, group,scale,color,x,y,z) {
    try {
        const objLoader = new OBJLoader();
        const object = await objLoader.loadAsync(objModelUrl.obj, onProgress, onError);

        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = false;
                child.material.map = new THREE.TextureLoader().load(objModelUrl.texture);
                child.material.color.setHex(color);
            }
        });
        object.scale.set(scale,scale,scale);
        group.add(object);
        object.position.x = x;
        object.position.y = y;
        object.position.z = z;
        scene.add(group);
    }
    catch (err) {
        onError(err);
    }
}
async function loadObjMtl(objModelUrl, group, scale,x,y,z) 
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
        object.position.x = x;
        object.position.y = y;
        object.position.z = z;
        group.position.y += 1;
        object.scale.set(scale, scale, scale);

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

function createMaterials(mapUrl) {
    // Create a textre phong material for the cube
    // First, create the texture map
    const textureMap = new THREE.TextureLoader().load(mapUrl);
    materials["phong"] = new THREE.MeshPhongMaterial();
    materials["phong-textured"] = new THREE.MeshPhongMaterial({ map: textureMap });
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

    

    loadObj(tankModel, tankGroup, 4,0x629163,1,1,1);
    loadObj(turretModel, turretGroup, 4, 0x629163,1,2.5,1);
    loadObjMtl(arbol3Model, treeGroup, 0.5, 0, -1, 0);
    loadObjMtl(rocaModel, treeGroup, 0.7, -7, -1, 0);
    loadObjMtl(roca2Model, treeGroup, 1, 7, -1, 0);
    loadObjMtl(treeModel, treeGroup, 0.2, -10, -1, 0);
    loadObjMtl(torreta, treeGroup, 0.5, -17, -1, 0);
    loadObjMtl(tanque, treeGroup, 0.5, -17, -1, 0);
    loadObjMtl(balaModel, treeGroup, 0.5, -20, -1, 0);
    loadObjMtl(bala2Model, treeGroup, 0.5, -25, -1, 0);
    loadObjMtl(arbol4Model, treeGroup, 0.5, -30, -1, 0);
    loadObjMtl(pasto1Model, treeGroup, 1, -30, -5, 0);
    loadObjMtl(pasto2Model, treeGroup, 1, -25, -5, 0);
    loadObjMtl(hongoModel, treeGroup, 1, -20, -5, 0);


    scene.add(mesh);

    
}

main();