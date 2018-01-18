import React from 'react'
import renderer from 'react-test-renderer'
import C from '../src'

describe('plain structure', () => {
  describe('string classes', () => {
    test('root node by tag name', () => {
      const Comp = C(<div><p></p></div>, {
        'div': 'x'
      })
      const tree = renderer.create(Comp).toJSON()

      expect(tree.props.className).toEqual('x')
    })

    test('nested node by tag name', () => {
      const Comp = C(<div><p></p></div>, {
        'p': 'x'
      })
      const tree = renderer.create(Comp).toJSON()

      expect(tree.children[0].props.className).toEqual('x')
    })

    test('root node by root pseudo selector', () => {
      const Comp = C(<div><p></p></div>, {
        ':root': 'root',
        'p': 'nested'
      })
      const tree = renderer.create(Comp).toJSON()

      expect(tree.props.className).toEqual('root')
      expect(tree.children[0].props.className).toEqual('nested')
    })
  })
})
