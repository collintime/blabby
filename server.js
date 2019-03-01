const path = require('path')
const fs = require('fs')
const http = require('http')
const sockets = require('socket.io')

const handler = (req, res) => {
  fs.readFile(path.join(__dirname, '/index.html'), (err, data) => {
    let statusCode = 200

    if (err) {
      statusCode = 500
      data = '<html><body>Internal Server Error</body></html>'
    }

    res.writeHead(statusCode, {
      'Content-Type': 'text/html'
    })
    res.end(data)
  })
}

const server = http.createServer(handler)
const io = sockets(server)
let users = new Map()

module.exports = {
  start: async (port = 3000) => {
    return new Promise((resolve, reject) => {
      io.on('connection', client => {
        client.on('user-online', name => {
          users.set(client.id, { name, id: client.id })
          io.to(client.id).emit('user-list', Array.from(users.values()))
          io.emit('user-online', users.get(client.id))
        })

        client.on('user-message', data => {
          let user = users.get(client.id)
          if (user) {
            io.emit('user-message', { user, message: data, timestamp: Date.now() })
          }
        })

        client.on('disconnect', () => {
          if (users.has(client.id)) {
            let user = users.get(client.id)
            io.emit('user-offline', user)
            users.delete(client.id)
          }
        })
      })

      server.listen(3000, err => {
        if (err) {
          return reject(err)
        }
        console.log('server started at port 3000')
        return resolve({
          http: server,
          io
        })
      })
    })
  },
  stop: async () => {
    // timeouts?
    return new Promise((resolve) => {
      io.close(() => {
        console.log('io stopped')
        server.close(() => {
          console.log('http stopped')
          return resolve()
        })
      })
    })
  }
}
