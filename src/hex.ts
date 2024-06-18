import {IHexPoint} from "./models/IHexPoint";

export class Hex implements IHexPoint {
    constructor(public q: number, public r: number) {
    }
}