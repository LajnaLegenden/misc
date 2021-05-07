import * as _ from "lodash";
import * as exphbs from "express-handlebars";
import * as path from "path";

import { Server, Socket } from "socket.io";
import WebSocket, { Server as WsServer } from "ws";

import { Turtle } from "./turtle";
import { World } from "./world";
import { createServer } from "http";
import express from "express";
import { randomBytes } from "crypto";

var app = express();
var hbs = exphbs.create();

const PORT: number = 3002;

//setting middleware
app.use("/static", express.static(__dirname + "./../turtle")); //Serves resources from public folder
app.use("/three", express.static(__dirname + "./../node_modules/three")); //Serves resources from public folder
app.use("/public", express.static(path.resolve(__dirname + "/public"))); //Serves resources from public folder

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname + "/views"));
app.get("/", function (req, res) {
  res.render("main");
});

let connectedClients = {};

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
const world = new World();

io.on("connection", (socket) => {
  const worldListener = () => {
    socket.emit("world", JSON.stringify(world.getWorld()));
  };
  socket.on("disconnect", (_) => {
    world.off("worldUpdate", worldListener);
  });
  connectedClients[socket.id] = socket;

  world.on("worldUpdate", worldListener);
  socket.on("getTurtles", (_) => {
    let _turtles = {};
    Object.assign(_turtles, turtles);
    for (let key of Object.keys(turtles)) {
      let propNames = Object.getOwnPropertyNames(
        Object.getPrototypeOf(_turtles[key])
      );
      _turtles[key].availablePropNames = propNames;
      socket.emit("turtles", JSON.stringify(_turtles));
    }
  });
  socket.on("getWorld", () => {
    socket.emit("world", JSON.stringify(world.getWorld()));
  });
  socket.on("disconnect", () => {
    delete connectedClients[socket.id];
  });

  socket.on("runMethod", async ({ id, method, args, nonce }) => {
  try {
    let asd = await turtles[id][method](args);
    socket.emit("methodReturn", { return: asd, nonce });
  } catch (error) {
    console.log(error.message)
  }
  });
  socket.on("exec", async ({ id, method, nonce }) => {
    let res = await turtles[id][method]();
    socket.emit("execReturn", { return: res, nonce });
  });
});

httpServer.listen(PORT);
httpServer.on("listening", () => {
  console.log("[WEB] Listening on port " + PORT);
});
const turtles: { [key: string]: Turtle } = {};
const wss = new WsServer({
  port: 3001,
});
console.log("[WSS] Listening on port " + 3001);

wss.on("connection", (ws: WebSocket) => {
  let turtle = new Turtle(ws, world);
  turtle.on("init", (id) => {
    let _turtles = {};
    Object.assign(_turtles, turtles);
    for (let key of Object.keys(turtles)) {
      let propNames = Object.getOwnPropertyNames(
        Object.getPrototypeOf(_turtles[key])
      );
      _turtles[key].availablePropNames = propNames;
    }
    for (let s in connectedClients) {
      connectedClients[s].emit("turtles", JSON.stringify(_turtles));
    }
    turtles[id] = turtle;
    wss.on("close", (_) => {
      delete turtles[id];
    });
  });

  turtle.on("path", (res) => {
    for (let s in connectedClients) {
      connectedClients[s].emit("path", JSON.stringify(res));
    }
  });

  turtle.on("openList", (res) => {
    console.log(res.length);
    for (let s in connectedClients) {
      connectedClients[s].emit("openList", JSON.stringify(res));
    }
  });
  turtle.on("moved", () => {
    let _turtles = _.cloneDeep(turtles);
    for (let key of Object.keys(turtles)) {
      let propNames = Object.getOwnPropertyNames(
        Object.getPrototypeOf(_turtles[key])
      );
      _turtles[key].availablePropNames = propNames;
      delete _turtles[key].ws;
    }
    for (let s in connectedClients) {
      connectedClients[s].emit("turtles", JSON.stringify(_turtles));
    }
  });
});
