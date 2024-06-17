import {Hex, ring, Tile} from "./tile";
import {World} from "./world";


export const initTilesApp = (canvas: HTMLCanvasElement) => {
    console.log(`Init tiles app with canvas width: ${canvas.width} height: ${canvas.height}`)
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get canvas context')
        return
    }

    const scale = 30;
    const maxDistance = 8;
    const tiles: Tile[][] = []
    
    const center = new Tile(0, 0);
    tiles.push([center])
    for (let distance = 1; distance < maxDistance; distance++) {
        const ringAt = ring(center, distance);
        ringAt.forEach(coord => {
            tiles[coord.q] = tiles[coord.q] || [];
            tiles[coord.q][coord.r] = new Tile(coord.q, coord.r);
            console.log(`Created tile at ${coord.q}, ${coord.r}`)
        })
    }
    
    const world = new World(maxDistance, tiles, {x: canvas.width / 2, y: canvas.height / 2});
    
    const wanderer2 = world.createWanderer();
    const wanderer1 = world.createWanderer();
    const wanderer3 = world.createWanderer();

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

    setInterval(tick, 1000)
    tick()

}


(window as any).initTilesApp = initTilesApp