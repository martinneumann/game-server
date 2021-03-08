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
            const noiseVector = perlin.generatePerlinNoise(width, height);
            const scale: number = Math.max(width, height) / 10;

            const customMeshData: CustomMeshData = { verticesVector: [], indicesVector: [] };

            for (let row = 0; row < height; row++) {
                for (let col = 0; col < width; col++ ) {
                    let index = (row * width + col) * 3;
                    customMeshData.verticesVector[index] = row - height / 2;
                    customMeshData.verticesVector[index + 1] = col - width / 2;
                    customMeshData.verticesVector[index + 2] = noiseVector[index / 3] * scale;

                }
            }

            // Create indices
            // We need 2 triangles for every 4 vertices, (6 / 4) * width * height indices
            for (let row = 0; row < height - 1; row ++){
                for (let col = 0; col < width - 1; col ++) {
                    let baseOffset = (row * width + col);
                    let indexOffset = baseOffset * 6;
                    // first triangle
                    customMeshData.indicesVector[indexOffset] = baseOffset + 1;
                    customMeshData.indicesVector[indexOffset + 1] = baseOffset + width;
                    customMeshData.indicesVector[indexOffset + 2] = baseOffset;
                    // second triangle
                    customMeshData.indicesVector[indexOffset + 3] = baseOffset + width + 1;
                    customMeshData.indicesVector[indexOffset + 4] = baseOffset + width;
                    customMeshData.indicesVector[indexOffset + 5] = baseOffset + 1;
                }
            }
        
            resolve(customMeshData);
        });

    }
}

