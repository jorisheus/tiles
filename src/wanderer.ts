import {add, getDirection, getFirstStepFromAToB, scale, subtract} from "./axial";
import {World} from "./world";
import type {IEntity} from "@/models/IEntity";
import type {IHexPoint} from "@/models/IHexPoint";

export class Wanderer implements IEntity {
    constructor(private world: World, public q: number, public r: number) {
        this.goal = this.world.getRandomLocation();
        this.world.setGoal(this, null, this.goal);
    }

    private goal: IHexPoint = {q: 0, r: 0}
    private tempGoal: IHexPoint | null = null
    private pathToGoal: IHexPoint[] = []
    private sleepCount = 0;

    tick = () => {
        if (this.sleepCount > 0) {
            this.sleepCount--;
            return;
        }
        
        //const distance = getDistance(this, this.goal);
        if (this.goal.q == this.q && this.goal.r == this.r) {
            const newGoal = this.world.getRandomLocation();
            this.world.setGoal(this, this.goal, newGoal);
            this.goal = newGoal;

            this.pathToGoal = this.world.bestPath(this, this.goal, 20)
            // Just a little break...
            this.sleepCount = 10;
            return;
        }

        if (this.pathToGoal.length > 0) {
            this.moveToLocation(this.pathToGoal.shift()!)
        } else {
            if (this.tempGoal && this.tempGoal.q == this.q && this.tempGoal.r == this.r)
                this.tempGoal = null;

            this.pathToGoal = this.world.bestPath(this, this.tempGoal ?? this.goal, 20)
            if (this.pathToGoal.length == 0) {
                //Ooops, could not find a path.
                // So, let's set a temporary goal near the actual goal to try to move away from the obstacle
                if(this.tempGoal == null)
                    this.tempGoal = this.world.getRandomLocationFrom(this.tempGoal ?? this.goal, 30);
                else // Get a temp goal near myself, because I really am stuck now
                    this.tempGoal = this.world.getRandomLocationFrom(this, 50);

                this.pathToGoal = this.world.bestPath(this, this.tempGoal, 20)
            }

            //Take the first step
            if (this.pathToGoal.length > 0)
                this.moveToLocation(this.pathToGoal.shift()!)

            /*this.world.hexesReachable(this, 15).forEach(hex => {
                this.world.tiles[hex.hex.q][hex.hex.r].highlightTile();
            })*/
        }

        //this.moveToLocation(getFirstStepFromAToB(this, this.goal))
    };
    
    public sleeping = () => this.sleepCount > 0;

    private moveToDirection = (direction: IHexPoint) => {
        const location = add(this, direction);
        this.moveToLocation(location)
    }

    private moveToLocation = (location: IHexPoint) => {
        if (!this.world.moveEntity(this, location)) {
            const hex = add(this, getDirection(Math.floor(Math.random() * 6)))
            this.world.moveEntity(this, hex)
        }
    }

}