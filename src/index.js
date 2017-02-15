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

  getNewProps() {
    const props = {};

    this.eachSource(({name, source}) => {
      if (source instanceof Model) {
        props[name] = source.objects.get({id: source.id});
      } else if (source instanceof EventEmitter.Emittable) {
        props[name] = source;
      } else {
        throw new Watcher.BadSourceType(name);
      }
    });

    return props;
  }

  injectProps(filter = {}, newProps = {}) {
    const props = {};

    this.eachSource(({name}) => {
      if (!(name in filter) || filter[name] !== this.props.sources[name]) return;

      props[name] = newProps[name];
    });

    return props;
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

  cloneElement(el, newProps) {
    let children = el.props.children;

    if (React.Children.count(children) > 0 && !isComponent(el)) {
      children = React.Children.map(children, child => this.cloneElement(child, newProps));
    }

    return React.cloneElement(el, this.injectProps(el.props, newProps), children);
  }

  render() {
    const childrenCount = React.Children.count(this.props.children);
    const newProps = this.getNewProps();

    if (childrenCount !== 1) throw new Watcher.BadChildrenCount(childrenCount);

    return this.cloneElement(React.Children.only(this.props.children), newProps);
  }

}

Watcher.propTypes = {
  sources: React.PropTypes.object.isRequired,
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
