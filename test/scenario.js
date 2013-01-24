var test = require("tape")
var reducers = require("reducers")
var merge = require("reducers/merge")
var enchain = require("enchain")
var Document = require("crdt")
var mock = require("mock")
var Timer = require("time-mock")
var event = require("event")
var send = require("event/send")

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

    pipe(server, docA)

    presence(roomA, docA)

    var list = []

    chain(rooms(docA)).
        expand(function (room) {
            return room.people
        }).
        // print("\n").
        into(list)

    assert.equal(list.length, 1)

    pipe(server, docB)

    presence(roomB, docB)

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
        people: person("A", true)
    }

    var docB = Document()
    var roomB = {
        people: person("B", true)
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

/*
  - Learner A is in room A
  - Teacher B joins room B
  - Teacher B starts cleansing
  - Learner A touches it's ts on an interval
  - Teacher B continues to see presence from room A

*/
test("sceneario #3", function (assert) {
    var docA = Document()
    var peopleA = event()
    var roomA = {
        people: merge([person("A", true), peopleA])
    }

    var docB = Document()
    var peopleB = event()
    var roomB = {
        people: merge([person("B", true), peopleB])
    }

    var server = Document()
    var time = Timer(0)
    var cleanse = mock("../cleanse", {
        "timers": {
            setTimeout: time.setTimeout
        }
        , "date-now": time.now
    }, require)

    presence(roomA, docA)
    presence(roomB, docB)
    cleanse(docB)

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
    assert.equal(list[0].name, "B")
    assert.equal(list[0].eventType, "add")
    assert.equal(list[1].name, "A")
    assert.equal(list[1].eventType, "add")

    time.advance(4000)

    send(peopleA, person("A", true, time.now()))
    send(peopleB, person("B", true, time.now()))

    time.advance(3000)

    assert.equal(list.length, 2)

    assert.end()
})
