import classNames from 'classnames'
import {
  castArray,
  dropRight,
  isArray,
  isEmpty,
  isFunction,
  isPlainObject,
  last
} from 'lodash/fp'
import React from 'react'

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

function apply (element, classes = {}, nthChild = 0, siblings = []) {
  if (isEmpty(classes)) {
    return element
  }

  let { children, className } = element.props
  let nested = {}

  const topLevel = Object.entries(classes)
    .filter(([selector]) => matches(element, selector))
    .map(([, cls]) => {
      if (isArray(cls) && isPlainObject(last(cls))) {
        nested = { ...nested, ...last(cls) }
        cls = dropRight(1, cls)
      }

      return castArray(cls).map(c => isFunction(c)
        ? c(element, nthChild, siblings)
        : c
      )
    })

  if (isEmpty(topLevel)) {
    nested = classes
  } else {
    className = classNames(className, ...topLevel)
  }

  return React.cloneElement(
    element,
    className ? { className } : {},
    React.Children.map(children, (c, n) => apply(c, nested, n, children))
  )
}

export default function classifier (component, classes = {}) {
  return apply(component, classes, 0, [component])
}
