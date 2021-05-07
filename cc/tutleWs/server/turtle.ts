import { EventEmitter } from "events";
import WebSocket from "ws";
import { randomBytes } from "crypto";
import { AStar } from "./aStar";
import { World } from "./world";
import { spawn } from "child_process";
import Queue from "queue";
import {resolve} from 'path'

const nonces = new Set();
function getNonce(): string {
  let nonce = "";
  while (nonce === "" || nonces.has(nonce)) {
    nonce = randomBytes(4).toString("hex");
  }
  nonces.add(nonce);
  return nonce; //asd
}

const SAVE_TIMEOUT = 5 * 1000;
export class Turtle extends EventEmitter {
  id: number;
  label: string;
  fuel: number;

  x: number = 0;
  y: number = 0;
  z: number = 0;

  worldX: number = 0;
  worldY: number = 0;
  worldZ: number = 0;
  facing: "n" | "s" | "e" | "w" = "n";

  queue: Queue;

  availablePropNames: string[];

  constructor(public ws: WebSocket, private world: World) {
    super();
    ws.setMaxListeners(10000);
    this.exec<string>("os.getComputerLabel()").then(async (label) => {
      this.id = await this.exec<number>("os.getComputerID()");
      console.log(`Turtle ${this.id} init`);
      let name = getNonce();
      this.label = name;
      await this.exec(`os.setComputerLabel("${name}")`);
      this.getCords().then((res) => {
        let { x, y, z, d } = JSON.parse(res.cords);
        this.worldX = x;
        this.worldY = y;
        this.worldZ = z;
        this.facing = <any>d;
      });
      //Get fuel level and refuel
      await this.refuel();
      this.fuel = await this.getFuelLevel();

      //Cord wirte loops
      this.saveCordsLoop();

      this.emit("init", this.id);
    });
  }

  async getFuelLevel(): Promise<number> {
    return await this.exec<number>("turtle.getFuelLevel()");
  }

  async refuel(): Promise<boolean> {
    return await this.exec<any>("turtle.refuel()");
  }

