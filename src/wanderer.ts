import {getNeighbour} from "./axial";
import {IEntity, World} from "./world";

export class Wanderer implements IEntity {
    constructor(private world: World, public q: number, public r: number) {

    }

    tick = () => {
        console.log('Wanderer tick')

        const direction = Math.floor(Math.random() * 6)
        this.move(direction);
    };

    private move = (direction: number) => {
        if (direction < 0 || direction > 5) {
            console.error('Invalid direction')
            return
        }

        const dir = getNeighbour(this, direction);
        this.world.moveEntity(this, dir);
    }

}