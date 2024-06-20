import {add, getDirection} from "./axial";
import {World} from "./world";
import type {IHexPoint} from "@/models/IHexPoint";
import {Animal} from "@/animal";

const syllables = ['ba', 'rie', 'wo', 'pew', 'man', 'zel', 'ke', 'mi', 'na', 'quo', 'to', 'la', 'li']

export class Rabbit extends Animal {
    constructor(world: World, location: IHexPoint) {
        super(world, location, 200)
        this.goal = this.world.getRandomLocation();
        this.world.setGoal(this, null, this.goal);
        const syllableCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < syllableCount; i++) {
            const index = Math.floor(Math.random() * syllables.length);
            this.name += syllables[index];
        }
        this.name = `Rabbit ${this.name[0].toUpperCase()}${this.name.substring(1)}`;
    }

    private goal: IHexPoint = {q: 0, r: 0}
    private tempGoal: IHexPoint | null = null
    private pathToGoal: IHexPoint[] = []
    private goalsReached = 0;

    protected energyLossPerTick = 1;
    protected energyGainWhileSleepingPerTick = 2;
    protected maximumAge : number = 1000 + Math.random() * 1000;
    protected name = "";


    protected getGoal = () => this.goal;

    protected do = (tickCount: number) => {
        
        if(this.energy > 600){
            const hex = add(this.location, getDirection(Math.floor(Math.random() * 6)))
            const baby = new Rabbit(this.world, hex);
            this.world.addEntity(baby);
            this.world.log(`BABY: The baby ${baby.name} is born from ${this.name}`)
            this.energy -= 400;
            // Just a little break...
            this.sleep(20);
            return;
        }
        
        //const distance = getDistance(this, this.goal);
        if (this.goal.q == this.location.q && this.goal.r == this.location.r) {
            const newGoal = this.world.getRandomLocation();
            this.world.setGoal(this, this.goal, newGoal);
            this.goal = newGoal;

            this.pathToGoal = this.world.bestPath(this.location, this.goal, 20)
            this.goalsReached += 1;
            this.energy += 150;
            // Just a little break...
            this.sleep(10);
            return;
        }

        if (this.pathToGoal.length > 0) {
            this.moveToLocation(this.pathToGoal.shift()!)
        } else {
            if (this.tempGoal && this.tempGoal.q == this.location.q && this.tempGoal.r == this.location.r)
                this.tempGoal = null;

            this.pathToGoal = this.world.bestPath(this.location, this.tempGoal ?? this.goal, 20)
            if (this.pathToGoal.length == 0) {
                //Ooops, could not find a path.
                // So, let's set a temporary goal near the actual goal to try to move away from the obstacle
                if(this.tempGoal == null)
                    this.tempGoal = this.world.getRandomLocationFrom(this.tempGoal ?? this.goal, 30);
                else // Get a temp goal near myself, because I really am stuck now
                    this.tempGoal = this.world.getRandomLocationFrom(this.location, 50);

                this.pathToGoal = this.world.bestPath(this.location, this.tempGoal, 20)
            }

            //Take the first step
            if (this.pathToGoal.length > 0)
                this.moveToLocation(this.pathToGoal.shift()!)

            /*this.world.hexesReachable(this, 15).forEach(hex => {
                this.world.tiles[hex.hex.q][hex.hex.r].highlightTile();
            })*/
        }
    };

}