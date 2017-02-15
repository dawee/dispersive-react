import {EventEmitter, Model} from 'dispersive';
import React, {Component} from 'react';


const isComponent = el => !!el && !!el.type && !!el.type.prototype && (
  el.type.prototype instanceof Component
);


export class Watcher extends Component {

  componentDidMount() {
    this.subscriptions = {};
    this.eachSource(({name, source}) => this.resetSubscription(name, source));
  }

  componentWillUpdate() {
    this.eachSource(({name, source}) => this.resetSubscription(name, source));
  }

  componentWillUnmount() {
    this.eachSource(({name}) => this.removeSubscription(name));
  }

  getObserved(filter = {}) {
    const observed = {};

    this.eachSource((name, source) => {
      if (!(name in filter) || filter[name] !== this.props.sources[name]) return;

      if (source instanceof Model) {
        observed[name] = source.objects.get({id: source.id});
      } else if (source instanceof EventEmitter.Emittable) {
        observed[name] = source;
      } else {
        throw new Watcher.BadSourceType(name);
      }
    });

    return observed;
  }

  removeSubscription(name) {
    if (!this.subscriptions[name]) return;

    this.subscriptions[name].remove();
    this.subscriptions[name] = null;
  }

  resetSubscription(name, source) {
    this.removeSubscription(name);
    this.subscriptions[name] = source.changed(() => this.forceUpdate());
  }

  eachSource(predicate) {
    if (!this.props || !this.props.sources) return;

    Object.keys(this.props.sources).forEach(
      name => predicate({name, source: this.props.sources[name]})
    );
  }

  cloneElement(el) {
    let children = el.props.children;

    if (React.Children.count(children) > 0 && !isComponent(el)) {
      children = React.Children.map(children, child => this.cloneElement(child));
    }

    return React.cloneElement(el, this.getObserved(el.props), children);
  }

  render() {
    const childrenCount = React.Children.count(this.props.children);

    if (childrenCount !== 1) throw new Watcher.BadChildrenCount(childrenCount);

    return this.cloneElement(React.Children.only(this.props.children));
  }

}

Watcher.propTypes = {
  sources: React.PropTypes.object,
  children: React.PropTypes.element.isRequired,
};

Watcher.BadChildrenCount = function WatcherBadChildrenCount(childrenCount) {
  Object.assign(this, ({
    name: 'BadChildrenCount',
    message: `Watcher accepts only one child. Received : ${childrenCount}`,
  }));
};

Watcher.BadSourceType = function WatcherBadSourceType(name) {
  Object.assign(this, ({
    name: 'BadSourceType',
    message: `Watcher source not valid (bad type) : '${name}'`,
  }));
};
