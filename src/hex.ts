import {type IHexPoint} from "./models/IHexPoint";

export class Hex implements IHexPoint {
    public s: number;
    constructor(public q: number, public r: number) {
        this.s = -q - r;
    }
}