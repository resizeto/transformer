# resize.to transformer

[![Greenkeeper badge](https://badges.greenkeeper.io/resizeto/transformer.svg)](https://greenkeeper.io/)
[![Coverage Status](https://coveralls.io/repos/github/resizeto/transformer/badge.svg?branch=master)](https://coveralls.io/github/resizeto/transformer?branch=master)

Uses Sharp and streams to transform an image. It is meant to be used with an [options-parser](https://github.com/resizeto/options-parser). This is a building block for creating image transformation services.

Example of using it directly:

```
const fs = require('fs')
const inputPath = 'path/to/image.jpg'
const inputStream = fs.createReadStream(inputPath)
const outputPAth = 'path/to/transformed/image.jpg'
const outputStream = fs.createWriteStream(outputPath)
const transformer = new Transformer([
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
], inputPath)
transformer.transform(inputStream, outputStream)
```
