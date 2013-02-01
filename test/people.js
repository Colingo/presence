var test = require("tape")
var reducers = require("reducers")
var merge = require("reducers/merge")
var enchain = require("enchain")
var Document = require("crdt")
var inspect = require("util").inspect
var event = require("event")
var send = require("event/send")
var mock = require("mock")
var extend = require("xtend")
var Timer = require("time-mock")

var person = require("./util/person")
var connect = require("./lib/connect")
var presence = require("../index")
var rooms = require("../rooms")
var cleanse = require("../cleanse")

var chain = enchain(extend(reducers, {
    expand: require("reducers/expand")
}), {
    fold: reducers.fold
    , into: reducers.into
})

test("presence people #1", function (assert) {
    var room = {
        people: [person("james", true)]
    }

    var doc = Document()
    presence(room, doc)

    chain(rooms(doc)).
        expand(function (room) {
            return room.people
        }).
        // print('\n', ' ============ #1').
        fold(function (person) {
            assert.equal(person.name, "james")
            assert.equal(person.eventType, "add")
            assert.end()
        })
})

test("presence people #2", function (assert) {
    var room = {
        people: [person("james", true), person("james", false)]
    }

    var doc = Document()
    presence(room, doc)

    var list = []

    chain(rooms(doc)).
        expand(function (room) {
            return room.people
        }).
        // print().
        into(list)

    assert.equal(list[0].name, "james")
    assert.equal(list[0].eventType, "remove")
    assert.end()
})

test("presence people #3", function (assert) {
    var people = event()
    var doc = Document()

    presence({ people: people }, doc)

    var list = []

    chain(rooms(doc)).
        expand(function (room) {
            return room.people
        }).
        // print().
        into(list)

    send(people, person("j", true))

    send(people, person("j", false))

    assert.equal(list[0].name, "j")
    assert.equal(list[0].eventType, "add")
    assert.equal(list[1].id, "presence~person~j")
    assert.equal(list[1].eventType, "remove")
    assert.equal(list.length, 2)
    assert.end()
})

test("presence people #4", function (assert) {
    var people = event()
    var doc = Document()
    var room = {
        people: merge([
            [person("j", true), person("k", true)]
            , people
        ])
    }

    presence(room, doc)

    var list = []

    chain(rooms(doc)).
        expand(function (room) {
            return room.people
        }).
        // print("\n").
        into(list)

    send(people, person("j", false))

    send(people, person("k", true))

    assert.equal(list[0].name, "j")
    assert.equal(list[0].eventType, "add")
    assert.equal(list[1].name, "k")
    assert.equal(list[1].eventType, "add")
    assert.equal(list[2].name, "j")
    assert.equal(list[2].eventType, "remove")
    assert.equal(list.length, 3)
    assert.end()
})

test("presence people #5", function (assert) {
    var doc = Document()
    var people = event()
    var room = {
        people: merge([person("a", true), people])
    }
    var time = Timer(Date.now())
    var cleanse = mock("../cleanse", {
        "timers": {
            setTimeout: time.setTimeout
        }
        , "date-now": time.now
    }, require)

    presence(room, doc)
    cleanse(doc)

    var list = []

    chain(rooms(doc)).
        expand(function (room) {
            return room.people
        }).
        // print("\n").
        into(list)

    assert.equal(list[0].eventType, "add")
    assert.equal(list[0].online, true)
    assert.equal(list[0].name, "a")

    time.advance(5000)

    assert.equal(list.length, 2)
    assert.equal(list[1].eventType, "remove")
    assert.equal(list[1].online, false)
    assert.equal(list[1].name, "a")

    send(people, person("a", true, time.now()))

    assert.equal(list.length, 3)
    assert.equal(list[2].eventType, "add")
    assert.equal(list[2].online, true)

    time.advance(3000)

    send(people, person("a", true, time.now()))

    assert.equal(list.length, 3)

    time.advance(2000)

    assert.equal(list.length, 3)

    time.advance(4000)

    assert.equal(list.length, 3)

    time.advance(1000)

    assert.equal(list.length, 4)
    assert.equal(list[3].eventType, "remove")
    assert.equal(list[3].online, false)

    assert.end()
})
