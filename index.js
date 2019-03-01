const config = require('./config')
const server = require('./server')

const init = async () => {
  await server.start(config.port)
}

init()
