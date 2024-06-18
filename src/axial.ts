import {Hex} from "./hex";
import {type IHexPoint} from "./models/IHexPoint";
import {type I2DPoint} from "./models/I2DPoint";

const sqrt3 = Math.sqrt(3);
const sqrt3div2 = Math.sqrt(3) / 2;
const threediv2 = 3. / 2;

export function hexToPixel(hex: IHexPoint, size: number): I2DPoint {
    const x = size * (sqrt3 * hex.q + sqrt3div2 * hex.r)
    const y = size * (threediv2 * hex.r)
    return {x, y}
}

export const directionVectors = [
    new Hex(+1, 0), new Hex(+1, -1), new Hex(0, -1),
    new Hex(-1, 0), new Hex(-1, +1), new Hex(0, +1),
]

export function getDirection(direction: number): Hex {
    return directionVectors[direction];
}

export function add(hex: IHexPoint, vec: IHexPoint) : Hex {
    return new Hex(hex.q + vec.q, hex.r + vec.r)
}
export function subtract(hex: IHexPoint, vec: IHexPoint) : Hex {
    return new Hex(hex.q - vec.q, hex.r - vec.r)
}

export function getDistance(a: IHexPoint, b: IHexPoint): number {
    const vector = subtract(a, b);
    return (Math.abs(vector.q) + Math.abs(vector.q + vector.r) + Math.abs(vector.r)) / 2;
}

export function getNeighbour(hex: IHexPoint, dir: number) : Hex {
    return add(hex, getDirection(dir));
}

export function scale (hex: IHexPoint, factor: number): Hex {
    return new Hex(hex.q * factor, hex.r * factor);
}

export function getRing(center: IHexPoint, radius: number): Hex[] {
    const results: Hex[] = [];
    let hex = add(center, scale(getDirection(4), radius));
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < radius; j++) {
            results.push(hex);
            hex = getNeighbour(hex, i);
        }
    }
    return results;
}