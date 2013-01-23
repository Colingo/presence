module.exports = person

function person(name, online, ts) {
    return {
        name: name
        , id: name
        , online: online
        , ts: ts || Date.now()
    }
}
