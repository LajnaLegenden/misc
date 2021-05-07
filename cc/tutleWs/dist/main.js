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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exphbs = __importStar(require("express-handlebars"));
const socket_io_1 = require("socket.io");
const ws_1 = require("ws");
const turtle_1 = require("./turtle");
const world_1 = require("./world");
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
var app = express_1.default();
//setting middleware
app.use('/static', express_1.default.static(__dirname + './../turtle')); //Serves resources from public folder
app.engine('handlebars', exphbs.default({
    extname: "hbs"
}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + "/views");
app.get('/', function (req, res) {
    res.render('home');
});
const httpServer = http_1.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*"
    }
});
io.on('connection', (socket) => {
    socket.on('getTurtles', _ => {
        let _turtles = {};
        Object.assign(_turtles, turtles);
        for (let key of Object.keys(turtles)) {
            let propNames = Object.getOwnPropertyNames(Object.getPrototypeOf(_turtles[key]));
            _turtles[key].availablePropNames = propNames;
            socket.emit('turtles', JSON.stringify(_turtles));
        }
    });
    socket.on('runMethod', ({ id, method, args, nonce }) => __awaiter(void 0, void 0, void 0, function* () {
        let res = yield turtles[id][method](args); //asdasdasd
        console.log("asdf");
        socket.emit('methodReturn', { return: res, nonce });
    }));
    socket.on('exec', ({ id, method, nonce }) => __awaiter(void 0, void 0, void 0, function* () {
        let res = yield turtles[id][method]();
        socket.emit('execReturn', { return: res, nonce });
    }));
});
httpServer.listen(1338);
httpServer.on('listening', _ => {
    console.log("Listening on port 1338");
});
const turtles = {};
const world = new world_1.World();
const wss = new ws_1.Server({
    port: 1337
});
wss.on('connection', (ws) => {
    let turtle = new turtle_1.Turtle(ws, world);
    turtle.on('init', id => {
        turtles[id] = turtle;
        wss.on('close', _ => {
            delete turtles[id];
        });
    });
});
