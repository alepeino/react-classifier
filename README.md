# react-classifier

A library for adding classes to a tree of React elements using CSS-like selectors, so you can turn this

```jsx
const Card = ({ title, imgSrc, texts }) => (
  <div className="card mb-3">
    <img className="card-img-top" src={imgSrc} alt="Card image" />
    <div className="card-body">
      <h5 className="card-title">{title}</h5>

      {texts.map((text, i, all) =>
        <p key={i} className={`card-text ${i === all.length - 1 ? 'small text-muted' : ''}`}>
          {text}
        </p>
      )}
    </div>
  </div>
)
```

into this

```jsx
import C, { lastChild } from 'react-classifier'

const Card = ({ title, imgSrc, texts }) => C(
  <div>
    <img src={imgSrc} alt="Card image" />
    <div>
      <h5>{title}</h5>

      {texts.map((text, i) =>
        <p key={i}>
          {text}
        </p>
      )}
    </div>
  </div>, {
    ':root': ['card mb-3', {
      'img': 'card-img-top',
      'div': ['card-body', {
        'h5': 'card-title',
        'p': ['card-text', lastChild('small', 'text-muted')]
      }]
    }]
  }
)
```

###### (Example card component from http://getbootstrap.com/docs/4.0/components/card/#image-caps)


That's it! It simply allows you to "separate concerns" (visually, at least), uncluttering your component markup by keeping the classes in a separate structure, while also providing a few convenient [helpers](#helper-functions).

