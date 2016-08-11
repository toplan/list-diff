list-diff
=================
[![build](https://circleci.com/gh/toplan/list-diff/tree/master.png?style=shield)](https://circleci.com/gh/toplan/list-diff) 
[![codecov.io](https://codecov.io/github/toplan/list-diff/coverage.svg?branch=master)](https://codecov.io/github/toplan/list-diff?branch=master) 
[![npm version](https://badge.fury.io/js/list-diff.js.svg)](https://badge.fury.io/js/list-diff.js) 
[![Dependency Status](https://david-dm.org/toplan/list-diff.svg)](https://david-dm.org/toplan/list-diff) 

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## Introduction

Diff two lists/strings in time O(n*m).
The algorithm finding the minimal amount of moves(patches) is [Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance).

## Install

    $ npm install list-diff.js --save

## Usage

```javascript
var diff = require("list-diff.js")
var oldList = [{id: "a"}, {id: "b"}, {id: "c"}, {id: "d"}, {id: "e"}]
var newList = [{id: "c"}, {id: "a"}, {id: "b"}, {id: "e"}, {id: "f"}]

var patches = diff(oldList, newList, "id")

patches.forEach(function (patch) {
  if (patch.type === diff.DELETION) {
    oldList.splice(patch.index, 1)
  } else if (patch.type === diff.INSERTION) {
    oldList.splice(patch.index, 0, patch.item)
  } else if (patch.type === diff.SUBSTITUTION) {
    oldList.splice(patch.index, 1, patch.item)
  }
})

// now `oldList` is equal to `newList`
// [{id: "c"}, {id: "a"}, {id: "b"}, {id: "e"}, {id: "f"}]
console.log(oldList)
```

## License 
MIT