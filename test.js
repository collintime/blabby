const tap = require('tap')
const http = require('http')
const server = require('./server')

tap.test('server starts up', async test => {
  let s = await server.start()
  test.ok(s, 'the server should start up')
  server.stop()
  test.equal(s.http.listening, false, 'http server should not be listening')
  test.end()
})

tap.test('http handler', test => {
  server.start()
    .then(s => {
      let { address, port } = s.http.address()
      http.get(`http://[${address}]:${port}`, res => {
        test.equal(res.statusCode, 200, 'it should return 200')
        test.equal(res.headers['content-type'], 'text/html', 'it should return html')
        server.stop()
        test.end()
      })
    })
})
