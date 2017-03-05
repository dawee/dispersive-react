import React, {Component} from 'react';

const isComponent = el => !!el && !!el.type && !!el.type.prototype && (
  el.type.prototype instanceof Component
);

export class Watcher extends Component {

  componentDidMount() {
    this.subscriptions = this.props.sources ? this.props.sources.map(
      source => this.subscribeTo(source)
    ) : [];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.remove());
    this.subscriptions = null;
  }

  subscribeTo(source) {
    return source.emitter.changed(() => this.forceUpdate());
  }

  cloneChildren(el, {children = null}) {
    return children && React.Children.count(children) > 0 && !isComponent(el) ? (
      React.Children.map(children, child => this.cloneElement(child))
    ) : children;
  }

  cloneElement(el) {
    const children = this.cloneChildren(el, el.props);

    return React.cloneElement(el, el.props, children);
  }

  render() {
    const childrenCount = React.Children.count(this.props.children);

    if (childrenCount !== 1) throw new Watcher.BadChildrenCount(childrenCount);

    return this.cloneElement(React.Children.only(this.props.children));
  }

}

Watcher.propTypes = {
  sources: React.PropTypes.array.isRequired,
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
