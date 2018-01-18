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

    test('sibling nodes by tag name', () => {
      const Comp = C(<div><p></p><p></p></div>, {
        'p': 'x'
      })
      const tree = renderer.create(Comp).toJSON()

      expect(tree.children.length).toBe(2)
      expect(tree.children.every(e => e.props.className === 'x')).toBe(true)
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

    test('adds to existing class', () => {
      const Comp = C(<div>
        <p className="paragraph">Text Node</p>
      </div>, {
        '.paragraph': 'x'
      })
      const tree = renderer.create(Comp).toJSON()

      expect(tree.children[0].props.className.split(' ')).toContain('paragraph')
      expect(tree.children[0].props.className.split(' ')).toContain('x')
    })
  })

  describe('complex classNames arguments', () => {
    test('object', () => {
      const Comp = C(<div><p></p></div>, {
        'p': {
          'should': true,
          'should-not': false
        }
      })
      const tree = renderer.create(Comp).toJSON()

      expect(tree.children[0].props.className.split(' ')).toContain('should')
      expect(tree.children[0].props.className.split(' ')).not.toContain('should-not')
    })

    test('array', () => {
      const Comp = C(<div><p></p></div>, {
        'p': ['one', 'two']
      })
      const tree = renderer.create(Comp).toJSON()

      expect(tree.children[0].props.className.split(' ')).toContain('one')
      expect(tree.children[0].props.className.split(' ')).toContain('two')
    })

    test('mixed', () => {
      const Comp = C(<div><p></p></div>, {
        'p': [
          ['one'],
          'two',
          {
            three: true,
            four: false
          },
          'ok'
        ]
      })
      const tree = renderer.create(Comp).toJSON()

      expect(tree.children[0].props.className.split(' ')).toContain('one')
      expect(tree.children[0].props.className.split(' ')).toContain('two')
      expect(tree.children[0].props.className.split(' ')).toContain('three')
      expect(tree.children[0].props.className.split(' ')).not.toContain('four')
      expect(tree.children[0].props.className.split(' ')).toContain('ok')
    })
  })
})

describe('complex structure', () => {
  test('root and child', () => {
    const Comp = C(<div><p /></div>, {
      'div': ['parent', { container: true }, {
        'p': 'child'
      }]
    })

    const tree = renderer.create(Comp).toJSON()

    expect(tree.props.className.split(' ')).toContain('parent')
    expect(tree.props.className.split(' ')).toContain('container')
    expect(tree.children[0].props.className).toEqual('child')
  })
})
