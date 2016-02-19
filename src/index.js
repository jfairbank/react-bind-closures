import React from 'react';

export default function bindClosures(closuresMap) {
  return (Component) => {
    const componentName = Component.displayName || Component.name || 'Component';
    const closureNames = Object.keys(closuresMap);

    const spec = closureNames.reduce((memo, closureName) => {
      const injectedClosure = closuresMap[closureName];

      memo[closureName] = function boundClosure(...args) {
        return injectedClosure(this.props, ...args);
      };

      return memo;
    }, {});

    spec.componentWillMount = function componentWillMount() {
      this.__closures = closureNames.reduce((memo, closureName) => {
        memo[closureName] = this[closureName];
        return memo;
      }, {});
    };

    spec.render = function render() {
      const newProps = {
        ...this.props,
        ...this.__closures,
      };

      return Component(newProps);
    };

    const Wrapper = React.createClass(spec);
    Wrapper.displayName = `ClosureWrapper(${componentName})`;

    return Wrapper;
  };
}
