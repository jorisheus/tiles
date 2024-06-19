import {Tile} from "./tile";
import {World} from "./world";
import {getRing} from "./axial";
import {ref} from "vue";
import type {I2DPoint} from "@/models/I2DPoint";


export const useTilesMap = (distance: number, wanderers: number) => {
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
        ringAt.forEach(coord => {
            tiles[coord.q] = tiles[coord.q] || [];
            tiles[coord.q][coord.r] = new Tile(coord.q, coord.r);
            console.log(`Created tile at ${coord.q}, ${coord.r}`)
        })
    }

    let center2D :I2DPoint = {x: 0, y: 0} 
    let ctx : CanvasRenderingContext2D | null = null
    const world = new World(maxDistance, tiles);

    for (let x = 0; x < wanderers; x++)
        world.createWanderer();


    console.log(`Created ${tiles.length} tiles`)
    
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
    const tick = () => {
        if(!ctx) return;
        if(state.value == 'progress') return;
        state.value = 'progress';
        let startTime = new Date();
        //Clear
        //Do work

        world.tick()

        //Draw
        world.draw(ctx, scale, center2D)
        //Wait

        let endTime = new Date();
        lastTickTime.value = endTime.getTime() - startTime.getTime();
        ticks.value += 1;

        state.value = 'idle';
    }


    return {world, tick, lastTickTime, ticks, state, setCanvas}
}