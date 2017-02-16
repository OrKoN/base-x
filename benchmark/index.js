'use strict'
var crypto = require('crypto')
var benchmark = require('benchmark')
var suiteEncode = new benchmark.Suite()
var suiteDecode = new benchmark.Suite()
var benchmarks = require('beautify-benchmark')
var XorShift128Plus = require('xorshift.js').XorShift128Plus

var bs58ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
var bs58Rust = require('../')(bs58ALPHABET)
var bs58Js = require('base-x')(bs58ALPHABET)

var fixtureIndex = 0
var resetFixtureIndex = function () { fixtureIndex = 0 }
var fixtures = new Array(10000)
var getNextFixture = function () {
  var fixture = fixtures[fixtureIndex++]
  if (fixtureIndex === fixtures.length) {
    fixtureIndex = 0
  }

  return fixture
}

var seed = process.env.SEED || crypto.randomBytes(16).toString('hex')
console.log('Seed: ' + seed)
var prng = new XorShift128Plus(seed)
for (var i = 0; i < fixtures.length; ++i) {
  var source = prng.randomBytes(32)
  fixtures[i] = { source, string: bs58Js.encode(source) }
}

if (/fast/i.test(process.argv[2])) {
  console.log('Running in fast mode...')
  benchmark.options.minTime = 0.3
  benchmark.options.maxTime = 1
  benchmark.options.minSamples = 3
} else {
  benchmark.options.minTime = 1
}

suiteEncode
.on('cycle', function (event) {
  benchmarks.add(event.target)
})

suiteEncode.on('complete', function () {
  benchmarks.log()
})

suiteEncode
.add('rust_encode', function () {
  var fixture = getNextFixture()
  bs58Rust.encode(fixture.source)
}, {onStart: resetFixtureIndex, onCycle: resetFixtureIndex})

.add('js_encode', function () {
  var fixture = getNextFixture()
  bs58Js.encode(fixture.source)
}, {onStart: resetFixtureIndex, onCycle: resetFixtureIndex})
.run()

suiteDecode
.on('cycle', function (event) {
  benchmarks.add(event.target)
})

suiteDecode.on('complete', function () {
  benchmarks.log()
})

suiteDecode
.add('js_decode', function () {
  var fixture = getNextFixture()
  bs58Js.decode(fixture.string)
}, {onStart: resetFixtureIndex, onCycle: resetFixtureIndex})
.add('rust_decode', function () {
  var fixture = getNextFixture()
  bs58Rust.decode(fixture.string)
}, {onStart: resetFixtureIndex, onCycle: resetFixtureIndex})
.run()
