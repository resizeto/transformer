class MissingOutputFormatError extends Error {
  get name () {
    return 'MissingOutputFormatError'
  }
}
class InvalidOutputFormatError extends Error {
  get name () {
    return 'InvalidOutputFormatError'
  }
}

module.exports = {
  MissingOutputFormatError,
  InvalidOutputFormatError
}
