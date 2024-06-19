import {Hex} from "./hex";
import {Wanderer} from "./wanderer";
import {type IEntity} from "./models/IEntity";
import {Tile} from "./tile";
import {add, getDirection, getDistance, getRandomPointWithinDistance, scale} from "./axial";
import {type I2DPoint} from "./models/I2DPoint";
import type {IHexPoint} from "@/models/IHexPoint";

export class World {

    private entities: IEntity[] = [];

    constructor(public maxDistance: number, public tiles: Tile[][]) {
        console.log(`Created world with distance ${maxDistance} and having ${tiles.length} tiles`)
    }

    createWanderer() {
        let hex = this.getRandomLocation();
        const tile = this.tiles[hex.q][hex.r];
        const w = new Wanderer(this, tile.q, tile.r);
        tile.addEntity(w);
        this.entities.push(w);
        return w;
    }

    tick() {
        this.entities.forEach(e => e.tick())
        this.foreachTile((tile) => {
            tile.tick()
        })
    }


    draw(ctx: CanvasRenderingContext2D, scale: number, center: I2DPoint) {
        this.foreachTile((tile) => {
            tile.draw(ctx, scale, center)
        })
    }

    getRandomLocation(): Hex {
        do {
            const hex = getRandomPointWithinDistance(this.maxDistance);
            const tile = this.tiles[hex.q][hex.r];
            if (!tile.obstacle) {
                return hex;
            }
        } while (true)
    }

    moveEntity(e: IEntity, newLocation: IHexPoint): boolean {
        const origin = new Hex(e.q, e.r);
        const distance = getDistance({q: 0, r: 0}, newLocation);
        if (distance >= this.maxDistance) {
            return false;
        }
        if(this.tiles[newLocation.q][newLocation.r].obstacle) return false;

        e.r = newLocation.r;
        e.q = newLocation.q;
        this.tiles[origin.q][origin.r].removeEntity(e);
        this.tiles[e.q][e.r].addEntity(e);
        return true;
    }

    setGoal(e: IEntity, previousGoal: IHexPoint | null, goal: IHexPoint) {
        if (previousGoal)
            this.tiles[previousGoal.q][previousGoal.r].removeEntityGoal(e);
        this.tiles[goal.q][goal.r].addEntityGoal(e);
    }

    private foreachTile(callback: (tile: Tile) => void) {
        for (let q = -1 * this.maxDistance; q <= this.maxDistance; q++) {
            for (let r = -1 * this.maxDistance; r <= this.maxDistance; r++) {
                if (!this.tiles[q] || !this.tiles[q][r]) continue;
                callback(this.tiles[q][r]);
            }
        }
    }
}

