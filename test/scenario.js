var test = require("tape")
var reducers = require("reducers")
var enchain = require("enchain")
var Document = require("crdt")

var person = require("./util/person")
var pipe = require("./lib/pipe")
var presence = require("../index")
var rooms = require("../rooms")
var cleanse = require("../cleanse")

var chain = enchain(reducers, {
    fold: reducers.fold
    , into: reducers.into
})

/*
  - Teacher A is in room A
  - Learner B joins room B
  - Teacher A needs to see presence data for Learner B
*/
test("scenario #1", function (assert) {
    var docA = Document()
    var roomA = {
        people: [person("A", true)]
    }

    var docB = Document()
    var roomB = {
        people: [person("B", true)]
    }

    var server = Document()

    presence(roomA, docA)
    presence(roomB, docB)

    pipe(server, docA)

    var list = []

    chain(rooms(docA)).
        expand(function (room) {
            return room.people
        }).
        // print("\n").
        into(list)

    assert.equal(list.length, 1)

    pipe(server, docB)

    assert.equal(list.length, 2)
    assert.equal(list[1].name, "B")
    assert.equal(list[1].eventType, "add")

    assert.end()
})

/*
  - Learner A is in room A
  - Teacher B joins room B
  - Teacher B needs to see presence data from room A
*/
test("scenario #2", function (assert) {
    var docA = Document()
    var roomA = {
        people: [person("A", true)]
    }

    var docB = Document()
    var roomB = {
        people: [person("B", true)]
    }

    var server = Document()

    presence(roomA, docA)
    presence(roomB, docB)

    pipe(server, docA)
    pipe(server, docB)

    var list = []

    chain(rooms(docB)).
        expand(function (room) {
            return room.people
        }).
        // print("\n").
        into(list)

    assert.equal(list.length, 2)
    assert.equal(list[1].name, "A")
    assert.equal(list[1].eventType, "add")

    assert.end()
})
