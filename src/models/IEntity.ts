import {type IHexPoint} from "./IHexPoint";

export interface IEntity extends IHexPoint {
    tick(): void;
    sleeping() : boolean;
}