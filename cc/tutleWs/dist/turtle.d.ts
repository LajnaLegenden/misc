/// <reference types="node" />
import { EventEmitter } from "events";
import WebSocket from "ws";
export declare class Turtle extends EventEmitter {
    private ws;
    private world;
    id: number;
    label: string;
    fuel: number;
    x: number;
    y: number;
    z: number;
    worldX: number;
    worldY: number;
    worldZ: number;
    facing: "n" | "s" | "e" | "w";
    constructor(ws: WebSocket, world: any);
    getFuelLevel(): Promise<number>;
    refuel(): Promise<boolean>;
    moveForward(): Promise<void>;
    moveBack(): Promise<void>;
    moveUp(): Promise<void>;
    moveDown(): Promise<void>;
    turnLeft(): Promise<void>;
    turnRight(): Promise<void>;
    detect(): Promise<void>;
    turn(dir: "l" | "r"): void;
    exec<T>(command: string): Promise<T>;
    getCords(): Promise<{
        cords: string;
        nonce: any;
    }>;
    saveCords(): Promise<Boolean>;
    saveCordsLoop(): void;
}
