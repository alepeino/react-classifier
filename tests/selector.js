import React from 'react'
import select from '../src/select'

describe('simple selector', () => {
  test('no matches', () => {
    const matches = select(<div><p /></div>, 'xx')

    expect(matches).toHaveLength(0)
  })

  test('select root by tag name', () => {
    const matches = select(<div><p /></div>, 'div')

    expect(matches).toHaveLength(1)
    expect(matches[0].type).toBe('div')
  })

  test('select child element by tag name', () => {
    const matches = select(<div><p /></div>, 'p')

    expect(matches).toHaveLength(1)
    expect(matches[0].type).toBe('p')
  })

  test('select by class', () => {
    const matches = select(<div><p className='paragraph' /></div>, '.paragraph')

    expect(matches).toHaveLength(1)
    expect(matches[0].type).toBe('p')
  })

  test('select by id', () => {
    const matches = select(<div id='root'><p className='paragraph' /></div>, '#root')

    expect(matches).toHaveLength(1)
    expect(matches[0].type).toBe('div')
  })

  test(':root selector', () => {
    const matches = select(<div><p /></div>, ':root')

    expect(matches).toHaveLength(1)
    expect(matches[0].type).toBe('div')
  })

  test('* selector', () => {
    const matches = select(<div><p /></div>, '*')

    expect(matches).toHaveLength(1)
    expect(matches[0].type).toBe('div')
  })
})

describe('other', () => {
  test('matches sibling nodes', () => {
    const matches = select(
      <div>
        <p />
        <p />
      </div>,
      'p')

    expect(matches).toHaveLength(2)
    expect(matches.every(e => e.type === 'p')).toBe(true)
  })

  test('supports child text nodes', () => {
    const matches = select(
      <div>
        Text Node 1
        <p />
        Text Node 2
        <p />
      </div>,
      'p')

    expect(matches).toHaveLength(2)
    expect(matches.every(e => e.type === 'p')).toBe(true)
  })

  test('supports nested components', () => {
    const Child = ({ children }) => <div>{children}</div>
    const matches = select(
      <div>
        <Child>
          <p>Nested component 1</p>
        </Child>
        <Child>
          <p>Nested component 2</p>
        </Child>
      </div>,
      'p'
    )

    expect(matches).toHaveLength(2)
    expect(matches.every(e => e.type === 'p')).toBe(true)
  })

  test("doesn't search deeper after 1st match", () => {
    const template = (
      <div id='root'>
        <p className='p'>
          <div />
        </p>
        <p className='p'>
          <div>
            <p />
          </div>
        </p>
      </div>
    )

    {
      let matches = select(template, 'div')
      expect(matches).toHaveLength(1)
      expect(matches[0].props.id).toEqual('root')
    }
    {
      let matches = select(template, 'p')
      expect(matches).toHaveLength(2)
      expect(matches.every(e => e.props.className === 'p')).toBe(true)
    }
  })

  test('can exclude root element', () => {
    const matches = select(
      <div id='root'>
        <div />
        <div />
      </div>,
      'div',
      true
    )

    expect(matches).toHaveLength(2)
    expect(matches.some(e => e.props.id === 'root')).toBe(false)
  })
})
