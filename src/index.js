import React from 'react';

export default function bindClosures(closuresMap) {
  return (Component) => {
    const componentName = Component.displayName || Component.name || 'Component';
    const closureNames = Object.keys(closuresMap);

    const methods = closureNames.reduce((memo, key) => {
      const argsProducer = closuresMap[key];

      memo[key] = function() {
        const originalPropFunction = this.props[key];
        const args = argsProducer(this.props);

        if (!args) {
          return originalPropFunction();
        }

        switch (args.length) {
          case 0: return originalPropFunction();
          case 1: return originalPropFunction(args[0]);
          case 2: return originalPropFunction(args[0], args[1]);
          case 3: return originalPropFunction(args[0], args[1], args[2]);
          case 4: return originalPropFunction(args[0], args[1], args[2], args[3]);
          default: return originalPropFunction.apply(null, args);
        }
      };

      return memo;
    }, {});

    methods.render = function render() {
      const closures = closureNames.reduce((memo, key) => {
        memo[key] = this[key];
        return memo;
      }, {});

      return Component({
        ...this.props,
        ...closures
      });
    };

    const Wrapper = React.createClass(methods);
    Wrapper.displayName = `ClosureWrapper(${componentName})`;

    return Wrapper;
  };
}
