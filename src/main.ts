import {Tile} from "./tile";



export const initTilesApp = (canvas: HTMLCanvasElement) => {
    console.log(`Init tiles app with canvas width: ${canvas.width} height: ${canvas.height}`)
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get canvas context')
        return
    }
    
    const scale = 50;
    const tiles : Tile[] = []
    for (let x = 1; x < canvas.width / scale / 3; x++) {
        for (let y = 1; y < canvas.height / scale; y++) {
            tiles.push(new Tile(x, y))
        }
    }
    
    console.log(`Created ${tiles.length} tiles`)


    ctx.fillStyle = 'aliceblue'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const tick = () => {
        console.log('tick')
        //Clear
        //Do work

        //Draw
        tiles.forEach(tile => tile.draw(ctx, scale))

        //Wait
    }

    //setInterval(tick, 1000)
    tick()
    
}


(window as any).initTilesApp = initTilesApp