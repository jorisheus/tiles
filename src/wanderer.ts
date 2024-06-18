import {add, getDirection, getDistance, getNeighbour, scale, subtract} from "./axial";
import {World} from "./world";
import type {IEntity} from "@/models/IEntity";
import {Hex} from "@/hex";
import type {LiHTMLAttributes} from "vue";
import type {IHexPoint} from "@/models/IHexPoint";

export class Wanderer implements IEntity {
    constructor(private world: World, public q: number, public r: number) {
        const distance = Math.floor(Math.random() * this.world.maxDistance);
        const direction = Math.floor(Math.random() * 6);
        this.goal = add(new Hex(0,0), scale(getDirection(direction), distance));
        this.world.setGoal(this, null, this.goal);
    }

    private goal: IHexPoint = {q: 0, r: 0}

    tick = () => {
        //const distance = getDistance(this, this.goal);
        if(this.goal.q == this.q && this.goal.r == this.r) {
            console.log('Goal reached!')

            const distance = Math.floor(Math.random() * this.world.maxDistance);
            const direction = Math.floor(Math.random() * 6);
            const newGoal = add(new Hex(0,0), scale(getDirection(direction), distance));
            this.world.setGoal(this, this.goal, newGoal);
            this.goal = newGoal;
        }
        

        const vec = subtract(this.goal, this);
        if (Math.abs(vec.q) > Math.abs(vec.r)) {
            if (vec.q > 0)
                this.move(new Hex(+1, -1));
            else
                this.move(new Hex(-1, +1));
        } else if (Math.abs(vec.r) > Math.abs(vec.s)) {
            if (vec.r < 0)
                this.move(new Hex(+1, -1));
            else this.move(new Hex(-1, +1));
        } else {
            if (vec.s > 0)
                this.move(new Hex(-1, 0));
            else this.move(new Hex(+1, 0));
        }
    };

    private move = (direction: IHexPoint) => {
        const dir = add(this, direction);
        this.world.moveEntity(this, dir);
    }

}