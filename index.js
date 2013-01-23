var uuid = require("node-uuid")
var extend = require("xtend")
var fold = require("reducers/fold")

module.exports = presence

function presence(room, doc) {
    var roomId = "presence~room~" + (room.id || uuid())

    doc.add(extend(room, {
        id: roomId
        , type: "presence~room"
        , ts: Date.now()
    }))

    fold(room.people, function (person) {
        doc.add(extend(person, {
            id: "presence~person~" + person.id
            , roomId: roomId
            , type: "presence~person"
        }))
    })
}
