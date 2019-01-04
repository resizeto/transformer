/* eslint-env jest */
const TransformPipeline = require('./transform_pipeline.js')

test('shouldExtract', () => {
  const pipeline = new TransformPipeline({
    top: 1,
    left: 0,
    width: 100,
    height: 100
  })
  expect(pipeline.shouldExtract).toBe(true)
  expect(pipeline.shouldResize).toBe(false)
})

test('shouldResize', () => {
  const pipeline = new TransformPipeline({
    width: 100,
    height: 100
  })
  expect(pipeline.shouldResize).toBe(true)
  expect(pipeline.shouldExtract).toBe(false)
})

test('shouldBlur', () => {
  const pipeline = new TransformPipeline({
    blur: 1
  })
  expect(pipeline.shouldBlur).toBe(true)
})

test('shouldMirror', () => {
  let pipeline = new TransformPipeline({
    mirror: 'x'
  })
  expect(pipeline.shouldMirror).toBe(true)
  pipeline = new TransformPipeline({
    mirror: 'y'
  })
  expect(pipeline.shouldMirror).toBe(true)
})

test('shouldRotate', () => {
  const pipeline = new TransformPipeline({
    rotate: 90
  })
  expect(pipeline.shouldRotate).toBe(true)
})
