import {type IHexPoint} from "./IHexPoint";

export interface IEntity {
    location: IHexPoint;
    tick(tickCount: number): void;
}


export interface IAnimal extends IEntity {
    energy: number;
    isSleeping() : boolean;
}