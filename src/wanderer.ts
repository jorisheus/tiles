import {add, getDirection, getFirstStepFromAToB, scale, subtract} from "./axial";
import {World} from "./world";
import type {IEntity} from "@/models/IEntity";
import {Hex} from "@/hex";
import type {IHexPoint} from "@/models/IHexPoint";

export class Wanderer implements IEntity {
    constructor(private world: World, public q: number, public r: number) {
        this.goal = this.world.getRandomLocation();
        this.world.setGoal(this, null, this.goal);
    }

    private goal: IHexPoint = {q: 0, r: 0}

    tick = () => {
        //const distance = getDistance(this, this.goal);
        if(this.goal.q == this.q && this.goal.r == this.r) {
            const newGoal = this.world.getRandomLocation();
            this.world.setGoal(this, this.goal, newGoal);
            this.goal = newGoal;
        }

        this.moveToLocation(getFirstStepFromAToB(this, this.goal))
    };

    private moveToDirection = (direction: IHexPoint) => {
        const location = add(this, direction);
        this.moveToLocation(location)
    }
    
    private moveToLocation = (location: IHexPoint) => {
        if(!this.world.moveEntity(this, location)) {
            const hex = add(this, getDirection(Math.floor(Math.random() * 6)))
            this.world.moveEntity(this, hex)
        }
    }

}