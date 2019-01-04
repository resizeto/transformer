const { MissingOutputFormatError } = require('./errors.js')
const TransformPipeline = require('./transform_pipeline.js')
const pump = require('pump')
const mime = require('mime-types')

class Transformer {
  constructor (optionsCollection, path) {
    this.optionsCollection = optionsCollection
    this.path = path
    this.inputFormat = mime.extension(mime.lookup(this.path))
    this.outputFormat = this.inputFormat
    this.setupStreams()
  }

  setupStreams () {
    this.streams = this.optionsCollection.map((options, index) => {
      this.outputFormat = mime.extension(mime.lookup(options.output)) || this.outputFormat
      const transformPipeline = new TransformPipeline(options)
      if (this.optionsCollection.length === index + 1 && this.outputFormat) {
        transformPipeline.toFormat(this.outputFormat)
      }
      return transformPipeline.pipeline
    })

    this.streams.reduce((prevStream, nextStream) => {
      pump(prevStream, nextStream)
      return nextStream
    })

    if (!this.outputFormat) {
      throw new MissingOutputFormatError('Could not determine the output format')
    }

    this.outputContentType = mime.lookup(this.outputFormat)
  }

  transform (inputStream, outputStream) {
    pump(inputStream, this.first)
    pump(this.last, outputStream)
  }

  get first () {
    return this.streams[0]
  }

  get last () {
    return this.streams[this.streams.length - 1]
  }
}

module.exports = Transformer
