var reducible = require("reducible/reducible")
var setTimeout = require("timers").setTimeout
var clearTimeout = require("timers").clearTimeout
var now = require("date-now")

var invoker = require("./lib/invoker")
var gapi = require("./lib/gapi")

module.exports = Room

/* Room representation for a google plus hangout.

    The people reducible is populated from participant changed
    events.

*/
function Room(host) {
    var hangout = gapi.hangout
    var id = hangout.getHangoutId()

    var people = reducible(function (next, state) {
        var invoke = invoker(next, state, cleanup)

        hangout.onParticipantsAdded.add(onAdd)

        hangout.onParticipantsRemoved.add(onRemove)

        hangout.getParticipants().forEach(add)

        var timer = setTimeout(function loop() {
            hangout.getParticipants().forEach(add)

            timer = setTimeout(loop, 1000)
        }, 1000)

        function onAdd(event) {
            event.addedParticipants.forEach(add)
        }

        function onRemove(event) {
            event.removedParticipants.forEach(remove)
        }

        function add(par) {
            invoke({
                id: par.person.id
                , imageUri: par.person.image.url
                , name: par.person.displayName
                , online: true
                , ts: now()
            })
        }

        function remove(par) {
            invoke({
                id: par.person.id
                , online: false
            })
        }

        function cleanup(callback) {
            clearTimeout(timer)
            hangout.onParticipantsAdded.remove(onAdd)
            hangout.onParticipantsRemoved.remove(onRemove)

            callback(null)
        }
    })

    return {
        id: id
        , host: host
        , people: people
    }
}
