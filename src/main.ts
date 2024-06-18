import {Tile} from "./tile";
import {World} from "./world";
import {getRing} from "./axial";


export const initTilesApp = (canvas: HTMLCanvasElement) => {
    console.log(`Init tiles app with canvas width: ${canvas.width} height: ${canvas.height}`)
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get canvas context')
        return
    }

    const scale = 10;
    const maxDistance = 48;
    const tiles: Tile[][] = []
    
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
    
    const world = new World(maxDistance, tiles, {x: canvas.width / 2, y: canvas.height / 2});
    
    for(let x = 0; x< 50; x++)
        world.createWanderer();
    
    
    console.log(`Created ${tiles.length} tiles`)
    const tick = () => {
        console.log('tick')
        //Clear
        //Do work

        world.tick()

        //Draw
        world.draw(ctx, scale)
        //Wait
    }

    setInterval(tick, 50)
    tick()

}


(window as any).initTilesApp = initTilesApp