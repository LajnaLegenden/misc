"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Turtle = void 0;
const events_1 = require("events");
const crypto_1 = require("crypto");
const nonces = new Set();
function getNonce() {
    let nonce = '';
    while (nonce === '' || nonces.has(nonce)) {
        nonce = crypto_1.randomBytes(4).toString('hex');
    }
    nonces.add(nonce);
    return nonce; //asd
}
const SAVE_TIMEOUT = 5 * 1000;
class Turtle extends events_1.EventEmitter {
    constructor(ws, world) {
        super();
        this.ws = ws;
        this.world = world;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.worldX = 0;
        this.worldY = 0;
        this.worldZ = 0;
        this.facing = "n";
        ws.setMaxListeners(10000);
        this.exec('os.getComputerLabel()').then((label) => __awaiter(this, void 0, void 0, function* () {
            this.id = yield this.exec('os.getComputerID()');
            console.log(`Turtle ${this.id} init`);
            let name = getNonce();
            this.label = name;
            yield this.exec(`os.setComputerLabel("${name}")`);
            this.getCords().then(res => {
                let { x, y, z, d } = JSON.parse(res.cords);
                this.worldX = x;
                this.worldY = y;
                this.worldZ = z;
                this.facing = d;
            });
            //Get fuel level and refuel
            yield this.refuel();
            this.fuel = yield this.getFuelLevel();
            //Cord wirte loops
            this.saveCordsLoop();
            this.emit('init', this.id);
        }));
    }
    getFuelLevel() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.exec("turtle.getFuelLevel()");
        });
    }
    refuel() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.exec("turtle.refuel()");
        });
    }
    moveForward() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.exec("turtle.forward()");
            if (res) {
                console.log(this.facing);
                switch (this.facing) {
                    case "n":
                        this.worldZ--;
                        this.z--;
                        break;
                    case "s":
                        this.worldZ++;
                        this.z++;
                        break;
                    case "w":
                        this.worldX--;
                        this.x--;
                        break;
                    case "e":
                        this.worldX++;
                        this.x++;
                        break;
                }
                this.detect();
            }
        });
    }
    moveBack() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.exec("turtle.back()");
            if (res) {
                switch (this.facing) {
                    case "n":
                        this.worldZ++;
                        this.z++;
                        break;
                    case "s":
                        this.worldZ--;
                        this.z--;
                        break;
                    case "w":
                        this.worldX++;
                        this.x++;
                        break;
                    case "e":
                        this.worldX--;
                        this.x--;
                        break;
                }
                this.detect();
            }
        });
    }
    moveUp() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.exec("turtle.up()");
            if (res) {
                this.y++;
                this.worldY++;
                this.detect();
            }
        });
    }
    moveDown() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.exec("turtle.down()");
            if (res) {
                this.y--;
                this.worldY--;
                this.detect();
            }
        });
    }
    turnLeft() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.exec("turtle.turnLeft()");
            if (res) {
                this.turn("l");
            }
        });
    }
    turnRight() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.exec("turtle.turnRight()");
            if (res) {
                this.turn("r");
            }
        });
    }
    detect() {
        return __awaiter(this, void 0, void 0, function* () {
            let forwardBlockCords = [0, 0, 0];
            switch (this.facing) {
                case "n":
                    forwardBlockCords = [this.worldX, this.worldY, this.worldZ - 1];
                    break;
                case "s":
                    forwardBlockCords = [this.worldX, this.worldY, this.worldZ + 1];
                    break;
                case "w":
                    forwardBlockCords = [this.worldX - 1, this.worldY, this.worldZ];
                    break;
                case "e":
                    forwardBlockCords = [this.worldX + 1, this.worldY, this.worldZ];
                    break;
            }
            let { forward, up, down } = yield this.exec('{down=select(2,turtle.inspectDown()), up=select(2,turtle.inspectUp()), forward=select(2,turtle.inspect())}');
            this.world.setBlock(forwardBlockCords[0], forwardBlockCords[1], forwardBlockCords[2], forward);
            this.world.setBlock(this.worldX, this.worldY + 1, this.worldZ, up);
            this.world.setBlock(this.worldX, this.worldY - 1, this.worldZ, down);
        });
    }
    turn(dir) {
        switch (this.facing) {
            case "n":
                if (dir == "l") {
                    this.facing = "w";
                }
                else {
                    this.facing = "e";
                }
                break;
            case "s":
                if (dir == "l") {
                    this.facing = "e";
                }
                else {
                    this.facing = "w";
                }
                break;
            case "w":
                if (dir == "l") {
                    this.facing = "s";
                }
                else {
                    this.facing = "n";
                }
                break;
            case "e":
                if (dir == "l") {
                    this.facing = "n";
                }
                else {
                    this.facing = "s";
                }
                break;
        }
    }
    exec(command) {
        console.log(`[${this.label || "FETCHING"}] (${command})`);
        return new Promise(r => {
            const nonce = getNonce();
            this.ws.send(JSON.stringify({
                type: 'eval',
                function: `return ${command}`,
                nonce
            }));
            const listener = (resp) => {
                try {
                    let res = JSON.parse(resp);
                    if ((res === null || res === void 0 ? void 0 : res.nonce) === nonce) {
                        r(res.data);
                        this.ws.off('message', listener);
                    }
                }
                catch (e) { }
            };
            this.ws.on('message', listener);
        });
    }
    getCords() {
        return new Promise(r => {
            const nonce = getNonce();
            this.ws.send(JSON.stringify({
                type: 'cords',
                nonce
            }));
            const listener = (resp) => {
                try {
                    let res = JSON.parse(resp);
                    if ((res === null || res === void 0 ? void 0 : res.nonce) === nonce) {
                        this.ws.off('message', listener);
                        r(res);
                    }
                }
                catch (e) { }
            };
            this.ws.on('message', listener);
        });
    }
    saveCords() {
        let cords = { x: this.worldX, y: this.worldY, z: this.worldZ, d: this.facing };
        return new Promise(r => {
            const nonce = getNonce();
            this.ws.send(JSON.stringify({
                type: 'saveCords',
                cords: JSON.stringify(cords),
                nonce
            }));
            const listener = (resp) => {
                try {
                    let res = JSON.parse(resp);
                    if ((res === null || res === void 0 ? void 0 : res.nonce) === nonce) {
                        this.ws.off('message', listener);
                        r(res);
                    }
                }
                catch (e) { }
            }; //Asd
            this.ws.on('message', listener);
        });
    }
    saveCordsLoop() {
        setTimeout(_ => {
            this.saveCordsLoop();
        }, SAVE_TIMEOUT);
        this.saveCords();
    }
}
exports.Turtle = Turtle;
