import { JsonDB } from 'node-json-db';
export declare class World {
    db: JsonDB;
    constructor();
    setBlock(x: number, y: number, z: number, block: any): void;
}
