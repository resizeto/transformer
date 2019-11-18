/* eslint-env jest */
const { MissingOutputFormatError, InvalidOutputFormatError } = require('./errors.js')
const Transformer = require('./transformer.js')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const pump = require('pump')
const concat = require('concat-stream')

// https://github.com/lovell/sharp/blob/11daa3b4d1a05dcf4599961486a7c839341b11c1/test/fixtures/index.js#L14
// Generates a 64-bit-as-binary-string image fingerprint
// Based on the dHash gradient method - see http://www.hackerfactor.com/blog/index.php?/archives/529-Kind-of-Like-That.html
const fingerprint = function (image, callback) {
  sharp(image)
    .flatten('gray')
    .greyscale()
    .normalise()
    .resize(9, 8, { fit: sharp.fit.fill })
    .raw()
    .toBuffer(function (err, data) {
      if (err) {
        callback(err)
      } else {
        let fingerprint = ''
        for (let col = 0; col < 8; col++) {
          for (let row = 0; row < 8; row++) {
            const left = data[(row * 8) + col]
            const right = data[(row * 8) + col + 1]
            fingerprint = fingerprint + (left < right ? '1' : '0')
          }
        }
        callback(null, fingerprint)
      }
    })
}

// https://github.com/lovell/sharp/blob/11daa3b4d1a05dcf4599961486a7c839341b11c1/test/fixtures/index.js#L135
const assertSimilar = function (expectedImage, actualImage, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  if (typeof options === 'undefined' && options === null) {
    options = {}
  }

  if (options.threshold === null || typeof options.threshold === 'undefined') {
    options.threshold = 5 // ~7% threshold
  }

  if (typeof options.threshold !== 'number') {
    throw new TypeError('`options.threshold` must be a number')
  }

  if (typeof callback !== 'function') {
    throw new TypeError('`callback` must be a function')
  }

  fingerprint(expectedImage, function (err, expectedFingerprint) {
    if (err) return callback(err)
    fingerprint(actualImage, function (err, actualFingerprint) {
      if (err) return callback(err)
      let distance = 0
      for (let i = 0; i < 64; i++) {
        if (expectedFingerprint[i] !== actualFingerprint[i]) {
          distance++
        }
      }

      if (distance > options.threshold) {
        return callback(new Error('Expected maximum similarity distance: ' + options.threshold + '. Actual: ' + distance + '.'))
      }

      callback()
    })
  })
}

test('output format error', () => {
  const options = [
    {
      blur: 0.3
    }
  ]
  expect(() => {
    const transformer = new Transformer(options, 'test/noextension') // eslint-disable-line
  }).toThrow(MissingOutputFormatError)
})

test('output format from path', () => {
  const options = [
    {
      blur: 0.3
    }
  ]
  const transformer = new Transformer(options, 'test/test.jpg')
  expect(transformer.inputFormat).toBe('jpeg')
  expect(transformer.outputFormat).toBe('jpeg')
  expect(transformer.outputContentType).toBe('image/jpeg')
})

test('output format from options', () => {
  const options = [
    {
      blur: 0.3,
      output: 'webp'
    },
    {
      output: 'png'
    }
  ]
  const transformer = new Transformer(options, 'test/test.jpg')
  expect(transformer.inputFormat).toBe('jpeg')
  expect(transformer.outputFormat).toBe('png')
  expect(transformer.outputContentType).toBe('image/png')
})

test('invalid output format from path', () => {
  const options = [
    { blur: 0.3 }
  ]

  expect(() => {
    const transformer = new Transformer(options, 'test/test.svg') // eslint-disable-line
  }).toThrow(InvalidOutputFormatError)
})

test('invalid output format from options', () => {
  const options = [
    {
      blur: 0.3,
      output: 'tiff'
    }
  ]
  expect(() => {
    const transformer = new Transformer(options, 'test/test.png') // eslint-disable-line
  }).toThrow(InvalidOutputFormatError)
})

test('check with `toBuffer`', (done) => {
  const inputPath = path.resolve(__dirname, '..', 'fixtures', '1.jpg')
  const inputStream = fs.createReadStream(inputPath)

  const transformer = new Transformer([
    {
      backgroundalpha: 1,
      backgroundcolor: '#000',
      backgroundrgb: 'rgb(0, 0, 0)',
      blur: 10,
      fit: 'cover',
      gravity: 'center',
      height: 200,
      left: null,
      mirror: null,
      output: null,
      quality: 80,
      rotate: null,
      top: null,
      version: null,
      width: 400
    }
  ], inputPath)

  pump(inputStream, transformer.first)
  transformer.last.toBuffer((err, data, info) => {
    const expectedOutput = path.resolve(__dirname, '..', 'fixtures', '1-1.jpg')
    expect(err).toStrictEqual(null)
    expect(info.format).toStrictEqual('jpeg')
    expect(info.width).toStrictEqual(400)
    expect(info.height).toStrictEqual(200)
    assertSimilar(expectedOutput, data, done)
  })
})

test('check output via `transform`', (done) => {
  const inputPath = path.resolve(__dirname, '..', 'fixtures', '1.jpg')
  const inputStream = fs.createReadStream(inputPath)

  const transformer = new Transformer([
    {
      backgroundalpha: 1,
      backgroundcolor: '#000',
      backgroundrgb: 'rgb(0, 0, 0)',
      blur: 10,
      fit: 'cover',
      gravity: 'center',
      height: 200,
      left: null,
      mirror: 'x',
      output: null,
      quality: 80,
      rotate: null,
      top: null,
      version: null,
      width: 400
    }
  ], inputPath)

  const outputStream = concat((buffer) => {
    const expectedOutput = path.resolve(__dirname, '..', 'fixtures', '1-2.jpg')
    assertSimilar(expectedOutput, buffer, done)
  })

  transformer.transform(inputStream, outputStream)
})
