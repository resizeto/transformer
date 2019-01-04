const { InvalidOutputFormatError } = require('./errors.js')
const Sharp = require('sharp')

class TransformPipeline {
  constructor (options) {
    this.options = options
    this.pipeline = new Sharp()
    this.setupPipeline()
  }

  setupPipeline () {
    this.exifRotate()
    if (this.shouldExtract) this.extract()
    if (this.shouldResize) this.resize()
    if (this.shouldRotate) this.rotate()
    if (this.shouldMirror) this.mirror()
    if (this.shouldBlur) this.blur()
  }

  exifRotate () {
    this.pipeline.rotate()
  }

  blur () {
    this.pipeline.blur(this.options.blur)
  }

  extract () {
    this.pipeline.extract({
      top: this.options.top,
      left: this.options.left,
      width: this.options.width,
      height: this.options.height
    })
  }

  resize () {
    this.pipeline.resize(this.options.width, this.options.height, {
      fit: this.options.fit,
      position: this.options.gravity,
      background: this.options.backgroundrgb
    })
  }

  mirror () {
    this.pipeline[this.options.mirror === 'x' ? 'flop' : 'flip']()
  }

  rotate () {
    this.pipeline.rotate(this.options.rotate, {
      background: this.options.backgroundrgb
    })
  }

  toFormat (format) {
    // TODO: maybe check if valid format?
    let valid = ['jpeg', 'png', 'webp']
    if (valid.indexOf(format) === -1) {
      throw new InvalidOutputFormatError(`${format} is not a supported output (${valid.join(',')})`)
    }
    this.pipeline.toFormat(format, {
      quality: this.options.quality,
      progressive: true
    })
  }

  get shouldExtract () {
    return this.options.top != null && this.options.left != null && this.options.width != null && this.options.height != null
  }

  get shouldResize () {
    return !this.shouldExtract && (this.options.width != null || this.options.height != null)
  }

  get shouldBlur () {
    return this.options.blur != null
  }

  get shouldMirror () {
    return this.options.mirror != null
  }

  get shouldRotate () {
    return this.options.rotate != null
  }
}

module.exports = TransformPipeline
