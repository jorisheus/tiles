import type {IAnimal} from "@/models/IEntity";
import {World} from "@/world";
import {add, getDirection, getFirstStepFromAToB} from "@/axial";
import type {IHexPoint} from "@/models/IHexPoint";

export abstract class Animal implements IAnimal {
    
    public energy: number;
    public age = 0;
    constructor(protected world: World, public location: IHexPoint, public startEnergy: number) {
        this.energy = startEnergy;
    }

    protected abstract energyLossPerTick: number;
    protected abstract energyGainWhileSleepingPerTick: number;
    protected abstract maximumAge: number;
    protected abstract name: string;
    protected abstract do(tickCount: number) : void;
    protected abstract getGoal() : IHexPoint | null;
    
    tick = (tickCount: number) => {
        if (this.isSleeping()) {
            this.sleepRemaining--;
            this.energy += this.energyGainWhileSleepingPerTick;
            return;
        }
        this.energy -= this.energyLossPerTick;
        this.age++;


        if(this.age > this.maximumAge) {
            this.world.log(`DIES: ${this.name} dies of old age`)
            this.world.removeEntity(this, this.getGoal());
            return;
        }

        if(this.energy < 0) {
            this.world.log(`DIES: ${this.name} has no energy left, so it dies`)
            this.world.removeEntity(this, this.getGoal());
            return;
        }
        
        this.do(tickCount);
    };
    

    public isSleeping = () => this.sleepRemaining > 0;
    
    private sleepRemaining = 0;
    
    protected sleep = (ticks: number) => {
        this.sleepRemaining += ticks;
    }

    protected moveToDirection = (direction: IHexPoint) => {
        const location = add(this.location, direction);
        this.moveToLocation(location)
    }

    protected moveToLocation = (location: IHexPoint) => {
        if (!this.world.moveEntity(this, location)) {
            const hex = add(this.location, getDirection(Math.floor(Math.random() * 6)))
            this.world.moveEntity(this, hex)
        }
    }


}
