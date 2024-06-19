import {add, getDirection, getFirstStepFromAToB, scale, subtract} from "./axial";
import {World} from "./world";
import type {IEntity} from "@/models/IEntity";
import type {IHexPoint} from "@/models/IHexPoint";

export class Wanderer implements IEntity {
    private diesOfOldAgeAt: number;
    constructor(private world: World, public q: number, public r: number) {
        this.goal = this.world.getRandomLocation();
        this.world.setGoal(this, null, this.goal);
        this.diesOfOldAgeAt = 1000 + Math.random() * 1000;
    }

    private goal: IHexPoint = {q: 0, r: 0}
    private tempGoal: IHexPoint | null = null
    private pathToGoal: IHexPoint[] = []
    private sleepCount = 0;
    private goalsReached = 0;
    private energy = 200;
    private age = 0;

    tick = (tickCount: number) => {
        this.age++;
        if (this.sleepCount > 0) {
            this.sleepCount--;
            return;
        }
        this.energy--;
        
        if(this.energy < 0) {
            console.log(`Wanderer ${this.q},${this.r} has reached ${this.goalsReached} goals but has no energy left at tick ${tickCount}, so it dies.`)
            this.world.removeEntity(this, this.goal);
            return;
        }
        
        if(this.energy > 600){
            console.log(`Wanderer ${this.q},${this.r} has reached ${this.goalsReached} goals and has ${this.energy} energy at tick ${tickCount}, so it reproduces.`)
            const hex = add(this, getDirection(Math.floor(Math.random() * 6)))
            const w = new Wanderer(this.world, hex.q, hex.r);
            this.world.addEntity(w);
            this.energy -= 400;
            return;
        }
        
        if(this.age > this.diesOfOldAgeAt) {
            console.log(`Wanderer ${this.q},${this.r} has reached ${this.goalsReached} goals and dies of old age at tick ${tickCount}.`)
            this.world.removeEntity(this, this.goal);
            return;
        }
        
        //const distance = getDistance(this, this.goal);
        if (this.goal.q == this.q && this.goal.r == this.r) {
            const newGoal = this.world.getRandomLocation();
            this.world.setGoal(this, this.goal, newGoal);
            this.goal = newGoal;

            this.pathToGoal = this.world.bestPath(this, this.goal, 20)
            this.goalsReached += 1;
            this.energy += 150;
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