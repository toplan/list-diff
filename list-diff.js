/*
 * Diff two list in O(n*m)
 *
 * @param {Array} oldList - Original List
 * @param {Array} newList - List After certain insertions, removes, or moves
 * @return {Object} - {distance: Int}
 *                  - {map: <Array>}
 *                  - {actions: <Array>}
 *                  - actions is a list of actions that telling how to remove and insert
 */
;(function (factory) {
  'use strict'

  if (typeof module === 'object' && typeof exports === 'object') {
    module.exports = factory()
    return
  }
  if (typeof window !== 'undefined') {
    window.diffList = factory()
  }
}(function () {
  'use strict'

  //action types
  var DELETION = 0
  var INSERTION = 1
  var SUBSTITUTION = 2

  //list and key name
  var oldList, newList, keyName

  //distance map
  var map = []
  //distance value
  var distance = 0
  //actions for old list
  var actions = []

  var isArray = Array.isArray || function (target) {
    return target && Object.prototype.toString.call(target) === "[object Array]"
  }

  function Action(index, type, item) {
    if (!(this instanceof Action)) {
      return new Action(index, type, item)
    }
    this.index = index
    this.type = type
    this.item = item
  }

  function init(obj) {
    map = []
    actions = []

    oldList = obj.oldList || []
    newList = obj.newList || []
    keyName = obj.keyName

    initMap()
  }

  function initMap() {
    var oldLen = oldList.length
    var newLen = newList.length
    for (var i = 0; i <= oldLen; i++) {
      map[i] = [i]
    }
    for (var i = 0; i <= newLen; i++) {
      map[0][i] = i
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
        map[i][j] = distance = Math.min(deletionDis, insertionDis, substitutionDis)
      }
    }
    createActions()
  }

  function deletion(oldPos, newPos) {
    return map[oldPos - 1][newPos] + 1
  }

  function insertion(oldPos, newPos) {
    return map[oldPos][newPos - 1] + 1
  }

  function substitution(oldPos, newPos) {
    var oldItem = oldList[oldPos - 1]
    var newItem = newList[newPos - 1]
    return map[oldPos - 1][newPos - 1] + cost(oldItem, newItem)
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

  function createActions() {
    var oldPos = map.length - 1
    var newPos = ((map[0] && map[0].length) || 0) - 1

    while (oldPos > 0 && newPos > 0) {
      var distance = map[oldPos][newPos]
      var deletion = map[oldPos - 1][newPos]
      var insertion = map[oldPos][newPos - 1]
      var substitution = map[oldPos - 1][newPos - 1]
      if (distance == deletion + 1) {
        actions.unshift(Action(oldPos - 1, DELETION))
        oldPos--
        continue
      } else if (distance == insertion + 1) {
        actions.unshift(Action(oldPos - 1, INSERTION, newList[newPos - 1]))
        newPos--
        continue
      } else if (distance === substitution + 1) {
        actions.unshift(Action(oldPos - 1, SUBSTITUTION, newList[newPos - 1]))
      }
      oldPos--
      newPos--
    }
  }

  function diff(oldList, newList, keyName) {
    if (typeof oldList !== 'string' && !isArray(oldList)) {
      oldList = [oldList]
    }
    if (typeof newList !== 'string' && !isArray(newList)) {
      newList = [newList]
    }

    init({
      'oldList': oldList,
      'newList': newList,
      'keyName': keyName
    })

    compute()

    return {
      distance: distance,
      map: map,
      actions: actions
    }
  }

  diff.DELETION = DELETION
  diff.INSERTION = INSERTION
  diff.SUBSTITUTION = SUBSTITUTION

  return diff
}))
