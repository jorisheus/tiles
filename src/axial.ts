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

export function getRandomPointWithinDistance(distance: number): Hex {
    const q = Math.floor(distance - Math.random() * distance * 2);
    //distance = (abs(q) + abs(q + r) + abs(r)) / 2
    //r = 2 * distance - abs(q) - abs(q + r)
    const maxR = distance - Math.abs(q);
    let r;
    if (q >= 0) {
        r = Math.floor(-Math.random() * maxR);
    } else {
        r = Math.floor(Math.random() * maxR);
    }
    const result = new Hex(q, r);
    return result;
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

function round(frac: IHexPoint) : Hex {
    let q = Math.round(frac.q);
    let r = Math.round(frac.r);
    const fracS = -frac.q - frac.r;
    let s = Math.round(fracS);
    let q_diff = Math.abs(q - frac.q);
    let r_diff = Math.abs(r - frac.r);
    let s_diff = Math.abs(s - fracS);
    if (q_diff > r_diff && q_diff > s_diff) {
        q = -r - s;
    } else if (r_diff > s_diff) {
        r = -q - s;
    }
    return new Hex(q, r);
}

//Linear interpolation for floats
function lerpFloat(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

//** Linear interpolation for hexes
// * @param a - start hex
// * @param b - end hex
// * @param t - interpolation factor (where on the line to calculate the point)
export function lerp(a: IHexPoint, b: IHexPoint, t: number): Hex {
    return round({
        q: lerpFloat(a.q, b.q, t),
        r: lerpFloat(a.r, b.r, t),
    });
}

export function getHexesInLine(a: IHexPoint, b: IHexPoint): Hex[] {
    const N = getDistance(a, b);
    const results: Hex[] = [];
    for (let i = 0; i <= N; i++) {
        results.push(round(lerp(a, b, 1.0 / N * i)));
    }
    return results;
}

export function getFirstStepFromAToB(a: IHexPoint, b: IHexPoint): Hex {
    const N = getDistance(a, b);
    return round(lerp(a, b, 1.0 / N));
}


/*
function hex_reachable(start, movement):
var visited = set() # set of hexes
add start to visited
var fringes = [] # array of arrays of hexes
fringes.append([start])

for each 1 < k ≤ movement:
    fringes.append([])
for each hex in fringes[k-1]:
for each 0 ≤ dir < 6:
var neighbor = hex_neighbor(hex, dir)
if neighbor not in visited and not blocked:
    add neighbor to visited
fringes[k].append(neighbor)

return visited*/
