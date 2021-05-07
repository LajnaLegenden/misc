export class Block {
  x: number;
  y: number;
  z: number;

  modInfo: string;
    block: string;
    
    h: number;
    f: number;
    g: number;

    open: boolean;
    closed: boolean
    cameFrom: Block;
    path:boolean

  constructor(
    private jsonString: IBlock,
    private cords: { x: number; y: number; z: number },
    private unknown: boolean = false
  ) {
    this.x = this.cords.x;
    this.y = this.cords.y;
    this.z = this.cords.z;
    if (unknown) {
      this.modInfo = "minecraft";
      this.block = "air";
    } else {
      let info = this.jsonString.name.split(":");
      this.modInfo = info[0];
      this.block = info[1];
    }
  }
}

interface IBlock {
  metadata?: number;
  name?: string;
  state?: any;
  blockData?: { color: string };
}
