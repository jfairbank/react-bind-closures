# react-bind-closures
Bind closures to stateless React components to avoid creating closures at render time

## Install

    $ npm install --save react-bind-closures

## The Problem

Many React developers are beginning to prefer and advocate for creating
stateless React components with pure functions. While these "dumb" components
are simple and more predictable, they can come with some performance issues. The
biggest problem they face is how to avoid creating closures.

A big React anti-pattern is to create closures at render time because multiple
renders means multiple closures which means more object creation and GC time
([link](https://medium.com/@esamatti/react-js-pure-render-performance-anti-pattern-fb88c101332f#.89cajsdi3)).

### Example:

```js
// TodoItem creates a new closure for the `onClick` handler every time its
// rendered/invoked
const TodoItem = ({ id, title, onComplete }) => (
  <li>
    <div>{title}</div>

    <button onClick={() => onComplete(id)}>
      Complete
    </button>
  </li>
);

const TodoList = ({ items, onComplete }) => (
  <ul>
    {items.map(item => (
      <TodoItem
        key={item.id}
        onComplete={onComplete}
        {...item}
      />
    ))}
  </ul>
);
```

The usual approach to solve this is to create your React component instead as a
class and autobind a helper method that allows you to avoid creating closures
during render time.

```js
// With `React.createClass` which autobinds methods
const TodoItem = React.createClass({
  onComplete() {
    this.props.onComplete(this.props.id);
  },

  render() {
    return (
      <li>
        <div>{title}</div>

        <button onClick={this.onComplete}>
          Complete
        </button>
      </li>
    );
  },
});

// With ES2015 class and ES.later class properties
class TodoItem extends React.Component {
  onComplete = () => this.props.onComplete(this.props.id);

  render() {
    return (
      <li>
        <div>{title}</div>

        <button onClick={this.onComplete}>
          Complete
        </button>
      </li>
    );
  }
}
```

Ideally, we would like to continue to write our components as functions, but
still avoid creating closures during rendering.

## The Solution

react-bind-closures allows you to create closures at mount time instead of
render time for your stateless components. This greatly helps performance by
avoiding the costs already mentioned. react-bind-closures exports a function
called `bindClosures` that underneath the hood wraps your stateless component
with a class component to benefit from autobinding methods. But, you still write
your stateless component just the same and never have to worry about writing
`this` either!

## Usage

Rewriting our previous example with `bindClosures` looks something like this:

```js
import bindClosures from 'react-bind-closures';

// Here `onComplete` will be the new bound closure created at mount time. It
// knows to pass in the `id` to the original `onComplete` handler.
let TodoItem = ({ title, onComplete }) => (
  <li>
    <div>{title}</div>
    <button onClick={onComplete}>Complete</button>
  </li>
);

// Inject a new `onComplete` that receives the original props.
TodoItem = bindClosures({
  onComplete(props) {
    props.onComplete(props.id);
  }
})(TodoItem);

const TodoList = ({ items, onComplete }) => (
  <ul>
    {items.map(item => (
      <TodoItem
        key={item.id}
        onComplete={onComplete}
        {...item}
      />
    ))}
  </ul>
);
```

As you can see, `bindClosures` allows you to create one time closures that will
be injected into your component. In this example, we redefine the `onComplete`
closure that gets passed into the component. The new closure will receive the
original props that were passed into the component. This includes the original
`onComplete` handler. From here we can call it with the `id` just like the
previous examples but without creating closures every render.

`bindClosures` is a curried function, so it's similar to other decorator
functions like `connect` from
[react-redux](https://github.com/reactjs/react-redux). First, call it with your
bound closure definitions. You'll receive back a function that you can then call
on a stateless component function to receive back a decorated component that
will bind the defined closures.

## Reminder

Please remember that this library is meant to be used with **STATELESS**
components. This package will attempt to call the decorated component as a
function. Additionally, you don't really need this library for class components
because you can handle autobinding methods already with them.
