import {IEntity} from "./world";

//https://www.redblobgames.com/grids/hexagons/
function calculateApothem(radius: number): number {
    const degrees30InRadians = Math.PI / 6; // Convert 30 degrees to radians
    return radius * Math.cos(degrees30InRadians);
}

export interface IPoint {
    x: number;
    y: number;
}

export interface IHexPoint {
    q: number;
    r: number;
}

export class Hex implements IHexPoint {
    constructor(public q: number, public r: number) {
    }
}

const sqrt3 = Math.sqrt(3);
const sqrt3div2 = Math.sqrt(3) / 2;
const threediv2 = 3. / 2;

function hexToPixel(hex: IHexPoint, size: number): IPoint {
    var x = size * (sqrt3 * hex.q + sqrt3div2 * hex.r)
    var y = size * (threediv2 * hex.r)
    return {x, y}
}

export const directionVectors = [
    new Hex(+1, 0), new Hex(+1, -1), new Hex(0, -1),
    new Hex(-1, 0), new Hex(-1, +1), new Hex(0, +1),
]

export function getDirection(direction: number): Hex {
    return directionVectors[direction];
}

export function add(hex: Hex, vec: Hex) : Hex {
    return new Hex(hex.q + vec.q, hex.r + vec.r)
}

export function neighbour(hex: Hex, dir: number) : Hex {
    return add(hex, getDirection(dir));
}

export function scale (hex: Hex, factor: number): Hex {
    return new Hex(hex.q * factor, hex.r * factor);
}

export function ring(center: Hex, radius: number): Hex[] {
    const results: Hex[] = [];
    let hex = add(center, scale(getDirection(4), radius));
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < radius; j++) {
            results.push(hex);
            hex = neighbour(hex, i);
        }
    }
    return results;
}


export class Tile implements IHexPoint {

    private entities: IEntity[] = [];
    private dirty = true;
    public s: number;

    constructor(public q: number, public r: number) {
        this.s = -q - r;
    }


    draw(ctx: CanvasRenderingContext2D, scale: number, center: IPoint) {
        if (!this.dirty) return;
        ctx.fillStyle = this.entities.length == 0 ? 'green' : 'red'
        ctx.strokeStyle = 'darkgreen'
        ctx.lineWidth = 1
        ctx.beginPath()

        // Define the center and radius of the hexagon
        const apothem = calculateApothem(scale);


        let distance = hexToPixel(this, scale);
        let centerX = center.x + distance.x
        let centerY = center.y + distance.y
        
        console.log(`Drawing tile at ${centerX}, ${centerY} - ${this.q}, ${this.r}`)

        const topOuterY = centerY - scale;
        const bottomOuterY = centerY + scale;
        const topInnerY = centerY - scale / 2;
        const bottomInnerY = centerY + scale / 2;
        const leftX = centerX - apothem;
        const rightX = centerX + scale;

        // Move to the first vertex
        ctx.moveTo(centerX, topOuterY);
        ctx.lineTo(rightX, topInnerY);
        ctx.lineTo(rightX, bottomInnerY);
        ctx.lineTo(centerX, bottomOuterY);
        ctx.lineTo(leftX, bottomInnerY);
        ctx.lineTo(leftX, topInnerY);
        ctx.lineTo(centerX, topOuterY);

        // Close the path and stroke it
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        this.dirty = false
    }

    clearEntities() {
        if (this.entities.length > 0)
            this.dirty = true;
        this.entities = [];

    }

    addEntity(entity: IEntity) {
        if (this.entities.indexOf(entity) == -1) {
            this.dirty = true;
            this.entities.push(entity);
        }
    }

    removeEntity(e: IEntity) {
        const idx = this.entities.indexOf(e);
        if (idx != -1) {
            this.dirty = true;
            this.entities.splice(idx, 1);
        }
    }
} 