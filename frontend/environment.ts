import { Mesh, Vector3 } from "babylonjs";


export class Environment {
    private _scene: any; //it's either undefined or eslint poops its pants

    constructor(scene: any){
        this._scene = scene;
        this.load();
    }

    public load() {
        var ground = Mesh.CreateBox("ground", 24, this._scene);
        ground.scaling = new Vector3(1,.02,1);
    }
}