var Document = require("crdt")

var pipe = require("./pipe")

var slice = Array.prototype.slice

module.exports = connect

function connect() {
    var server = Document()
    server.setMaxListeners(Infinity)

    slice.call(arguments).
        forEach(function (doc) {
            pipe(doc, server)
        })

    return server
}
