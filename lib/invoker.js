var isReduced = require("reducible/is-reduced")
var end = require("reducible/end")

module.exports = invoker

function invoker(next, state, cleanup) {
    var ended = false

    return function invoke(value) {
        if (!ended) {
            state = next(value, state)
        }

        if (isReduced(state)) {
            ended = true
            cleanup(function (err) {
                if (err) {
                    return next(err, state)
                }

                next(end, state)
            })
        }
    }
}
