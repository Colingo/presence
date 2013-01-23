var setTimeout = require("timers").setTimeout
var now = require("date-now")

var SECOND = 1000

module.exports = cleanse

function cleanse(doc) {
    var set = doc.createSet("type", "presence~person")

    loop()

    function loop() {
        var ts = now()
        set.forEach(function (row) {
            var state = row.state
            if (state.ts <= ts - 5 * SECOND) {
                row.set("online", false)
            }
        })

        setTimeout(loop, 5000)
    }
}
