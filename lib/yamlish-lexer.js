const through = require('through2')

const isUnknown = chunk => chunk.type === 'unknown'
const isOpen = chunk => isUnknown(chunk) && /^  ---\n$/.test(chunk.value)
const isClose = chunk => isUnknown(chunk) && /^  \.\.\.\n$/.test(chunk.value)

const yamlishLexer = () => {
  let lastType = undefined
  let processing = false
  const lines = []
  return through.obj(function (chunk, enc, cb) {
    if (processing) {
      lines.push(chunk.value)
      if (isClose(chunk)) {
        processing = false
        lastType = undefined
        this.push({type: 'yamlish', value: lines.join('')})
      }
      return cb()
    }
    if (isOpen(chunk) && lastType === 'test') {
      processing = true
      lines.push(chunk.value)
      return cb()
    }
    lastType = chunk.type
    this.push(chunk)
    cb()
  })
}

module.exports = yamlishLexer