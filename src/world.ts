import {add, getDirection, Hex, IHexPoint, IPoint, neighbour, scale, Tile} from "./tile";

export class World {

    private entities: IEntity[] = [];

    constructor(public maxDistance: number, public tiles: Tile[][], private center: IPoint) {
        console.log(`Created world with distance ${maxDistance} and having ${tiles.length} tiles`)
    }

    createWanderer() {
        const distance = Math.floor(Math.random() * this.maxDistance);
        const direction = Math.floor(Math.random() * 6);
        let hex = add(new Hex(0,0), scale(getDirection(direction), distance));
        const tile = this.tiles[hex.q][hex.r];
        const w = new Wanderer(this, tile.q, tile.r);
        tile.addEntity(w);
        this.entities.push(w);
        return w;
    }

    tick() {
        console.log('World tick')
        this.entities.forEach(e => e.tick())
    }


    draw(ctx: CanvasRenderingContext2D, scale: number) {
        
        for(let q = -1 * this.maxDistance; q <= this.maxDistance; q++) {
            for(let r = -1 * this.maxDistance; r <= this.maxDistance; r++) {
                if(!this.tiles[q] || !this.tiles[q][r]) continue;
                this.tiles[q][r].draw(ctx, scale, this.center)
            }
        }
    }

    moveEntity(e: IEntity, dir: Hex) {
        this.tiles[e.q][e.r].removeEntity(e);
        e.r = dir.r;
        e.q = dir.q;
        if(!this.tiles[e.q] || !this.tiles[e.q][e.r]) return;
        this.tiles[e.q][e.r].addEntity(e);
        console.log(`Moved ${e} to ${e.r}, ${e.q}`)
    }
}

export interface IEntity extends IHexPoint {
    tick(): void;
}

export class Wanderer implements IEntity {
    constructor(private world: World, public q: number, public r: number) {

    }

    tick = () => {
        console.log('Wanderer tick')

        const direction = Math.floor(Math.random() * 6)
        this.move(direction);
    };

    private move = (direction: number) => {
        if (direction < 0 || direction > 5) {
            console.error('Invalid direction')
            return
        }

        const dir = neighbour(this, direction);
        this.world.moveEntity(this, dir);
    }

}