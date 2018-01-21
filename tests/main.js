import React from 'react'
import renderer from 'react-test-renderer'
import C from '../src'

describe('plain structure', () => {
  describe('string classes', () => {
    test('root node by tag name', () => {
      const Comp = C(<div><p /></div>, {
        'div': 'x'
      })
      const tree = renderer.create(Comp).toJSON()

      expect(tree.props.className).toEqual('x')
    })

    test('nested node by tag name', () => {
      const Comp = C(<div><p /></div>, {
        'p': 'x'
      })
      const tree = renderer.create(Comp).toJSON()

      expect(tree.children[0].props.className).toEqual('x')
    })

    test('sibling nodes by tag name', () => {
      const Comp = C(<div><p /><p /></div>, {
        'p': 'x'
      })
      const tree = renderer.create(Comp).toJSON()

      expect(tree.children.length).toBe(2)
      expect(tree.children.every(e => e.props.className === 'x')).toBe(true)
    })

    test('root node by root pseudo selector', () => {
      const Comp = C(<div><p /></div>, {
        ':root': 'root',
        'p': 'nested'
      })
      const tree = renderer.create(Comp).toJSON()

      expect(tree.props.className).toEqual('root')
      expect(tree.children[0].props.className).toEqual('nested')
    })

    test('adds to existing class', () => {
      const Comp = C(<div>
        <p className='paragraph'>Text Node</p>
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
      const Comp = C(<div><p /></div>, {
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
      const Comp = C(<div><p /></div>, {
        'p': ['one', 'two']
      })
      const tree = renderer.create(Comp).toJSON()

      expect(tree.children[0].props.className.split(' ')).toContain('one')
      expect(tree.children[0].props.className.split(' ')).toContain('two')
    })

    test('function', () => {
      const Comp = C(
        <div>
          <p id='p1' />
          <p id='p2' />
        </div>, {
          'p': el => ({
            ok: el.props.id === 'p2'
          })
        }
      )

      const tree = renderer.create(Comp).toJSON()

      expect(tree.children[0].props.className).toEqual('')
      expect(tree.children[1].props.className).toEqual('ok')
    })

    test('mixed', () => {
      const Comp = C(<div><p /></div>, {
        'p': [
          ['one'],
          el => el.type === 'p' && 'two',
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

  test('deeply nested', () => {
    const Comp = C(
      <div>
        <img src='https://tailwindcss.com/img/card-top.jpg' alt='Sunset in the mountains' />
        <div>
          <div>The Coldest Sunset</div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
          </p>
        </div>
        <div>
          <span className='mr-2'>#photography</span>
          <span className='mr-2'>#travel</span>
          <span>#winter</span>
        </div>
      </div>, {
        ':root': ['max-w-sm rounded overflow-hidden shadow-lg', {
          'img': 'w-full',
          'div': ['px-6 py-4', {
            'div': ['font-bold', 'text-xl', 'mb-2'],
            'p': ['text-grey-darker', 'text-base'],
            'span': [
              'inline-block bg-grey-lighter rounded-full',
              'px-3 py-1 text-sm',
              'font-semibold text-grey-darker'
            ]
          }]
        }]
      }
    )

    expect(renderer.create(Comp).toJSON()).toMatchSnapshot()
  })
})
