// base-x encoding
// Forked from https://github.com/cryptocoinjs/bs58
// Originally written by Mike Hearn for BitcoinJ
// Copyright (c) 2011 Google Inc
// Ported to JavaScript by Stefan Thomas
// Merged Buffer refactorings from base58-native by Stephen Pair
// Copyright (c) 2013 BitPay Inc
// Copyright (c) 2016 Oleksii Rudenko

var native = require('./native')

module.exports = function base (ALPHABET) {
  function encode (source) {
    if (source.length === 0) return ''
    return native.encode(ALPHABET, source)
  }

  function decode (string) {
    if (string.length === 0) return []
    return native.decode(ALPHABET, string)
  }

  return {
    encode: encode,
    decode: decode
  }
}
