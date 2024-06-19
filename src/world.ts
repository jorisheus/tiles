import {Hex} from "./hex";
import {Wanderer} from "./wanderer";
import {type IEntity} from "./models/IEntity";
import {Tile} from "./tile";
import {add, getDirection, scale} from "./axial";
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
        while (true) {
            const hex = new Hex(Math.floor(this.maxDistance - Math.random() * this.maxDistance * 2),
                Math.floor(this.maxDistance - Math.random() * this.maxDistance * 2));
            if (this.locationExists(hex)) return hex;
        }
    }

    locationExists(location: Hex): boolean {
        return !!this.tiles[location.q] && !!this.tiles[location.q][location.r];
    }

    moveEntity(e: IEntity, dir: Hex): boolean {
        const origin = new Hex(e.q, e.r);
        if (!this.tiles[dir.q] || !this.tiles[dir.q][dir.r]) {
            return false;
        }

        e.r = dir.r;
        e.q = dir.q;
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

