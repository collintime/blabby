const tap = require('tap')
const http = require('http')
const server = require('./server')
const io = require('socket.io-client')
const pEvent = require('p-event')

tap.test('server starts up', async test => {
  let s = await server.start()
  test.ok(s, 'the server should start up')
  await server.stop()
  test.equal(s.http.listening, false, 'http server should not be listening')
  test.end()
})

const getUrl = (s) => {
  let { address, port } = s.http.address()
  return `http://[${address}]:${port}`
}

const executeGetRequest = async (url) => {
  return new Promise(resolve => {
    http.get(url, res => {
      return resolve(res)
    })
  })
}

tap.test('http handler', async test => {
  let s = await server.start()
  let res = await executeGetRequest(getUrl(s))
  test.equal(res.statusCode, 200, 'it should return 200')
  test.equal(res.headers['content-type'], 'text/html', 'it should return html')
  await server.stop()
  test.end()
})

let socketFactory = async (url) => {
  let socket = io.connect(url)
  await pEvent(socket, 'connect')
  return socket
}

let getSockets = async (server) => {
  let url = getUrl(server)
  return [await socketFactory(url), await socketFactory(url)]
}

let givenTwoOnlineUsers = async (server) => {
  let sockets = await getSockets(server)
  sockets.forEach((s, i) => s.emit('user-introduction', `user-${i}`))
  return sockets
}

tap.test('users should receive a list of current users when they come online', async test => {
  let s = await server.start()
  let [socketOne, socketTwo] = await givenTwoOnlineUsers(s)
  const users = await pEvent(socketTwo, 'user-list')
  test.same(users.map(u => u.name), ['user-0', 'user-1'], 'it should return a list of all current users')
  test.ok(users.every(u => u.id), 'users should have ids')
  socketOne.disconnect()
  socketTwo.disconnect()
  await server.stop()
  test.end()
})

tap.test('users should recieve other users messages', async test => {
  let s = await server.start()
  let [socketOne, socketTwo] = await givenTwoOnlineUsers(s)
  socketOne.emit('user-message', 'hello there')
  let payload = await pEvent(socketTwo, 'user-message')
  test.equal(payload.message, 'hello there', 'it should pass the message between users')
  test.ok(payload.timestamp, 'the payload should be timestampted')
  test.equal(payload.user.name, 'user-0', 'the payload should include user data')
  socketOne.disconnect()
  socketTwo.disconnect()
  await server.stop()
  test.end()
})

tap.test('when users connect and disconnect, other users should be notified', async test => {
  let s = await server.start()
  let [socketOne, socketTwo] = await givenTwoOnlineUsers(s)
  let onlinePayload = await pEvent(socketTwo, 'user-online')
  test.equal(onlinePayload.name, 'user-0', 'it should send user two the new users info')
  socketTwo.disconnect()
  let payload = await pEvent(socketOne, 'user-offline')
  test.equal(payload.name, 'user-1', 'it should return the offline user')
  test.ok(payload.id, 'the user should have an id')
  socketOne.disconnect()
  await server.stop()
  test.end()
})
