﻿import {Hex} from "./hex";
import {Wanderer} from "./wanderer";
import {type IEntity} from "./models/IEntity";
import {Tile} from "./tile";
import {add, getDirection, getDistance, getNeighbour, getRandomPointWithinDistance, scale} from "./axial";
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
            const hex = getRandomPointWithinDistance(this.maxDistance - 1);
            const tile = this.tiles[hex.q][hex.r];
            if (!tile.obstacle) {
                return hex;
            }
        } while (true)
    }

    getRandomLocationFrom(origin: IHexPoint, distance: number): Hex {
        do {
            const vec = getRandomPointWithinDistance(distance);
            const hex = add(origin, vec);
            if (this.isValidLocation(hex)) {
                return hex
            }
        } while (true)
    }

    isValidLocation(hex: IHexPoint): boolean {
        const distFromCenter = getDistance({q: 0, r: 0}, hex);
        if (distFromCenter >= this.maxDistance) return false

        const tile = this.tiles[hex.q][hex.r];
        return !tile.obstacle;
    }


    moveEntity(e: IEntity, newLocation: IHexPoint): boolean {
        const origin = new Hex(e.q, e.r);
        if (!this.isValidLocation(newLocation)) return false

        e.r = newLocation.r;
        e.q = newLocation.q;
        this.tiles[origin.q][origin.r].removeEntity(e);
        this.tiles[e.q][e.r].addEntity(e);
        return true;
    }

    bestPath(start: IHexPoint, goal: IHexPoint, viewDistance: number): IHexPoint[] {
        const hexesReachable = this.hexesReachable(start, viewDistance);

        const getPathTo = (g: IHexSteps): IHexPoint[] => {

            let path = [g.hex];
            let current = g;
            while (current.steps > 0 && current.originNeighbour != null) {
                path = [current.originNeighbour!.hex, ...path];
                current = current.originNeighbour!;
            }

            return path;
        }

        const goalHex = hexesReachable.find(h => h.hex.q == goal.q && h.hex.r == goal.r);
        if (goalHex) {
            return getPathTo(goalHex);
        } else {
            //Find the closest hex to the goal
            let closest = hexesReachable[0]
            let closestDistance = getDistance(closest.hex, goal);
            for (let hex of hexesReachable) {
                let distance = getDistance(hex.hex, goal);
                if (distance < closestDistance) {
                    closest = hex;
                    closestDistance = distance;
                }
            }

            if (closest.hex.q == start.q && closest.hex.r == start.r) {
                // We are already at the closest hex, 
                // probably hitting an obstacle. 
                // Return empty array to let it know we can't find the best path.
                return [];
            }
            return getPathTo(closest);
        }
    }


    hexesReachable(start: IHexPoint, distance: number): IHexSteps[] {
        const visited: IHexSteps[] = [];
        visited.push({hex: start, originNeighbour: null, steps: 0});
        const fringes: IHexSteps[][] = [];
        fringes.push([visited[0]]);
        for (let k = 1; k <= distance; k++) {
            fringes.push([]);
        }
        for (let k = 1; k <= distance; k++) {
            for (let hex of fringes[k - 1]) {
                for (let dir = 0; dir < 6; dir++) {
                    const neighbor = getNeighbour(hex.hex, dir);
                    if (!this.tiles[neighbor.q][neighbor.r].obstacle &&
                        visited.every(v => v.hex.q != neighbor.q || v.hex.r != neighbor.r)) {
                        const step = {
                            hex: neighbor,
                            originNeighbour: hex,
                            steps: k
                        }
                        visited.push(step);
                        fringes[k].push(step);
                    }
                }
            }
        }
        return visited;
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

export interface IHexSteps {
    hex: IHexPoint;
    originNeighbour: IHexSteps | null;
    steps: number;
}
