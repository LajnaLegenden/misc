var dir = new THREE.Vector3();
var speed = 1.0;

window.onload = function () {
  window.main = new Vue({
    el: "#app",
    delimiters: ["%%", "%%"],
    created: function () {
      this.initWorld();
      this.initSocketIO();
      this.fetchInitialData();
      this.fetchInitialData();
      this.setupControls();
      this.onWindowResize();
      console.log(this);

      this.drawWorld(this.scene, this.renderer, this.camera, []);
    },
    data: function () {
      return {
        world: {},
        turtles: {},
        camera: undefined,
        renderer: undefined,
        scene: undefined,
        socket: undefined,
        controls: undefined,
        turtleKeys: new Array(),
        lastPos: [0, 0, 0],
        selectedTurtle: -1,
        path: undefined,
        openList: new Array(),
      };
    },
    methods: {
      onWindowResize: function () {
        window.addEventListener("resize", () => {
          this.camera.aspect = window.innerWidth / window.innerHeight;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
      },
      initWorld: function () {
        this.camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.controls = new THREE.OrbitControls(
          this.camera,
          this.renderer.domElement
        );
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.camera.position.y += 10;
      },
      initSocketIO: function () {
        this.socket = io();
        this.socket.on("turtles", (data) => {
          let info = JSON.parse(data);
          for (let key of Object.keys(info)) {
            delete info[key].ws;
          }
          if (Object.keys(this.turtles).length == 0) {
            this.selectedTurtle = info[Object.keys(info)[0]].id;
          }
          this.turtles = info;
          this.turtleKeys = Object.keys(info);
          this.drawWorld();
        });
        this.socket.on("world", (data) => {
          let info = JSON.parse(data);
          for (let key of Object.keys(info)) {
            delete info[key].ws;
          }
          this.world = info;
          this.drawWorld();
        });

        this.socket.on("path", (data) => {
          let info = JSON.parse(data);
          this.path = info.path;
          this.drawWorld();
        });
      },
      onSelectedTurtleChange: function (t) {
        this.selectedTurtle = t.id;
      },

      runMethod: async function (method, ...args) {
        return new Promise((r) => {
          let c = "ABCDEFGHIJK";
          let random = "";
          for (let i = 0; i < 10; i++) {
            random += c[Math.floor(Math.random() * c.length)];
          }
          this.socket.emit("runMethod", {
            id: this.selectedTurtle,
            method,
            args,
            nonce: random,
          });
          const listener = (data) => {
            if (data.nonce == random) {
              r(data.return);
              this.socket.off("methodReturn", listener);
            }
          };
          this.socket.on("methodReturn", listener);
        });
      },
      fetchInitialData: function () {
        this.socket.emit("getTurtles");
        this.socket.emit("getWorld");
      },
      drawWorld: function () {
        this.clearScene();
        this.renderer.setClearColor( 0xadd8e6, 0);
        let low = [9999999, 9999999, 9999999];
        let high = [-9999999, -9999999, -9999999];
        for (let prop in this.world) {
          let pos = prop.split(",").map((p) => parseInt(p));
          for (let i = 0; i < 3; i++) {
            if (pos[i] < low[i]) {
              low[i] = pos[i];
            }
            if (pos[i] > high[i]) {
              high[i] = pos[i];
            }
          }
        }
        let offsets = {
          x: low[0] + Math.abs(low[0] - high[0]) / 2,
          y: low[1] + Math.abs(low[1] - high[1]) / 2,
          z: low[2] + Math.abs(low[2] - high[2]) / 2,
        };
        //Draw blocvk
        for (let prop in this.world) {
          let obj = this.world[prop];
          const geometry = new THREE.BoxGeometry();
          const material = new THREE.MeshBasicMaterial({
            color: parseInt(obj.blockData.color, 16),
          });
          const cube = new THREE.Mesh(geometry, material);
          const edges = new THREE.EdgesGeometry(geometry);
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x00000 })
          );
          let pos = prop.split(",").map((p) => parseInt(p));
          cube.position.x = pos[0] - offsets.x;
          cube.position.y = pos[1] - offsets.y;
          cube.position.z = pos[2] - offsets.z;
          line.position.x = pos[0] - offsets.x;
          line.position.y = pos[1] - offsets.y;
          line.position.z = pos[2] - offsets.z;
          this.scene.add(cube);
          this.scene.add(line);
          this.lastPos = pos;
        }
        for (let prop in this.path) {
          let obj = this.path[prop];
          const geometry = new THREE.BoxGeometry();
          const material = new THREE.MeshBasicMaterial({
            color: 0xd3d3d3,
          });
          const cube = new THREE.Mesh(geometry, material);
          const edges = new THREE.EdgesGeometry(geometry);
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0xd3d3d3 })
          );
          cube.position.x = obj.x - offsets.x;
          cube.position.y = obj.y - offsets.y;
          cube.position.z = obj.z - offsets.z;
          line.position.x = obj.x - offsets.x;
          line.position.y = obj.y - offsets.y;
          line.position.z = obj.z - offsets.z;
          this.scene.add(cube);
          this.scene.add(line);
        }
        for (let prop of this.openList) {
          let obj = prop;
          const geometry = new THREE.BoxGeometry();
          const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
          });
          const cube = new THREE.Mesh(geometry, material);
          const edges = new THREE.EdgesGeometry(geometry);
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x00000 })
          );
          cube.position.x = obj.x - offsets.x;
          cube.position.y = obj.y - offsets.y;
          cube.position.z = obj.z - offsets.z;
          line.position.x = obj.x - offsets.x;
          line.position.y = obj.y - offsets.y;
          line.position.z = obj.z - offsets.z;
          this.scene.add(cube);
          this.scene.add(line);
        }
        //Draw turtles
        for (let prop in this.turtles) {
          let obj = this.turtles[prop];
          const geometry = new THREE.BoxGeometry();
          const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
          const cube = new THREE.Mesh(geometry, material);
          const edges = new THREE.EdgesGeometry(geometry);
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0xffffff })
          );

          cube.position.x = obj.worldX - offsets.x;
          cube.position.y = obj.worldY - offsets.y;
          cube.position.z = obj.worldZ - offsets.z;
          line.position.x = obj.worldX - offsets.x;
          line.position.y = obj.worldY - offsets.y;
          line.position.z = obj.worldZ - offsets.z;
          this.scene.add(cube);
          this.scene.add(line);
        }

        const animate = () => {
          this.renderer.render(this.scene, this.camera);
          setTimeout(animate, 30);
        };
        animate();
      },

      runMethodFromText: function () {
        let method = document.getElementById('method').value
        this.runMethod(method)
      },
      clearScene: function () {
        for (var i = this.scene.children.length - 1; i >= 0; i--) {
          obj = this.scene.children[i];
          this.scene.remove(obj);
        }
      },
      test: function () {
        this.runMethod("moveToCords", 519, 145, 533).then((data) => {
          console.log(data);
        });
      },
      run: function (name) {
        this.socket.emit("runMethod", {
          id: this.selectedTurtle,
          method: name,
        });
      },
      setupControls: function () {
        window.addEventListener("keydown", (e) => {
          switch (e.code) {
            case "ArrowUp":
              this.runMethod("moveForward").then((moved) => {
                if (!moved) {
                  console.warn("Could not move");
                }
              });
              break;
            case "ArrowDown":
              this.runMethod("moveBack").then((moved) => {
                if (!moved) {
                  console.warn("Could not move");
                }
              });
              break;
            case "ArrowLeft":
              this.runMethod("turnLeft").then((moved) => {
                if (!moved) {
                  console.warn("Could not move");
                }
              });
              break;
            case "ArrowRight":
              this.runMethod("turnRight").then((moved) => {
                if (!moved) {
                  console.warn("Could not move");
                }
              });
              break;
            case "Space":
              this.runMethod("moveUp").then((moved) => {
                if (!moved) {
                  console.warn("Could not move");
                }
              });
              break;
            case "ControlLeft":
              this.runMethod("moveDown").then((moved) => {
                if (!moved) {
                  console.warn("Could not move");
                }
              });
              break;
          }
        });
      },
    },
  });
};
