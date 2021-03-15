import { Mesh, VertexData, StandardMaterial } from "babylonjs";
// eslint-disable-next-line no-unused-vars
import { CustomMeshData } from "../data objects/data-objects";


export class Environment {
    private _scene: any; //it's either undefined or eslint poops its pants

    constructor(scene: any) {
        this._scene = scene;
        this.load();
    }

    public load() {
        //ground.scaling = new Vector3(1, .02, 1);
    }

    public createMesh(customMeshData: CustomMeshData) {
        console.log(`Creating ground mesh.`);
        const mesh = new Mesh("custom", this._scene);
        const vertexData = new VertexData();

        vertexData.positions = customMeshData.verticesVector;
        vertexData.indices = customMeshData.indicesVector;

        console.log(vertexData);
        vertexData.applyToMesh(mesh);
        console.log(`Done.`);
        const groundMaterial = new StandardMaterial("Ground Material", this._scene);
        mesh.checkCollisions = true;
        mesh.material = groundMaterial;
        groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.6, 0.3);
        groundMaterial.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87);
        //groundMaterial.emissiveColor = new BABYLON.Color3(0, 1, 1);
        groundMaterial.ambientColor = new BABYLON.Color3(0.23, 0.14, 0.53);
    }
}