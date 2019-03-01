const server = require('./server')

const init = async () => {
  await server.start()
}

init()
