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

  io.on('connection', client => {

    console.log('connected')
  })

  server.listen(3000, err => {
    if (err) {
      return reject(err)
    }
    console.log('server started at port 3000')
  })
