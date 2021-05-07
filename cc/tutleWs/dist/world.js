"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.World = void 0;
const path = __importStar(require("path"));
const node_json_db_1 = require("node-json-db");
class World {
    constructor() {
        this.db = new node_json_db_1.JsonDB(path.resolve(__dirname + '/../world.json'), true, true);
        if (!this.db.exists('/world'))
            this.db.push('/world', {});
    }
    setBlock(x, y, z, block) {
        let dataPath = `/world/${x},${y},${z}`;
        if (block === 'No block to inspect') {
            if (this.db.exists(dataPath)) {
                this.db.delete(dataPath);
            }
            return;
        }
        console.log(`Storing block info for ${x},${y},${z}`);
        this.db.push(dataPath, block);
    }
}
exports.World = World;
