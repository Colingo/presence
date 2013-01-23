var extend = require("xtend")
var map = require("reducers/map")
var expand = require("reducers/expand")

var additions = require("./lib/additions")
var changes = require("./lib/changes")

module.exports = createRooms

function createRooms(doc) {
    var set = doc.createSet("type", "presence~room")

    return map(additions(set), function (value) {
        var state = value.row.state

        return extend({}, state, {
            people: createPeople(doc, state.id)
        })
    })
}

function createPeople(doc, roomId) {
    var set = doc.createSet(function (state) {
        return state.type === "presence~person" && state.roomId === roomId
    })
    var hash = {}

    return expand(changes(set), function (value) {
        var row = value.row
        var state = row.state

        if (state.online === true && hash[state.id] !== true) {
            hash[state.id] = true

            return extend({}, state, {
                eventType: "add"
            })
        } else if (state.online === false && hash[state.id] !== false ) {
            hash[state.id] = false

            return extend({}, state, {
                eventType: "remove"
            })
        }
    })
}
