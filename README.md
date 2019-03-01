# blabby
Chat app using [socket.io](https://www.npmjs.com/package/socket.io)

# local-dev
`npm install && npm test && npm start`
- open at least 2 windows of [http://localhost:3000/](http://localhost:3000/)
- Tested on node v11.1.0 and latest chrome

# socket events
| name | payload | description |
| ------ | ---- | ---- |
| `user-introduction` | "name" | clients required to emit this prior to chatting  |
| `user-list` | [user] | clients will recieve user list upon introduction |
| `user-online` | user | emitted upon user introduction |
| `user-offline` | user | emitted when a user disconnects |
| `user-message` | message | emitted when a user sends a message |

## payload types
### user
```
{
    name: 'good doggo',
    id: 'abc123'
}

```
### message
```
{
    user: {...},
    message: 'hi',
    timestamp: 123456789
}
```
# config.json
| name | use |
| ---- | --- |
| port | http port |

# roadmap
- server route which returns supported events
- persist messages for offline users
- ui tests
- ui framework + bundle + support older browsers

# known issues
- un-introduced connected users can recieve events and recieve no error messages if they attempt to send messages
