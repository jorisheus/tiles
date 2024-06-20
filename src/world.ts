import {Hex} from "./hex";
import {Rabbit} from "./rabbit";
import {type IEntity} from "./models/IEntity";
import {Tile} from "./tile";
import {add, getDirection, getDistance, getNeighbour, getRandomPointWithinDistance, scale} from "./axial";
import {type I2DPoint} from "./models/I2DPoint";
import type {IHexPoint} from "@/models/IHexPoint";

export class World {

    private entities: IEntity[] = [];
    private births: number = 0;
    private deaths: number = 0;
    public logEntries: string[] = [];

    constructor(public maxDistance: number, public tiles: Tile[][]) {
        this.log(`Created world with distance ${maxDistance} and having ${tiles.length} tiles`)
    }

    createRabbit() {
        let hex = this.getRandomLocation();
        const tile = this.safeGetTile(hex);
        if(!tile) return;
        const w = new Rabbit(this, tile);
        tile.addEntity(w);
        this.entities.push(w);
        this.births++;
        return w;
    }

    tick(tickCount: number) {
        this.entities.forEach(e => e.tick(tickCount))
        this.foreachTile((tile) => {
            tile.tick()
        })
    }
    
    log(message: string) {
        this.logEntries = [message, ...this.logEntries.slice(0, 19)]
        console.log(message)
    }

    public getStats() {
        return {
            entities: this.entities.length,
            births: this.births,
            deaths: this.deaths
        }
    }

    draw(ctx: CanvasRenderingContext2D, scale: number, center: I2DPoint) {
        this.foreachTile((tile) => {
            tile.draw(ctx, scale, center)
        })
    }

    getRandomLocation(): Hex {
        do {
            const hex = getRandomPointWithinDistance(this.maxDistance - 1);
            const tile = this.safeGetTile(hex);
            if (tile != null && !tile.obstacle) {
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

        const tile = this.safeGetTile(hex);
        return tile != null && !tile.obstacle;
    }


    moveEntity(e: IEntity, newLocation: IHexPoint): boolean {
        const origin = new Hex(e.location.q, e.location.r);
        if (!this.isValidLocation(newLocation)) return false

        e.location.r = newLocation.r;
        e.location.q = newLocation.q;
        this.safeGetTile(origin)?.removeEntity(e);
        this.safeGetTile(e.location)?.addEntity(e);
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
                    const tile = this.safeGetTile(neighbor)
                    if (tile != null && !tile.obstacle &&
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
            this.safeGetTile(previousGoal)?.removeEntityGoal(e);
        this.safeGetTile(goal)?.addEntityGoal(e);
    }
    
    private safeGetTile(loc: IHexPoint): Tile | null {
        if (!this.tiles[loc.q]) return null;
        return this.tiles[loc.q][loc.r] || null;
    }

    private foreachTile(callback: (tile: Tile) => void) {
        for (let q = -1 * this.maxDistance; q <= this.maxDistance; q++) {
            for (let r = -1 * this.maxDistance; r <= this.maxDistance; r++) {
                if (!this.tiles[q] || !this.tiles[q][r]) continue;
                callback(this.tiles[q][r]);
            }
        }
    }

    removeEntity(entity: IEntity, goal: IHexPoint | null) {
        this.safeGetTile(entity.location)?.removeEntity(entity);
        if (goal)
            this.safeGetTile(goal)?.removeEntityGoal(entity);
        this.entities = this.entities.filter(e => e != entity);
        this.deaths++;
    }

    addEntity(e: IEntity) {
        this.entities.push(e);
        this.safeGetTile(e.location)?.addEntity(e);
        this.births++;
    }
}

export interface IHexSteps {
    hex: IHexPoint;
    originNeighbour: IHexSteps | null;
    steps: number;
}
