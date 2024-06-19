import {type IHexPoint} from "./models/IHexPoint";
import {type I2DPoint} from "./models/I2DPoint";
import {hexToPixel} from "./axial";
import {type IEntity} from "./models/IEntity";

function calculateApothem(radius: number): number {
    const degrees30InRadians = Math.PI / 6; // Convert 30 degrees to radians
    return radius * Math.cos(degrees30InRadians);
}

export class Tile implements IHexPoint {

    private entities: IEntity[] = [];
    private goals: IEntity[] = [];
    private dirty = true;
    public s: number;
    private lastEntityVisit = 1000;
    highlight: number = 0;

    constructor(public q: number, public r: number, public obstacle: boolean = false) {
        this.s = -q - r;
    }


    draw(ctx: CanvasRenderingContext2D, scale: number, center: I2DPoint) {
        if (!this.dirty) return;
        
        let color = 'grey'
        if(!this.obstacle) {
            if(this.entities.length > 0 && this.entities[0].sleeping())
                color = 'yellow'
            else {
                const red = this.entities.length > 0 ? 255 : this.lastEntityVisit < 10 ? (30 + Math.floor(10 * (10 - this.lastEntityVisit))) : 30;
                const blue = this.goals.length > 0 ? 255 : 30;
                const green = (this.goals.length > 0 ? 30 : 90) + 5 * (5 - Math.abs(5 - this.highlight))

                color = `rgb(${red} ${green} ${blue})`    
            }
        }
        ctx.fillStyle = color
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 1
        ctx.beginPath()

        // Define the center and radius of the hexagon
        const apothem = calculateApothem(scale);

        let distance = hexToPixel(this, scale);
        let centerX = center.x + distance.x
        let centerY = center.y + distance.y

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
        else if(this.lastEntityVisit < 10) {
            this.lastEntityVisit++;
            this.dirty = true;
        }

        if(this.highlight > 0) {
            this.highlight--;
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

    addEntityGoal(entity: IEntity) {
        if (this.goals.indexOf(entity) == -1) {
            this.dirty = true;
            this.goals.push(entity);
        }
    }

    removeEntityGoal(e: IEntity) {
        const idx = this.goals.indexOf(e);
        if (idx != -1) {
            this.dirty = true;
            this.goals.splice(idx, 1);
        }
    }
    
    highlightTile(hightlight: boolean = true) {
        this.highlight = hightlight ? 10 : 0;
        this.dirty = true;
    }
} 