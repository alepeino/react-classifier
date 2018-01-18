import classNames from 'classnames'
import { isString } from 'lodash/fp'
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

const classifier = (component, classes) => {
  let unfrozen = unfreeze(component)

  Object.entries(classes).forEach(([selector, classes]) =>
    select(unfrozen, selector).forEach(element =>
      element.props.className = classNames(element.props.className, classes)
    )
  )

  return unfrozen
}

export default classifier
