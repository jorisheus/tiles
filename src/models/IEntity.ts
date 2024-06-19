import {type IHexPoint} from "./IHexPoint";

export interface IEntity extends IHexPoint {
    tick(tickCount: number): void;
    sleeping() : boolean;
}