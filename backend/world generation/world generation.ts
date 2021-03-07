// eslint-disable-next-line no-unused-vars
import { CustomMeshData } from "../../data objects/data-objects";

const perlin = require('perlin-noise');

export class WorldGenerator {

    constructor() {
    }

    /**
     * Generates the noise vector.
     * @param width Width of the matrix.
     * @param height Height of the matrix.
     */
    public generateMatrix(width: number, height: number): Promise<CustomMeshData> {
        return new Promise((resolve) => {
            const xvector: number[] = [];
            const yvector: number[] = [];
            const noiseVector = perlin.generatePerlinNoise(width, height);

            const customMeshData: CustomMeshData = { verticesVector: [], indicesVector: [] };

            for (let x = 0; x < width * height; x++) {
                xvector[x] = x;
            }

            for (let y = 0; y < height * width; y++) {
                yvector[y] = y - 1;
            }

            // Create final vector
            for (let i = 0; i < width * height; i += 3) {
                customMeshData.verticesVector[i] = xvector[i];
                customMeshData.verticesVector[i + 1] = noiseVector[i];
                customMeshData.verticesVector[i + 2] = yvector[i];
            }

            for (let i = 0; i < (width * height) / 3; i++)
                customMeshData.indicesVector[i] = i;

            resolve(customMeshData);
        });

    }
}

