/*
 * Diff two lists/strings in O(n*m)
 *
 * @param {Array} oldList - Original List
 * @param {Array} newList - List After certain insertions, removes, or moves
 * @return {Object} - {distance: Int}
 *                  - {roadmap: <Array>}
 *                  - {patches: <Array>}
 *                  - patches is a list of patches that telling how to remove and insert
 */
;(function (factory) {
  'use strict'

  if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = factory()
    return
  }
  if (typeof window !== 'undefined') {
    window.listDiff = factory()
  }
}(function () {
  'use strict'

  //patch type
  var DELETION = 0
  var INSERTION = 1
  var SUBSTITUTION = 2

  //<Array|String> lists
  var oldList, newList
  //<String> key name
  var keyName
  //<Array> roadmap
  var roadmap
  //<Int> distance value
  var distance
  //<Array> patches for old list/string
  var patches

  var isArray = Array.isArray || function (target) {
    return target && Object.prototype.toString.call(target) === "[object Array]"
  }

  function Patch(index, type, item) {
    if (!(this instanceof Patch)) {
      return new Patch(index, type, item)
    }
    this.index = index
    this.type = type
    this.item = item
  }

  function init($oldList, $newList, $keyName) {
    roadmap = []
    distance = 0
    patches = []

    oldList = $oldList || []
    newList = $newList || []
    keyName = $keyName

    initRoadmap()
  }

  function initRoadmap() {
    var oldLen = oldList.length
    var newLen = newList.length
    for (var i = 0; i <= oldLen; i++) {
      roadmap[i] = [i]
    }
    for (var i = 0; i <= newLen; i++) {
      roadmap[0][i] = i
    }
  }

  function compute() {
    var oldLen = oldList.length
    var newLen = newList.length
    for (var i = 1; i <= oldLen; i++) {
      for (var j = 1; j <= newLen; j++) {
        var deletionDis = deletion(i, j)
        var insertionDis = insertion(i, j)
        var substitutionDis = substitution(i, j)
        roadmap[i][j] = distance = Math.min(deletionDis, insertionDis, substitutionDis)
      }
    }
    createPatches()
  }

  function deletion(oldPos, newPos) {
    return roadmap[oldPos - 1][newPos] + 1
  }

  function insertion(oldPos, newPos) {
    return roadmap[oldPos][newPos - 1] + 1
  }

  function substitution(oldPos, newPos) {
    var oldItem = oldList[oldPos - 1]
    var newItem = newList[newPos - 1]
    return roadmap[oldPos - 1][newPos - 1] + cost(oldItem, newItem)
  }

  function cost(oldItem, newItem) {
    if (newItem === oldItem) {
      return 0
    }
    if (typeof oldItem === 'object' && typeof newItem === 'object') {
      if (!keyName || !(keyName in oldItem) || !(keyName in newItem)) {
        return 1
      }
      if (oldItem[keyName] === newItem[keyName]) {
        return 0
      }
    }
    return 1
  }

  function createPatches() {
    var oldPos = roadmap.length - 1
    var newPos = ((roadmap[0] && roadmap[0].length) || 0) - 1

    while (oldPos > 0 && newPos > 0) {
      var distance = roadmap[oldPos][newPos]
      var deletion = roadmap[oldPos - 1][newPos]
      var insertion = roadmap[oldPos][newPos - 1]
      var substitution = roadmap[oldPos - 1][newPos - 1]
      if (distance == deletion + 1) {
        patches.unshift(Patch(oldPos - 1, DELETION))
        oldPos--
        continue
      }
      if (distance == insertion + 1) {
        patches.unshift(Patch(oldPos - 1, INSERTION, newList[newPos - 1]))
        newPos--
        continue
      }
      if (distance === substitution + 1) {
        patches.unshift(Patch(oldPos - 1, SUBSTITUTION, newList[newPos - 1]))
      }
      oldPos--
      newPos--
    }
  }

  function destory() {
    oldList = newList = keyName = void 0
    roadmap = patches = void 0
    distance = 0
  }

  function diff(oldList, newList, keyName) {
    if (typeof oldList !== 'string' && !isArray(oldList)) {
      oldList = [oldList]
    }
    if (typeof newList !== 'string' && !isArray(newList)) {
      newList = [newList]
    }

    //initialize the data
    init(oldList, newList, keyName)
    //start computing
    compute()
    //generate the result data
    var result = {
      distance: distance,
      roadmap: roadmap,
      patches: patches
    }
    //destory data
    destory()

    return result
  }

  diff.DELETION = DELETION
  diff.INSERTION = INSERTION
  diff.SUBSTITUTION = SUBSTITUTION

  return diff
}))
