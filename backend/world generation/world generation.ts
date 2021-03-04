const perlin = require('perlin-noise');

export class WorldTerrainMatrix {

    public WorldTerrainMatrix() { }

    private noiseVector: number[] = [];

    /**
     * Generates the noise vector.
     * @param width Width of the matrix.
     * @param height Height of the matrix.
     */
    public generateMatrix(width: number, height: number) {
        this.noiseVector = perlin.generatePerlinNoise(width, height);
    }

    /**
     * 
     */
    public getNoiseVector() {
        return this.noiseVector;
    }
}

