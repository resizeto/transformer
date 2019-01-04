/* eslint-env jest */
const { MissingOutputFormatError, InvalidOutputFormatError } = require('./errors.js')
const Transformer = require('./transformer.js')

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
