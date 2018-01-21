import classNames from 'classnames'
import {
  castArray,
  dropRight,
  isArray,
  isFunction,
  isObject,
  isString,
  last
} from 'lodash/fp'
import React from 'react'
import select from './select'

const unfreeze = component =>
  isString(component) || !Object.isFrozen(component)
  ? component
  : {
    ...component,
    props: {
      ...component.props,
      children: React.Children
        .toArray(component.props.children)
        .reduce((children, node) => children.concat(unfreeze(node)), [])
    }
  }

const classNamesForElement = (element, classes) =>
  classNames(
    element.props.className,
    castArray(classes).map(c => isFunction(c) ? c(element) : c)
  )

const apply = (component, classes) =>
  Object.entries(classes).forEach(([selector, classes]) => {
    let nested

    if (isArray(classes) && isObject(last(classes))) {
      nested = last(classes)
      classes = dropRight(1, classes)
    }

    select(component, selector).forEach(element => {
      element.props.className = classNamesForElement(element, classes)

      if (nested) {
        React.Children.forEach(element.props.children, c => apply(c, nested))
      }
    })
  })

const classifier = (component, classes) => {
  let unfrozen = unfreeze(component)

  apply(unfrozen, classes)

  return unfrozen
}

export default classifier
