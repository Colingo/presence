module.exports = pipe

function pipe(a, b) {
    var streamA = a.createStream()
    var streamB = b.createStream()
    streamA.pipe(streamB).pipe(streamA)
    streamA.resume()
    streamB.resume()
}
