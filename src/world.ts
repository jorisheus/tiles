﻿import {Hex} from "./hex";
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
        this.entities.forEach(e => e.tick())
        this.foreachTile((tile) => {tile.tick()})
    }


    draw(ctx: CanvasRenderingContext2D, scale: number, center: I2DPoint) {
        this.foreachTile((tile) => {tile.draw(ctx, scale, center)})
    }

    moveEntity(e: IEntity, dir: Hex) {
        const origin = new Hex(e.q, e.r);
        if(!this.tiles[dir.q] || !this.tiles[dir.q][dir.r]) {
            return;
        }

        e.r = dir.r;
        e.q = dir.q;
        this.tiles[origin.q][origin.r].removeEntity(e);
        this.tiles[e.q][e.r].addEntity(e);
    }

    setGoal(e: IEntity, previousGoal: IHexPoint | null, goal: IHexPoint) {
        if(previousGoal)
            this.tiles[previousGoal.q][previousGoal.r].removeEntityGoal(e);
        this.tiles[goal.q][goal.r].addEntityGoal(e);
    }

    private foreachTile(callback: (tile: Tile) => void) {
        for(let q = -1 * this.maxDistance; q <= this.maxDistance; q++) {
            for(let r = -1 * this.maxDistance; r <= this.maxDistance; r++) {
                if(!this.tiles[q] || !this.tiles[q][r]) continue;
                callback(this.tiles[q][r]);
            }
        }
    }
}

