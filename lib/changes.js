var reducible = require("reducible")

var invoker = require("./invoker")

module.exports = changes

function changes(set) {
    return reducible(function (next, state) {
        var invoke = invoker(next, state, cleanup)

        set.forEach(function initial(row) {
            invoke({
                row: row
                , initial: true
            })
        })
        set.on("changes", onchanges)

        function onchanges(row, changed) {
            invoke({
                row: row
                , initial: false
                , changed: changed
            })
        }

        function cleanup(cb) {
            set.removeListener("changes", onchanges)

            cb(null)
        }
    })
}
