import classNames from 'classnames'
import {
  dropRightWhile,
  isArray,
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

const apply = (component, classes) =>
  Object.entries(classes).forEach(([selector, classes]) => {
    let nested

    if (isArray(classes)) {
      nested = last(classes)
      classes = dropRightWhile(isObject)(classes)
    }

    select(component, selector).forEach(element => {
      element.props.className = classNames(element.props.className, classes)

      if (nested) {
        apply(element, nested)
      }
    })
  })

const classifier = (component, classes) => {
  let unfrozen = unfreeze(component)

  apply(unfrozen, classes)

  return unfrozen
}

export default classifier
