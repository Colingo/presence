var test = require("tape")
var into = require("reducers/into")
var print = require("reducers/debug/print")
// var reducers = require("reducers")
// var enchain = require("enchain")
var mock = require("mock")
var Timer = require("time-mock")

var Hangout = require("./util/hangout")
var gapiRoom = require("../gapiRoom")

// var chain = enchain(reducers, {
//     fold: reducers.fold
//     , into: reducers.into
// })

test("gapiRoom", function (assert) {
    var timer = Timer(0)
    var id = "james"
    var Room = mock("../gapiRoom", {
        "../lib/gapi": {
            hangout: Hangout(id)
        }
    }, require)

    var room = Room({ foo: "bar" })

    assert.deepEqual(room.host, { foo: "bar" })
    assert.equal(room.id, "james")

    assert.end()
})

test("gapiRoom.people", function (assert) {
    var timer = Timer(0)
    var id = "james"
    var hangout = Hangout(id)
    var Room = mock("../gapiRoom", {
        "../lib/gapi": {
            hangout: hangout
        }
        , "timers": {
            setTimeout: timer.setTimeout
            , clearTimeout: timer.clearTimeout
        }
        , "date-now": timer.now
    }, require)

    var room = Room()
    var list = []

    into(room.people, list)

    hangout.add("a")

    assert.equal(list.length, 1)
    assert.equal(list[0].online, true)
    assert.equal(list[0].name, "a")

    hangout.remove("a")

    assert.equal(list.length, 2)
    assert.equal(list[1].online, false)
    assert.equal(list[1].id, "par~id~a")

    hangout.add("a")

    assert.equal(list.length, 3)
    assert.equal(list[2].online, true)
    assert.equal(list[2].id, "par~id~a")

    hangout.add("b")

    assert.equal(list.length, 4)
    assert.equal(list[3].online, true)
    assert.equal(list[3].id, "par~id~b")

    assert.end()
})
