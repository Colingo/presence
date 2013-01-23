# presence

[![build status][1]][2]

[![browser support][3]][4]

Presence information for rooms of people persisted in crdt

## Example

```js
var Document = require("crdt")
var presence = require("presence")

// todo document this
var room = RoomStruct(...)
var doc = Document()

var rooms = presence(doc, room)

fold(rooms, function (room) {
    console.log("room.host", room.host, room.id)

    fold(room.people, function (person) {
        // "add" or "remove"
        console.log("person.eventType", person.eventType)

        console.log("person", person, person.id)
    })
})
```

There are two types of rows that will be added to crdt for the
sake of maintaing presence information, the first is the room

```js
{
    id: "presence~room~" + (room.id || uuid())
    , host: room.host || {}
    , type: "presence~room"
    , ts: Date.now()
}
```

and the second is for the people

```js
{
    id: "presence~person~" + person.id
    , roomId: room.id
    , online: Boolean
    , ts: Date
    /* other properties that are on person objects */
    , type: "presence~person"
}
```

The contract for `room` input is that it's an object with a host
property and a people reducible representing a stream of people
data.

The contract for people is that they look like

```js
{
    id: "some id"
    , ts: Date
    , online: Boolean
}
```

It's your job to have a stream of people data, the online flag is
used to indicate whether someone is online. the id is used for
identity and ts is used by `cleanse` to cleanse any people who
havn't updated their ts recently (i.e. heartbeating)

## Installation

`npm install presence`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Raynos/presence.png
  [2]: http://travis-ci.org/Raynos/presence
  [3]: http://ci.testling.com/Raynos/presence.png
  [4]: http://ci.testling.com/Raynos/presence
