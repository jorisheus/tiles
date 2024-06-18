import {IEntity} from "./world";
import {IHexPoint} from "./models/IHexPoint";
import {I2DPoint} from "./models/I2DPoint";
import {hexToPixel} from "./axial";

//https://www.redblobgames.com/grids/hexagons/
function calculateApothem(radius: number): number {
    const degrees30InRadians = Math.PI / 6; // Convert 30 degrees to radians
    return radius * Math.cos(degrees30InRadians);
}

export class Tile implements IHexPoint {

    private entities: IEntity[] = [];
    private dirty = true;
    public s: number;
    private lastEntityVisit = 1000;

    constructor(public q: number, public r: number) {
        this.s = -q - r;
    }


    draw(ctx: CanvasRenderingContext2D, scale: number, center: I2DPoint) {
        if (!this.dirty) return;
        
        const red = this.lastEntityVisit < 100 ? (30 + Math.floor(4 * (50 - this.lastEntityVisit))) : 30;

        let color = `rgb(${red} 90 30)`
        ctx.fillStyle = color
        ctx.strokeStyle = 'black'
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
        //ctx.stroke();

        this.dirty = false
    }
    
    tick() {
        if (this.entities.length > 0)
            this.lastEntityVisit = 0;
        else if(this.lastEntityVisit < 50) {
            this.lastEntityVisit++;
            this.dirty = true;
        }
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