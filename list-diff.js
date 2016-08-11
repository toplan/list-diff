/*
 * Diff two lists/strings in O(n*m)
 *
 * @param {Array} oldList - Original List
 * @param {Array} newList - List After certain insertions, removes, or moves
 *
 * @return {Array} - a list of patches that telling how to remove and insert
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

  // patch type
  var DELETION = 0
  var INSERTION = 1
  var SUBSTITUTION = 2

  // <Array|String> lists
  var oldList, newList
  // <String> key name
  var keyName
  // <Array> roadmap
  var roadmap
  // <Array> patches for old list/string
  var patches

  var isArray = Array.isArray || function (target) {
    return target && Object.prototype.toString.call(target) === '[object Array]'
  }

  function Patch (index, type, item) {
    if (!(this instanceof Patch)) {
      return new Patch(index, type, item)
    }
    this.index = index
    this.type = type
    this.item = item
  }

  function init ($oldList, $newList, $keyName) {
    roadmap = []
    patches = []

    oldList = $oldList || []
    newList = $newList || []
    keyName = $keyName

    initRoadmap()
  }

  function initRoadmap () {
    var oldLen = oldList.length
    var newLen = newList.length
    for (var i = 0; i <= oldLen; i++) {
      roadmap[i] = [i]
    }
    for (i = 0; i <= newLen; i++) {
      roadmap[0][i] = i
    }
  }

  function compute () {
    var oldLen = oldList.length
    var newLen = newList.length
    for (var i = 1; i <= oldLen; i++) {
      for (var j = 1; j <= newLen; j++) {
        var deletionDis = deletion(i, j)
        var insertionDis = insertion(i, j)
        var substitutionDis = substitution(i, j)
        roadmap[i][j] = Math.min(deletionDis, insertionDis, substitutionDis)
      }
    }
    createPatches()
  }

  function deletion (oldPos, newPos) {
    return roadmap[oldPos - 1][newPos] + 1
  }

  function insertion (oldPos, newPos) {
    return roadmap[oldPos][newPos - 1] + 1
  }

  function substitution (oldPos, newPos) {
    var oldItem = oldList[oldPos - 1]
    var newItem = newList[newPos - 1]
    return roadmap[oldPos - 1][newPos - 1] + cost(oldItem, newItem)
  }

  function cost (oldItem, newItem) {
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

  function createPatches () {
    var oldPos = roadmap.length - 1
    var newPos = ((roadmap[0] && roadmap[0].length) || 0) - 1

    while (oldPos >= 0 && newPos >= 0) {
      var distance = roadmap[oldPos][newPos]
      var deletion = oldPos - 1 >= 0 ? roadmap[oldPos - 1][newPos] : void 0
      var insertion = newPos - 1 >= 0 ? roadmap[oldPos][newPos - 1] : void 0
      var substitution = (oldPos - 1 >= 0 && newPos - 1 >= 0)
        ? roadmap[oldPos - 1][newPos - 1]
        : void 0
      if (deletion !== void 0 && distance === deletion + 1) {
        patches.push(Patch(oldPos - 1, DELETION))
        oldPos--
        continue
      }
      if (insertion !== void 0 && distance === insertion + 1) {
        patches.push(Patch(oldPos, INSERTION, newList[newPos - 1]))
        newPos--
        continue
      }
      if (substitution !== void 0 && distance === substitution + 1) {
        patches.push(Patch(oldPos - 1, SUBSTITUTION, newList[newPos - 1]))
      }
      oldPos--
      newPos--
    }
  }

  function destory () {
    roadmap = oldList = newList = keyName = void 0
  }

  function diff (oldList, newList, keyName) {
    if (typeof oldList !== 'string' && !isArray(oldList)) {
      oldList = [oldList]
    }
    if (typeof newList !== 'string' && !isArray(newList)) {
      newList = [newList]
    }

    // initialize the data
    init(oldList, newList, keyName)
    // start computing
    compute()
    // destory data
    destory()

    return patches
  }

  diff.DELETION = DELETION
  diff.INSERTION = INSERTION
  diff.SUBSTITUTION = SUBSTITUTION

  return diff
}))