  async moveForward() {
    let res = await this.exec<boolean>("turtle.forward()");
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
      this.emit("moved");
    }
    return await res;
  }
  async moveBack() {
    let res = await this.exec<boolean>("turtle.back()");
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
      this.emit("moved");
    }
    return await res;
  }
  async moveUp() {
    let res = await this.exec<boolean>("turtle.up()");
    if (res) {
      this.y++;
      this.worldY++;
      this.detect();
      this.emit("moved");
    }
    return await res;
  }
  async moveDown() {
    let res = await this.exec<boolean>("turtle.down()");
    if (res) {
      this.y--;
      this.worldY--;
      this.detect();
      this.emit("moved");
    }
    return await res;
  }
  async turnLeft() {
    let res = await this.exec<boolean>("turtle.turnLeft()");
    if (res) {
      this.turn("l");
      this.detect();
      this.emit("moved");
    }
    console.log("Turnleft", res);
    return await res;
  }

  async turnRight() {
    let res = await this.exec<boolean>("turtle.turnRight()");
    if (res) {
      this.turn("r");
      this.detect();
      this.emit("moved");
    }
    return await res;
  }

  async detect() {
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
    let { forward, up, down } = await this.exec<{
      forward: any;
      up: any;
      down: any;
    }>(
      "{down=select(2,turtle.inspectDown()), up=select(2,turtle.inspectUp()), forward=select(2,turtle.inspect())}"
    );
    this.world.setBlock(
      forwardBlockCords[0],
      forwardBlockCords[1],
      forwardBlockCords[2],
      forward
    );
    this.world.setBlock(this.worldX, this.worldY + 1, this.worldZ, up);
    this.world.setBlock(this.worldX, this.worldY - 1, this.worldZ, down);
  }

  turn(dir: "l" | "r") {
    switch (this.facing) {
      case "n":
        if (dir == "l") {
          this.facing = "w";
        } else {
          this.facing = "e";
        }
        break;
      case "s":
        if (dir == "l") {
          this.facing = "e";
        } else {
          this.facing = "w";
        }
        break;
      case "w":
        if (dir == "l") {
          this.facing = "s";
        } else {
          this.facing = "n";
        }
        break;
      case "e":
        if (dir == "l") {
          this.facing = "n";
        } else {
          this.facing = "s";
        }
        break;
    }
  }

  exec<T>(command: string): Promise<T> {
    return new Promise((r) => {
      const nonce = getNonce();

      this.ws.send(
        JSON.stringify({
          type: "eval",
          function: `return ${command}`,
          nonce,
        })
      );

      const listener = (resp: string) => {
        try {
          let res = JSON.parse(resp);
          if (res?.nonce === nonce) {
            r(res.data);
            this.ws.off("message", listener);
          }
        } catch (e) {}
      };

      this.ws.on("message", listener);
    });
  }

  getCords(): Promise<{ cords: string; nonce: any }> {
    return new Promise((r) => {
      const nonce = getNonce();
      this.ws.send(
        JSON.stringify({
          type: "cords",
          nonce,
        })
      );

      const listener = (resp: string) => {
        try {
          let res = JSON.parse(resp);
          if (res?.nonce === nonce) {
            this.ws.off("message", listener);
            r(res);
          }
        } catch (e) {}
      };

      this.ws.on("message", listener);
    });
  }

  async moveToCords([x, y, z]: [number, number, number]): Promise<any> {
    var child = spawn(resolve(__dirname + "/../cpp/src/AStar"), ["'" + JSON.stringify(this.world.getWorldAsBlocks()) + "'"]);
console.log("'" + JSON.stringify(this.world.getWorldAsBlocks()) + "'")
    child.stdout.on("data", function (data) {
      console.log("Child data: " + data);
    });
    child.on("error", function () {
      console.log("Failed to start child.");
    });
    child.on("close", function (code) {
      console.log("Child process exited with code " + code);
    });
    child.stdout.on("end", function () {
      console.log("Finished collecting data chunks.");
    });
    /*   console.log(x, y, z);
    const aStar = new AStar();
    
    debugger;
   /*  let res = aStar.process(
      this.world.getWorldAsBlocks(),
      this.world.getBlock(this.worldX, this.worldY,this.worldZ),
      this.world.getBlock(x, y, z),
      {
        diagonal: false,
        heuristic: "euclidean",
        animate: "true",
        heightFactor: 0.5,
      }
    ); 
    this.emit('path',res)
    return res.path.map(t => {return {x:t.x, y:t.y,z:t.z}}); */
  }
  // -x = west
  // +z = south
  async moveToNext(x: number, y: number, z: number) {
    console.log("Moving to ", x, y, z);
    let targetDirection = "";
    if (x != this.worldX) {
      targetDirection = this.worldX > x ? "e" : "w";
    }
    if (z != this.worldZ) {
      targetDirection = this.worldZ > z ? "n" : "s";
    }

    if (targetDirection == this.facing) {
      return await this.moveForward();
    } else {
      while (targetDirection != this.facing) {
        console.log({ targetDirection, d: this.facing });
        await this.turnLeft();
      }
      return await this.moveForward();
    }
  }

  saveCords(): Promise<Boolean> {
    let cords = {
      x: this.worldX,
      y: this.worldY,
      z: this.worldZ,
      d: this.facing,
    };
    return new Promise((r) => {
      const nonce = getNonce();
      this.ws.send(
        JSON.stringify({
          type: "saveCords",
          cords: JSON.stringify(cords),
          nonce,
        })
      );

      const listener = (resp: string) => {
        try {
          let res = JSON.parse(resp);
          if (res?.nonce === nonce) {
            this.ws.off("message", listener);
            r(res);
          }
        } catch (e) {}
      }; //Asd

      this.ws.on("message", listener);
    });
  }

  saveCordsLoop() {
    setTimeout((_) => {
      this.saveCordsLoop();
    }, SAVE_TIMEOUT);
    this.saveCords();
  }
}
