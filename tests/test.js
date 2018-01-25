import React from 'react'
import renderer from 'react-test-renderer'
import C, { firstChild, lastChild, nthChild } from '../src'

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

      expect(tree.children).toHaveLength(2)
      expect(tree.children.every(e => e.props.className === 'x')).toBe(true)
    })

    test('root node by root pseudo selector', () => {
      const Comp = C(<div><p /></div>, {
        ':root': 'root'
      })
      const tree = renderer.create(Comp).toJSON()

      expect(tree.props.className).toEqual('root')
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
          <div />
          <div />
        </div>, {
          'div': [{
            'div': (_, nth, selected) => {
              expect(selected).toHaveLength(2)
              return { ok: nth === 1 }
            }
          }]
        }
      )

      const tree = renderer.create(Comp).toJSON()

      expect(tree.children[0].props.className).toBeUndefined()
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

  test('can select component children', () => {
    const Parent = ({ className, children }) => <div className={className}>{children}</div>
    const Comp = C(
      <div>
        <Parent>
          <div />
          <div />
        </Parent>
      </div>, {
        'Parent': ['parent', {
          'div': 'child'
        }]
      }
    )

    const tree = renderer.create(Comp).toJSON()

    expect(tree.props.className).toBeUndefined()
    expect(tree.children[0].props.className).toEqual('parent')
    expect(tree.children[0].children.every(c => c.props.className === 'child')).toBe(true)
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
          <span>#photography</span>
          <span>#travel</span>
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
              'font-semibold text-grey-darker',
              firstChild('mr-2'),
              nthChild(2, 'mr-2')
            ]
          }]
        }]
      }
    )

    expect(renderer.create(Comp).toJSON()).toMatchSnapshot()
  })
})

describe('nth-child helpers', () => {
  const jsx = (
    <div>
      <p />
      <p />
      <p />
    </div>
  )

  test('nthChild', () => {
    const Comp = C(jsx, {
      'div': [{
        'p': nthChild(2, 'second', 'child')
      }]
    })

    const tree = renderer.create(Comp).toJSON()

    expect(tree.children[0].props.className).toBeUndefined()
    expect(tree.children[1].props.className).toEqual('second child')
    expect(tree.children[2].props.className).toBeUndefined()
  })

  test('firstChild', () => {
    const Comp = C(jsx, {
      'div': [{
        'p': firstChild(['first', 'child'])
      }]
    })

    const tree = renderer.create(Comp).toJSON()

    expect(tree.children[0].props.className).toEqual('first child')
    expect(tree.children[1].props.className).toBeUndefined()
    expect(tree.children[2].props.className).toBeUndefined()
  })

  test('lastChild', () => {
    const Comp = C(jsx, {
      'div': [{
        'p': lastChild({ last: true }, 'child')
      }]
    })

    const tree = renderer.create(Comp).toJSON()

    expect(tree.children[0].props.className).toBeUndefined()
    expect(tree.children[1].props.className).toBeUndefined()
    expect(tree.children[2].props.className).toEqual('last child')
  })
})
