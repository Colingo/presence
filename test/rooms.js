var test = require("tape")
var fold = require("reducers/fold")
var inspect = require("util").inspect
var Document = require("crdt")

var connect = require("./lib/connect")

var presence = require("../index")
var rooms = require("../rooms")

test("presence is a function", function (assert) {
    assert.equal(typeof presence, "function")
    assert.end()
})

test("presence returns a room when given room", function (assert) {
    var room = {
        host: { name: "steve" }
    }

    var doc = Document()
    presence(room, doc)

    fold(rooms(doc), function (room) {
        assert.ok(room.id)
        assert.equal(room.host.name, "steve")
        assert.ok(room.people)
        assert.end()
    })
})

test("two connected presences give two rooms", function (assert) {
    var room1 = {
        host: { name: "steve" }
    }
    var room2 = {
        host: { name: "bob" }
    }

    var doc1 = Document()
    var doc2 = Document()
    presence(room1, doc1)
    presence(room2, doc2)

    connect(doc1, doc2)

    var list = []

    fold(rooms(doc1), function (room) {
        list.push(room.host)
    })

    assert.deepEqual(list, [{
        name: "steve"
    }, {
        name: "bob"
    }])
    assert.end()
})

test("many connected presences give many rooms", function (assert) {
    var roomMocks = [{
        host: {
            name: "one"
        }
    }, {
        host: {
            name: "two"
        }
    }, {
        host: {
            name: "three"
        }
    }, {
        host: {
            name: "four"
        }
    }, {
        host: {
            name: "five"
        }
    }]

    var docs = roomMocks.map(function (room) {
        var doc = Document()
        presence(room, doc)
        return doc
    })

    connect.apply(null, docs)

    var list = []

    fold(rooms(docs[0]), function (room) {
        list.push(room.host)
    })

    assert.deepEqual(list, roomMocks.map(function (room) {
        return room.host
    }))
    assert.end()
})
