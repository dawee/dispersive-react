import React, {Component} from 'react';
import {createChangesFunnelEmitter} from 'dispersive/emitter';

const isComponent = el => !!el && !!el.type && !!el.type.prototype && (
  el.type.prototype instanceof Component
);

export class Watcher extends Component {

  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  getState() {
    return this.props.state ? this.props.state() : {};
  }

  componentDidMount() {
    this.subscription = createChangesFunnelEmitter({models: this.props.models}).changed(
      () => this.setState(this.getState())
    );
  }

  componentWillUnmount() {
    this.subscription.remove();
    this.subscription = null;
  }

  render() {
    const childrenCount = React.Children.count(this.props.children);

    if (childrenCount !== 1) throw new Watcher.BadChildrenCount(childrenCount);

    return React.cloneElement(React.Children.only(this.props.children), this.state);
  }

}

Watcher.propTypes = {
  models: React.PropTypes.array.isRequired,
  children: React.PropTypes.element.isRequired,
  state: React.PropTypes.func,
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
