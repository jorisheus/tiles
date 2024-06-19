import {Tile} from "./tile";
import {World} from "./world";
import {add, getDirection, getDistance, getHexesInLine, getRandomPointWithinDistance, getRing} from "./axial";
import {ref} from "vue";
import type {I2DPoint} from "@/models/I2DPoint";

export interface IObstacleOptions {
    obstacleCount: number;
    maxObstacleSegmentLength: number;
    maxSegments: number;
}
const defaultObstacleOptions: IObstacleOptions = {
    obstacleCount: 25,
    maxObstacleSegmentLength: 20,
    maxSegments: 10
}

//https://www.redblobgames.com/grids/hexagons/
export const useTilesMap = (distance: number, wanderers: number, obstacleOptions: IObstacleOptions = defaultObstacleOptions) => {
    const lastTickTime = ref<number>(0);
    const ticks = ref<number>(0);
    let scale = 15;
    const maxDistance = distance;
    const tiles: Tile[][] = []
    let state = ref<'progress'|'idle'>('idle');

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

    let center2D :I2DPoint = {x: 0, y: 0} 
    let ctx : CanvasRenderingContext2D | null = null
    const world = new World(maxDistance, tiles);
    
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
                if(Math.random() > 0.2 && world.tiles[hex.q] && world.tiles[hex.q][hex.r])
                    world.tiles[hex.q][hex.r].obstacle = true;
            })
            
            const endPointThickness = Math.floor(Math.random() * 3) + 1;
            for (let distance = 1; distance < endPointThickness; distance++) {
                const ringAt = getRing(endPoint, distance);
                ringAt.forEach(coord => {
                    if(world.tiles[coord.q] && world.tiles[coord.q][coord.r]) {
                        const tile = world.tiles[coord.q][coord.r];
                        tile.obstacle = true;
                    }
                })
            }
            
            startObstacle = endPoint;
        }
    }

    for (let x = 0; x < wanderers; x++)
        world.createWanderer();
    
    const setCanvas = (canvas: HTMLCanvasElement) => {
        console.log(`Init tiles app with canvas width: ${canvas.width} height: ${canvas.height}`)
        ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Failed to get canvas context')
            return
        }
        center2D = {x: canvas.width / 2, y: canvas.height / 2}
        scale = Math.min(canvas.width, canvas.height) / (maxDistance * 3)
    }
    
    const destroy = () => {
        ctx = null;
        tiles.splice(0, tiles.length);
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


    return {world, tick, lastTickTime, ticks, state, setCanvas, destroy,
        getStats: () => world.getStats()
        
    }
}