## Motivation
There exist solutions like [CSS Modules](https://github.com/css-modules/css-modules), [styled-components](https://www.styled-components.com/), [glamor](https://github.com/threepointone/glamor), or [styled-jsx](https://github.com/zeit/styled-jsx), with alternatives for styling a React component (some of these libraries are not React-specific, though) while keeping the CSS rules scoped.

This library instead attempts to be of use for working with class-heavy, utility-based frameworks like [Bootstrap](http://getbootstrap.com) or [Tailwind CSS](https://tailwindcss.com). With it, the `className` property can be set not inline, but by means of a separate tree-like structure, which may partially mirror the "markup", that is, the tree of React elements. This can allow, as needed, reusing / merging / composing this classes map, which can also be imported from a separate file, etc.

## Installation
As usual,

```bash
yarn add react-classifier
```

or

```bash
npm install --save react-classifier
```

## Usage

The main function should receive a tree of React elements as first argument, and an object as second argument (the default is an empty object).

This object has a [subset of CSS selectors](#selectors) as keys, and a string, array, object or function, as values (details [below](#class-arguments)).

### Selectors
A subset of CSS selectors are supported (can not be combined such as `div.red`)

- ##### Type ("tag") selector
Either a tag name such as `'div'`, or a React component type such as `'MyComponent'` (this would make sense if the element itself accepts a `className` prop, or for a [nested structure](#nesting))

- ##### Id selector
`'#navbar'` will match an element with an `id` prop with value 'navbar'.

- ##### Class selector
`'.red'` will match elements already containing a `className` prop with value 'red'.

- ##### `:root` selector
`':root'` will match the top-level element.

- ##### `*` selector
`'*'` will match any element.

### Class arguments
The object value is the class(es) to apply to the element(s) selected with the associated key.

This value can be:
- a string with the class to apply
- an object where each value is an expression that, if it evaluates as *truthy*, will apply the associated key as class name
- a function, which will be called with 3 arguments: the selected element, the (0-based) index of the element within its siblings, and the array of said siblings. The return value will be processed as per the rules above.
- an array, which will be flattened and each of its element will be processed as per the rules above

In any case, any *falsy* values (empty string, `undefined`, etc.) will be automatically filtered out.

### Examples
###### These examples with the default export aliased as `C` (`import C from 'react-classifier'`)

- ##### Type selector, string class
```jsx
const Component = () => C(
  <div />, {
    'div': 'red'
  }
)
```

renders as
```jsx
<div className="red" />
```

- ##### Class selector, object classes
```jsx
const Component = () => C(
  <div className="a" />, {
    '.a': { b: true, c: 'truthy', d: 0 === 1 }
  }
)
```

renders as
```jsx
<div className="a b c" />
```
###### Note that the resulting classes will be merged with the existing component `className`, if any.

- ##### Id selector, array classes
```jsx
const Component = () => C(
  <div id="navbar" />, {
    '#navbar': ['flex', 'bg-red', 'text-dark']
  }
)
```

renders as
```jsx
<div id="navbar" className="flex bg-red text-dark" />
```

- ##### Mixed array
```jsx
const Button = (props) => C(
  <button />, {
    ':root': [
      'btn',
      {
        'btn-danger': props.danger,
        'btn-warning': props.warning
      },
      ['text-center', 'text-uppercase'],
      (el, i) => ({ 'text-lg': i === 0 })
    ]
  }
)
```

A first-child `<Button warning />` renders as
```jsx
<button className="btn btn-warning text-center text-uppercase text-lg" />
```

- Unlike a CSS selector, only top-level elements will be matched:

```jsx
C(
  <div>
    <div />
    <div />
  </div>, {
    'div': 'flex'
  }
)
```

renders
```jsx
<div className="flex">
  <div />
  <div />
</div>
```

However, If a selector matches no top-level element, the matching algorithm will traverse down the elements tree until a match is found:

```jsx
C(
  <div>
    <p />
    <p />
  </div>, {
    'p': 'paragraph'
  }
)
```

renders
```jsx
<div>
  <p className="paragraph" />
  <p className="paragraph" />
</div>
```

### Nesting
There is a single exception to the rules above: if an entry value is an array *and* its last value is an object, this object will be used to select and apply classes on descendants of the current element:

```jsx
C(
  <div>
    <p />
    <p />
  </div>, {
    'div': ['flex', {
      'p': 'paragraph'
    }]
  }
)
```

renders
```jsx
<div className="flex">
  <p className="paragraph" />
  <p className="paragraph" />
</div>
```

See the top of this README for a [more complex example](#react-classifier).

### Helper functions
The library provides `nthChild`, `firstChild` and `lastChild` as named exports. They all generate the corresponding classes if the element is nth, first, or last within its siblings.
```javascript
function nthChild(n, ...classes) { /*...*/}
function firstChild(...classes) { /*...*/}
function lastChild(...classes) { /*...*/}
```

```jsx
C(
  <div>
    <p />
    <p />
    <p />
  </div>, {
  'div': [{
    'p': nthChild(2, 'second', {'child': true})
  }]
})
```

renders
```jsx
<div>
  <p />
  <p className="second child" />
  <p />
</div>
```

### Component decoration
The `decorate` named export takes a component and another argument which will be passed to the [`:root`](#root-selector) of the wrapped component, returning a higher-order component.

```jsx
const Button = (props) => (
  <button className='btn'>
    {props.children}
  </button>
)
const RedButton = decorate(Button, 'bg-red')
<RedButton>A red button</RedButton>)
```

renders
```jsx
<button className="btn bg-red">A red button</button>
```

[Any structure](#class-arguments) can be passed to the `decorate` helper function, which allows adding classes to child elements:

```jsx
const List = ({ items }) => (
  <ul>
    {items.map((item, i) =>
      <li key={i}>{item}</li>
    )}
  </ul>
)
const StripedList = decorate(List, [{
  li: [
    'text-dark',
    (_, i) => i % 2 && 'bg-light-grey'
  ]
}])
<StripedList items={['a', 'b', 'c', 'd']} />
```

renders
```jsx
<ul>
  <li className="text-dark">a</li>
  <li className="text-dark bg-light-grey">b</li>
  <li className="text-dark">c</li>
  <li className="text-dark bg-light-grey">d</li>
</ul>
```

## A word of caution
This should not (yet) be considered ready for production use. There may still exist bugs or performance issues. **PRs and comments are welcome**.

## License
[MIT](LICENSE) © Alejandro Peinó
