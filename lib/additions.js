var reducible = require("reducible")

var invoker = require("./invoker")

module.exports = additions

function additions(set) {
    return reducible(function (next, state) {
        var invoke = invoker(next, state, cleanup)

        set.forEach(function initial(row) {
            invoke({
                row: row
                , initial: true
            })
        })
        set.on("add", onadd)

        function onadd(row) {
            invoke({
                row: row
                , initial: false
            })
        }

        function cleanup(cb) {
            set.removeListener("add", onadd)

            cb(null)
        }
    })
}
