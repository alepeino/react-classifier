import React from 'react'

function matches (component, selector) {
  if (selector === ':root') {
    return true
  }

  switch (selector[0]) {
    case '.':
      return (component.props.className || '').split(' ').includes(selector.substring(1))
    case '#':
      return component.props.id === selector.substring(1)
    default:
      return component.type === selector
  }
}

export default function select (component, selector) {
  const found = []

  if (matches(component, selector)) {
    found.push(component)
  } else if (component.props) {
    React.Children.forEach(component.props.children, element =>
      select(element, selector).forEach(children =>
        React.Children.forEach(children, child => found.push(child))
      )
    )
  }
  return found
}
