function mockImage (success = true, delay = 100) {
    global.Image = class {
        constructor() {
            this.style = {}
            setTimeout(() => (success ? this.onload : this.onerror)(), delay)
        }
    }
}


function mockSpeak () {
    const speak = jest.fn(text => text)
    global.SpeechSynthesisUtterance = function (text) { return { text } }
    global.speechSynthesis = { speak }
    return speak
}


module.exports = {
    mockImage,
    mockSpeak,
}
