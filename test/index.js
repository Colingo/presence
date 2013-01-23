Function.prototype.bind = Function.prototype.bind || function bind(self) {
    var args = Array.prototype.slice.call(arguments, 1)
    var f = this

    return function () {
        f.apply(self, args.concat(arguments))
    }
}

require("./rooms")
require("./people")
require("./scenario")
require("./gapiRoom")
