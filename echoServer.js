"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const net = __importStar(require("net"));
function bufPush(dynBuf, data) {
    const newLen = dynBuf.lenght + data.length;
    if (dynBuf.lenght < newLen) {
        let cap = Math.max(dynBuf.buffer.length, 32);
        while (cap < newLen) {
            cap *= 2;
        }
        const grown = Buffer.alloc(cap);
        dynBuf.buffer.copy(grown, 0, 0);
        dynBuf.buffer = grown;
    }
    data.copy(dynBuf.buffer, dynBuf.lenght, 0);
    dynBuf.lenght = newLen;
}
main();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const listener = soListen("127.0.0.1", 1234);
        while (true) {
            const conn = yield soAccept(listener);
            newConn(conn);
        }
    });
}
function newConn(conn) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('new connection', conn.socket.remoteAddress, conn.socket.remotePort);
        try {
            yield serveClient(conn);
        }
        catch (e) {
            console.error('excetption', e);
        }
        finally {
            conn.socket.destroy();
        }
    });
}
function serveClient(conn) {
    return __awaiter(this, void 0, void 0, function* () {
        const buf = { buffer: Buffer.alloc(0), lenght: 0 };
        while (true) {
            const msg = cutMessage(buf);
            if (!msg) {
                const data = yield soRead(conn);
                bufPush(buf, data);
                if (data.length === 0) {
                    return;
                }
                continue;
            }
            if (msg.equals(Buffer.from('quit\n'))) {
                yield soWrite(conn, Buffer.from('Bye.'));
                console.log('end connection');
                conn.socket.destroy();
                return;
            }
            else {
                const reply = Buffer.concat([Buffer.from('Echo:'), msg]);
                yield soWrite(conn, reply);
            }
        }
    });
}
function cutMessage(buf) {
    const idx = buf.buffer.subarray(0, buf.lenght).indexOf('\n');
    if (idx < 0) {
        return null;
    }
    const msg = Buffer.from(buf.buffer.subarray(0, idx + 1));
    bufPop(buf, idx + 1);
    return msg;
}
function bufPop(buf, len) {
    buf.buffer.copyWithin(0, len, buf.lenght);
    buf.lenght -= len;
}
function soInit(socket) {
    const conn = {
        socket: socket, err: null, ended: false, reader: null
    };
    socket.on('data', (data) => {
        var _a;
        console.assert(!!conn.reader);
        conn.socket.pause();
        (_a = conn.reader) === null || _a === void 0 ? void 0 : _a.resolve(data);
        conn.reader = null;
    });
    socket.on('end', () => {
        conn.ended = true;
        if (conn.reader) {
            conn.reader.resolve(Buffer.from(''));
            conn.reader = null;
        }
    });
    socket.on('error', (err) => {
        conn.err = err;
        if (conn.reader) {
            conn.reader.reject(err);
            conn.reader = null;
        }
    });
    return conn;
}
function soRead(conn) {
    console.assert(!conn.reader);
    return new Promise((resolve, reject) => {
        if (conn.err) {
            reject(conn.err);
            return;
        }
        if (conn.ended) {
            resolve(Buffer.from(''));
            return;
        }
        conn.reader = { resolve: resolve, reject: reject };
        conn.socket.resume();
    });
}
function soWrite(conn, data) {
    console.assert(data.length > 0);
    return new Promise((resolve, reject) => {
        if (conn.err) {
            reject(conn.err);
            return;
        }
        if (data.toString() === "Bye.") {
            conn.socket.write(data, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        }
        else {
            conn.socket.write(data, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        }
    });
}
function soListen(hostname, port) {
    const server = net.createServer({ pauseOnConnect: true });
    const listener = { server: server, err: null, ended: false, conns: [], acceptor: null };
    server.on('connection', (socket) => {
        const conn = soInit(socket);
        if (listener.acceptor) {
            const acceptor = listener.acceptor;
            listener.acceptor = null;
            acceptor.resolve(conn);
        }
        else {
            listener.conns.push(conn);
        }
    });
    server.on('error', (err) => {
        listener.err = err;
        if (listener.acceptor) {
            const acceptor = listener.acceptor;
            listener.acceptor = null;
            acceptor.reject(err);
        }
    });
    server.on('close', () => {
        listener.ended = true;
        if (listener.acceptor) {
            const acceptor = listener.acceptor;
            listener.acceptor = null;
            acceptor.reject(new Error('listener closed'));
        }
    });
    listener.server.listen({ host: hostname, port: port });
    return listener;
}
function soAccept(listener) {
    console.assert(!listener.acceptor);
    return new Promise((resolve, reject) => {
        if (listener.conns.length > 0) {
            const conn = listener.conns.shift();
            resolve(conn);
            return;
        }
        if (listener.err) {
            reject(listener.err);
            return;
        }
        if (listener.ended) {
            reject(new Error('listener closed'));
            return;
        }
        listener.acceptor = {
            resolve,
            reject
        };
    });
}
