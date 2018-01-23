import classNames from 'classnames'
import {
  castArray,
  dropRight,
  isArray,
  isFunction,
  isPlainObject,
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

const apply = (component, classes, excludeRoot = false) =>
  Object.entries(classes).forEach(([selector, classes]) => {
    let nested

    if (isArray(classes) && isPlainObject(last(classes))) {
      nested = last(classes)
      classes = dropRight(1, classes)
    }

    select(component, selector, excludeRoot).forEach((element, n, selected) => {
      element.props.className = classNames(
        element.props.className,
        castArray(classes).map(cls => isFunction(cls)
          ? cls(element, n, selected)
          : cls
        )
      )

      if (nested) {
        apply(element, nested, true)
      }
    })
  })

const classifier = (component, classes = {}) => {
  let unfrozen = unfreeze(component)

  apply(unfrozen, classes)

  return unfrozen
}

export default classifier
