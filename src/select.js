import React from 'react'
import { isFunction } from 'lodash/fp'

function matches (component, selector) {
  switch (selector[0]) {
    case '*':
      return selector === '*'
    case ':':
      return selector === ':root'
    case '.':
      return (component.props.className || '').split(' ').includes(selector.substring(1))
    case '#':
      return component.props.id === selector.substring(1)
    default:
      return isFunction(component.type)
        ? component.type.name === selector
        : component.type === selector
  }
}

export default function select (component, selector, excludeRoot = false) {
  const found = []

  if (!excludeRoot && matches(component, selector)) {
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
