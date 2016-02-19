/* eslint no-console: 0 */
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { bindActionCreators, createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import Perf from 'react-addons-perf';
import bindClosures from '../../src';

const counterReducer = (counter = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return counter + action.by;
    case 'DECREMENT':
      return counter - action.by;
    case 'RESET':
      return 0;
    default:
      return counter;
  }
};

const increment = (by = 1) => ({ by, type: 'INCREMENT' });
const decrement = (by = 1) => ({ by, type: 'DECREMENT' });
const reset = () => ({ type: 'RESET' });

const store = createStore((state = {}, action) => ({
  counter: counterReducer(state.counter, action),
}));

const Counter = ({
  counter, onIncrement, onDecrement, onReset,
}) => (
  <div>
    <h1>
      Counter:
      {' '}
      {counter}
    </h1>

    <p>
      <button onClick={onIncrement}>
        Increment
      </button>
      {' '}
      <button onClick={onDecrement}>
        Decrement
      </button>
      {' '}
      <button onClick={onReset}>
        Reset
      </button>
    </p>
  </div>
);

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => bindActionCreators({
  onIncrement: increment,
  onDecrement: decrement,
  onReset: reset,
}, dispatch);

const CounterWrapper1 = ({ counter, onIncrement, onDecrement, onReset }) => (
  <Counter
    counter={counter}
    onIncrement={function onIncrementNew() { onIncrement(1); }}
    onDecrement={function onDecrementNew() { onDecrement(1); }}
    onReset={function onResetNew() { onReset(); }}
  />
);

const CounterWrapper2 = ({ counter, onIncrement, onDecrement, onReset }) => (
  <Counter
    counter={counter}
    onIncrement={onIncrement}
    onDecrement={onDecrement}
    onReset={onReset}
  />
);

const CounterWrapper3 = bindClosures({
  onIncrement: function onIncrementBound({ onIncrement }) {
    onIncrement(1);
  },

  onDecrement: function onDecrementBound({ onDecrement }) {
    onDecrement(1);
  },

  onReset: function onResetBound({ onReset }) {
    onReset();
  },
})(CounterWrapper2);

let App1 = ({ counter, onIncrement, onDecrement, onReset }) => (
  <CounterWrapper1
    counter={counter}
    onIncrement={onIncrement}
    onDecrement={onDecrement}
    onReset={onReset}
  />
);
App1 = connect(mapStateToProps, mapDispatchToProps)(App1);

let App2 = ({ counter, onIncrement, onDecrement, onReset }) => (
  <CounterWrapper2
    counter={counter}
    onIncrement={onIncrement}
    onDecrement={onDecrement}
    onReset={onReset}
  />
);
App2 = connect(mapStateToProps, mapDispatchToProps)(App2);

let App3 = ({ counter, onIncrement, onDecrement, onReset }) => (
  <CounterWrapper3
    counter={counter}
    onIncrement={onIncrement}
    onDecrement={onDecrement}
    onReset={onReset}
  />
);
App3 = connect(mapStateToProps, mapDispatchToProps)(App3);

render(
  <Provider store={store}>
    <App1/>
  </Provider>,
  document.getElementById('container')
);

benchmark(
  50000,
  [<App1/>, <App2/>, <App3/>]
);

function benchmark(N, order) {
  // Warm up
  order.forEach(element => {
    render(
      <Provider store={store}>
        {element}
      </Provider>,
      document.getElementById('container')
    );

    Perf.start();

    for (let i = 0, l = N; i < l; i++) {
      store.dispatch(increment());
    }

    Perf.stop();

    unmountComponentAtNode(document.getElementById('container'));
    store.dispatch(reset());
  });

  // Actual runs
  order.forEach((element, i) => {
    render(
      <Provider store={store}>
        {element}
      </Provider>,
      document.getElementById('container')
    );

    Perf.start();

    for (let i = 0, l = N; i < l; i++) {
      store.dispatch(increment());
    }

    Perf.stop();
    Perf.printInclusive();

    if (i < order.length - 1) {
      unmountComponentAtNode(document.getElementById('container'));
      store.dispatch(reset());
    }
  });
}
