import * as _ from "lodash";
import * as path from "path";

import { Block } from "./block";
import { EventEmitter } from "events";
import { JsonDB } from "node-json-db";

export class World extends EventEmitter {
  db: JsonDB;
  constructor() {
    super();
    this.db = new JsonDB(
      path.resolve(__dirname + "/../world.json"),
      true,
      true
    );
    if (!this.db.exists("/world")) this.db.push("/world", {});
    if (!this.db.exists("/blockData")) this.db.push("/blockData", {});
  }

  setBlock(x: number, y: number, z: number, block: any) {
    let dataPath = `/world/${x},${y},${z}`;
    if (block === "No block to inspect") {
      if (this.db.exists(dataPath)) {
        this.db.delete(dataPath);
      }
      return;
    }
    console.log(`Storing block info for ${x},${y},${z}`);

    let blockPath = `/blockData/${block.name}`;
    let blockData = {};
    if (this.db.exists(blockPath)) {
      blockData = this.db.getData(blockPath);
    } else {
      blockData = { color: Math.floor(Math.random() * 16777215).toString(16) };
      this.db.push(blockPath, blockData);
    }
    this.db.push(dataPath, { ...block, blockData });
    this.emit("worldUpdate");
  }

  getBlock(x: number, y: number, z: number): Block {
    try {
      return new Block(
        this.db.getData(`/world/${x},${y},${z}`),
        { x, y, z },
        false
      );
    } catch (error) {
      return new Block({}, { x, y, z }, true);
    }
  }
  getWorld() {
    return this.db.getData("/world");
  }

  getWorldAsBlocks() {
    let out = {};
    let data = this.db.getData("/world");
    for (let i in data) {
      let cords = i.split(",").map((c) => parseInt(c));
      if (!out[cords[0]]) {
        out[cords[0]] = {};
      }
      if (!out[cords[0]][cords[1]]) {
        out[cords[0]][cords[1]] = {};
      }
      if (!out[cords[0]][cords[1]][cords[2]]) {
        out[cords[0]][cords[1]][cords[2]] = {};
      }

      _.set(
        out,
        `${cords[0]}.${cords[1]}.${cords[2]}`,
        new Block(data[i], { x: cords[0], y: cords[1], z: cords[2] })
      );
    }
    return out;
  }
}
