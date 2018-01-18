import bill from 'bill'
import { isString } from 'lodash/fp'
import React from 'react'

bill.registerPseudo('root', () => node => !node.parentNode)

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
    bill.querySelectorAll(selector, unfrozen).forEach(node =>
      node.element.props.className = classes
    )
  )

  return unfrozen
}

export default classifier
