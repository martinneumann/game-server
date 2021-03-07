import { Mesh, VertexData } from "babylonjs";
// eslint-disable-next-line no-unused-vars
import { CustomMeshData } from "../data objects/data-objects";


export class Environment {
    private _scene: any; //it's either undefined or eslint poops its pants

    constructor(scene: any) {
        this._scene = scene;
        this.load();
    }

    public load() {
        Mesh.CreateBox("ground", 24, this._scene);
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
    }
}