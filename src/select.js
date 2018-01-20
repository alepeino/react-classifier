import React from 'react'

function matches (component, selector, index) {
  if (selector === ':root') {
    return true
  }

  switch (selector[0]) {
    case '.':
      return (component.props.className || '').split(' ').includes(selector.substring(1))
    case '#':
      return component.props.id === selector.substring(1)
    default:
      const matches = selector.match(/(.+):nth-child\((\d+)\)/)

      return matches
        ? component.type === matches[1] && index === parseInt(matches[2]) - 1
        : component.type === selector
  }
}

export default function select (component, selector, index) {
  const found = []

  if (matches(component, selector, index)) {
    found.push(component)
  } else {
    React.Children.forEach(component.props.children, (element, index) =>
      select(element, selector, index).forEach(children =>
        React.Children.forEach(children, child => found.push(child))
      )
    )
  }
  return found
}
