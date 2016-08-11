/* global it, describe */
var diff = require('../index.js')
var chai = require('chai')
chai.should()

describe('List diff', function () {
  function perform (list, patches) {
    patches.forEach(function (patch) {
      if (patch.type === diff.DELETION) {
        list.splice(patch.index, 1)
      } else if (patch.type === diff.INSERTION) {
        list.splice(patch.index, 0, patch.item)
      } else {
        list.splice(patch.index, 1, patch.item)
      }
    })
    return list
  }

  function assertListEqual (after, before) {
    after.forEach(function (item, i) {
      after[i].should.be.deep.equal(before[i])
    })
  }

  function random (len) {
    return Math.floor(Math.random() * len)
  }

  it('Removing items', function () {
    var before = [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}]
    var after = [{id: 2}, {id: 3}, {id: 1}]
    var patches = diff(before, after, 'id')

    patches.length.should.be.equal(4)
    perform(before, patches)
    assertListEqual(after, before)
  })

  it('Removing items in the middle', function () {
    var before = [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}]
    var after = [{id: 1}, {id: 2}, {id: 4}, {id: 6}]
    var patches = diff(before, after, 'id')

    patches.length.should.be.equal(2)
    perform(before, patches)
    assertListEqual(after, before)
  })

  it('Inserting items', function () {
    var before = ['a', 'b', 'c', 'd']
    var after = ['a', 'b', 'e', 'f', 'c', 'd']
    var patches = diff(before, after)

    patches.length.should.be.equal(2)
    perform(before, patches)
    assertListEqual(after, before)
  })

  it('Moving items from back to front', function () {
    var before = ['a', 'b', 'c', 'd', 'e', 'f']
    var after = ['a', 'b', 'e', 'f', 'c', 'd', 'g', 'h']
    var patches = diff(before, after)

    patches.length.should.be.equal(4)
    perform(before, patches)
    assertListEqual(after, before)
  })

  it('Moving items from front to back', function () {
    var before = ['a', 'b', 'c', 'd', 'e', 'f']
    var after = ['a', 'c', 'e', 'f', 'b', 'd']
    var patches = diff(before, after)

    patches.length.should.be.equal(4)
    perform(before, patches)
    assertListEqual(after, before)
  })

  it('Miscellaneous actions', function () {
    var before = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
    var after = ['h', 'i', 'a', 'c', 'd', 'u', 'e', 'f', 'g', 'j', 'b', 'z', 'x', 'y']
    var patches = diff(before, after)

    perform(before, patches)
    assertListEqual(after, before)
  })

  it('Randomly moving', function () {
    var alphabet = 'klmnopqrstuvwxyz'
    for (var i = 0; i < 20; i++) {
      var before = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
      var after = before.slice(0)
      var pos, character

      // move
      var j = 0
      var len = +(Math.random() * 4)
      for (j = 0; j < len; j++) {
        // random removing item
        pos = random(after.length)
        character = after[pos]
        after.splice(pos, 1)

        // random insert item
        pos = random(after.length)
        after.splice(pos, 0, character)
      }

      // remove
      j = 0
      len = +(Math.random() * 4)
      for (j = 0; j < len; j++) {
        pos = random(after.length)
        after.splice(pos, 1)
      }

      // insert
      j = 0
      len = +(Math.random() * 10)
      for (j = 0; j < len; j++) {
        pos = random(after.length)
        var newItemPos = random(alphabet.length)
        character = alphabet[newItemPos]
        after.splice(pos, 0, character)
      }

      var patches = diff(before, after)
      perform(before, patches)
      assertListEqual(after, before)
    }
  })

  it('Test with no key: string item and removing', function () {
    var before = ['a', 'b', 'c', 'd', 'e']
    var after = ['c', 'd', 'e', 'a']
    var patches = diff(before, after)

    patches.length.should.be.equal(3)
    perform(before, patches)
    assertListEqual(after, before)
  })

  it('Test with no key: string item and inserting', function () {
    var before = ['a', 'b', 'c', 'd', 'e']
    var after = ['c', 'd', 'e', 'a', 'g', 'h', 'j']
    var patches = diff(before, after)

    patches.length.should.be.equal(6)
    perform(before, patches)
    assertListEqual(after, before)
  })

  it('Test with no key: object item', function () {
    var before = [{id: 'a'}, {id: 'b'}, {id: 'c'}, {id: 'd'}, {id: 'e'}]
    var after = [{id: 'a'}, {id: 'b'}, {id: 'c'}, {id: 'd'}, {id: 'e'}, {id: 'f'}]
    var patches = diff(before, after)

    patches.length.should.be.equal(6)
    perform(before, patches)
    assertListEqual(after, before)
  })

  it('Mix keyed items with unkeyed items', function () {
    var before = [{id: 'a'}, {id: 'b'}, {key: 'c'}, {key: 'd'}, {id: 'e'}, {id: 'f'}, {id: 'g'}, {id: 'h'}]
    var after = [{id: 'b', flag: 'yes'}, {key: 'c'}, {id: 'e'}, {id: 'f'}, {id: 'g'}, {key: 'd'}]
    var patches = diff(before, after, 'id')

    perform(before, patches)
    before[0] = {id: 'b', flag: 'yes'} // because perform only operates on origin list
    assertListEqual(after, before)
  })

  it('Test example', function () {
    var diff = require('../index')
    var oldList = [{id: 'a'}, {id: 'b'}, {id: 'c'}, {id: 'd'}, {id: 'e'}]
    var newList = [{id: 'c'}, {id: 'a'}, {id: 'b'}, {id: 'e'}, {id: 'f'}]

    var patches = diff(oldList, newList, 'id')
    patches.forEach(function (patch) {
      if (patch.type === 0) {
        oldList.splice(patch.index, 1)
      } else if (patch.type === 1) {
        oldList.splice(patch.index, 0, patch.item)
      } else {
        oldList.splice(patch.index, 1, patch.item)
      }
    })
    assertListEqual(newList, oldList)
  })
})
