import {deserializeTile, Tile} from "./tile";
import { type ISerializedWorld, World} from "./world";
import {add, getDirection, getDistance, getHexesInLine, getRandomPointWithinDistance, getRing} from "./axial";
import {ref} from "vue";
import type {I2DPoint} from "@/models/I2DPoint";

export interface IObstacleOptions {
    obstacleCount: number;
    maxObstacleSegmentLength: number;
    maxSegments: number;
}
export const defaultObstacleOptions: IObstacleOptions = {
    obstacleCount: 25,
    maxObstacleSegmentLength: 20,
    maxSegments: 10
}

export interface ITilesOptions {
    distance: number, 
    wanderers: number, 
    obstacleOptions: IObstacleOptions,
    serializedWorld: string | null
}

const defaultOptions: ITilesOptions = {
    distance: 100,
    wanderers: 10,
    obstacleOptions: defaultObstacleOptions,
    serializedWorld: null
}


//https://www.redblobgames.com/grids/hexagons/
export const useTilesMap = (options: ITilesOptions = defaultOptions) => {
    const lastTickTime = ref<number>(0);
    const ticks = ref<number>(0);
    let scale = 15;
    let maxDistance = options.distance;
    const tiles: Tile[][] = []
    let state = ref<'progress'|'idle'>('idle');
    let center2D :I2DPoint = {x: 0, y: 0}
    let ctx : CanvasRenderingContext2D | null = null

    
    const generateWorld = (options: ITilesOptions) => {
        const center = new Tile(0, 0);
        tiles.push([center])
        for (let distance = 1; distance < maxDistance; distance++) {
            const ringAt = getRing(center, distance);
            const isObstacle = distance == maxDistance - 1
            ringAt.forEach(coord => {
                tiles[coord.q] = tiles[coord.q] || [];
                tiles[coord.q][coord.r] = new Tile(coord.q, coord.r, isObstacle);
            })
        }

        const newWorld = new World(maxDistance, tiles);
        const obstacleOptions = options.obstacleOptions;

        for (let i = 0; i < obstacleOptions.obstacleCount; i++) {
            const segmentCount = Math.floor(Math.random() * obstacleOptions.maxSegments) + 1;
            //Keep well within boundaries
            let startObstacle = getRandomPointWithinDistance(maxDistance);
            for(let j = 0; j < segmentCount; j++) {
                const segmentLength = Math.floor(Math.random() * obstacleOptions.maxObstacleSegmentLength / 2) + obstacleOptions.maxObstacleSegmentLength / 2;
                let endPoint = add(startObstacle, getRandomPointWithinDistance(segmentLength))
                while(getDistance({q: 0, r: 0}, endPoint) >= maxDistance) {
                    endPoint = add(startObstacle, getRandomPointWithinDistance(segmentLength))
                }

                const hexes = getHexesInLine(startObstacle, endPoint)
                hexes.forEach(hex => {
                    if(Math.random() > 0.2 && newWorld.tiles[hex.q] && newWorld.tiles[hex.q][hex.r])
                        newWorld.tiles[hex.q][hex.r].obstacle = true;
                })

                const endPointThickness = Math.floor(Math.random() * 3) + 1;
                for (let distance = 1; distance < endPointThickness; distance++) {
                    const ringAt = getRing(endPoint, distance);
                    ringAt.forEach(coord => {
                        if(newWorld.tiles[coord.q] && newWorld.tiles[coord.q][coord.r]) {
                            const tile = newWorld.tiles[coord.q][coord.r];
                            tile.obstacle = true;
                        }
                    })
                }

                startObstacle = endPoint;
            }
        }

        for (let x = 0; x < options.wanderers; x++)
            newWorld.createRabbit();
        return newWorld;
    }
    
    const deserializeWorld = (serialized: string): World => {
        const data = JSON.parse(serialized) as ISerializedWorld;

        const center = new Tile(0, 0);
        tiles.push([center])
        for (let distance = 1; distance < data.maxDistance; distance++) {
            const ringAt = getRing(center, distance);
            const isObstacle = distance == data.maxDistance - 1
            ringAt.forEach(coord => {
                tiles[coord.q] = tiles[coord.q] || [];
                tiles[coord.q][coord.r] = new Tile(coord.q, coord.r, isObstacle);
            })
        }
        data.tiles.forEach(t => {
            const tile = deserializeTile(t);
            tiles[tile.q][tile.r] = tile
        });
        const world = new World(data.maxDistance, tiles);
        world.deserialize(data);
        
        maxDistance = data.maxDistance;
        ticks.value = data.tickCount
        
        return world;
    }


    let world: World = options.serializedWorld ? deserializeWorld(options.serializedWorld) : generateWorld(options)
    
    const setCanvas = (canvas: HTMLCanvasElement) => {
        world.log(`Init tiles app with canvas width: ${canvas.width} height: ${canvas.height}`)
        ctx = canvas.getContext('2d');
        if (!ctx) {
            world.log('Failed to get canvas context')
            return
        }
        center2D = {x: canvas.width / 2, y: canvas.height / 2}
        scale = Math.min(canvas.width, canvas.height) / (maxDistance * 3)
    }
    
    const destroy = () => {
        ctx = null;
        tiles.splice(0, tiles.length);
    }

    const generateNewWorld = () => {
        tiles.splice(0, tiles.length);
        lastTickTime.value = 0;
        ticks.value = 0;
        state.value = 'idle';
        world = generateWorld(options);
    }
    
    const tick = () => {
        if(!ctx) return;
        if(state.value == 'progress') return;
        state.value = 'progress';
        let startTime = new Date();
        //Clear
        //Do work

        world.tick(ticks.value)

        //Draw
        world.draw(ctx, scale, center2D)
        //Wait

        let endTime = new Date();
        lastTickTime.value = endTime.getTime() - startTime.getTime();
        ticks.value += 1;

        state.value = 'idle';
    }
    
    const serialize = () => {
        return world.serialize()
    }


    return {world, tick, lastTickTime, ticks, state, setCanvas, destroy, getLogEntries: () => world.logEntries,
        getStats: () => world.getStats(), serialize, generateNewWorld}
}