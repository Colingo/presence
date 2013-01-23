var EventEmitter = require("events").EventEmitter
var extend = require("xtend")

module.exports = Hangout

function Hangout(id) {
    var participants = []
    var hangout = new EventEmitter()

    return extend(hangout, {
        getHangoutId: getHangoutId
        , add: add
        , remove: remove
        , getParticipants: getParticipants
        , onParticipantsRemoved: {
            add: onRemove
            , remove: offRemove
        }
        , onParticipantsAdded: {
            add: onAdd
            , remove: offAdd
        }
    })

    function getHangoutId() {
        return id
    }

    function add(name) {
        var par = {
            id: "par~id~" + name
            , person: {
                id: "par~id~" + name
                , displayName: name
                , image: {
                    url: "http://images.com/" + name
                }
            }
        }

        participants.push(par)

        hangout.emit("add", {
            addedParticipants: [par]
        })
    }

    function remove(name) {
        var index = participants.map(function (par) {
            return par.id
        }).indexOf("par~id~" + name)
        var par = participants[index]

        participants.splice(index, 1)

        hangout.emit("remove", {
            removedParticipants: [par]
        })
    }

    function getParticipants() {
        return participants
    }

    function onRemove(cb) {
        hangout.on("remove", cb)
    }

    function offRemove(cb) {
        hangout.removeListener("remove", cb)
    }

    function onAdd(cb) {
        hangout.on("add", cb)
    }

    function offAdd(cb) {
        hangout.removeListener("add", cb)
    }
}
