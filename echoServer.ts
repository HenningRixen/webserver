import * as net from "net"

type TCPConn = {
  socket: net.Socket;

  err: null | Error;

  ended: boolean;

  reader: null | {
    resolve: (value: Buffer) => void,
    reject: (value: Error) => void
  }

}

type TCPListener = {
  server: net.Server;
  err: null | Error;
  ended: boolean
  conns: TCPConn[]
  acceptor: null | {
    resolve: (value: TCPConn) => void,
    reject: (value: Error) => void
  }
}

main()

async function main() {
  const listener = soListen("127.0.0.1", 1234)
  while (true) {
    const conn = await soAccept(listener)
    newConn(conn)

  }
}

async function newConn(conn: TCPConn): Promise<void> {
  console.log('new connection', conn.socket.remoteAddress, conn.socket.remotePort)

  try {
    await serveClient(conn)
  } catch (e) {
    console.error('excetption', e)
  } finally {
    conn.socket.destroy()
  }
}

async function serveClient(conn: TCPConn) {
  while (true) {
    const data = await soRead(conn)
    if (data.length === 0) {
      console.log('end connection')
      break;
    }

    console.log('data', data)
    await soWrite(conn, data)
  }

}

function soInit(socket: net.Socket): TCPConn {
  const conn: TCPConn = {
    socket: socket, err: null, ended: false, reader: null
  }

  socket.on('data', (data: Buffer) => {
    console.assert(!!conn.reader)
    conn.socket.pause()
    conn.reader?.resolve(data)
    conn.reader = null
  })

  socket.on('end', () => {
    conn.ended = true
    if (conn.reader) {
      conn.reader.resolve(Buffer.from(''));
      conn.reader = null;
    }
  })

  socket.on('error', (err: Error) => {
    conn.err = err
    if (conn.reader) {
      conn.reader.reject(err)
      conn.reader = null
    }
  })

  return conn
}

function soRead(conn: TCPConn): Promise<Buffer> {
  console.assert(!conn.reader)
  return new Promise((resolve, reject) => {
    if (conn.err) {
      reject(conn.err)
      return
    }
    if (conn.ended) {
      resolve(Buffer.from(''))
      return
    }

    conn.reader = { resolve: resolve, reject: reject }

    conn.socket.resume()

  })
}

function soWrite(conn: TCPConn, data: Buffer): Promise<void> {
  console.assert(data.length > 0);
  return new Promise((resolve, reject) => {
    if (conn.err) {
      reject(conn.err)
      return
    }

    conn.socket.write(data, (err: Error | null | undefined) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function soListen(hostname: string, port: number): TCPListener {
  const server = net.createServer({ pauseOnConnect: true });
  const listener: TCPListener = { server: server, err: null, ended: false, conns: [], acceptor: null }
  server.on('connection', (socket: net.Socket) => {
    const conn = soInit(socket)

    if (listener.acceptor) {
      const acceptor = listener.acceptor
      listener.acceptor = null
      acceptor.resolve(conn)
    } else {
      listener.conns.push(conn)
    }
  })
  server.on('error', (err: Error) => {
    listener.err = err
    if (listener.acceptor) {
      const acceptor = listener.acceptor
      listener.acceptor = null
      acceptor.reject(err)
    }
  })
  server.on('close', () => {
    listener.ended = true
    if (listener.acceptor) {
      const acceptor = listener.acceptor
      listener.acceptor = null
      acceptor.reject(new Error('listener closed'))
    }
  })
  listener.server.listen({ host: hostname, port: port })
  return listener

}

function soAccept(listener: TCPListener): Promise<TCPConn> {
  console.assert(!listener.acceptor)

  return new Promise((resolve, reject) => {
    if (listener.conns.length > 0) {
      const conn = listener.conns.shift()!
      resolve(conn)
      return
    }

    if (listener.err) {
      reject(listener.err)
      return
    }

    if (listener.ended) {
      reject(new Error('listener closed'))
      return
    }

    listener.acceptor = {
      resolve,
      reject
    }
  })
}
