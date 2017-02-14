import {QuerySet, Model} from 'dispersive';
import React, {Component} from 'react';


const isComponent = el => !!el && !!el.type && !!el.type.prototype && (
  el.type.prototype instanceof Component
);


export const Observable = {};

export class Observer extends Component {

  /*
   * React LifeCycle
   */

   componentDidMount() {
     this.subscriptions = {};

     this.eachQuerySet(({name, value}) => this.resetQuerySetSubscription(name, value));
     this.eachModel(({name, value}) => this.resetModelSubscription(name, value));
   }

   componentWillUnmount() {
     this.eachQuerySet(({name}) => this.removeSubscription(name));
     this.eachModel(({name}) => this.removeSubscription(name));
   }


   componentWillUpdate() {
     this.eachQuerySet(({name, value}) => this.resetQuerySetSubscription(name, value));
     this.eachModel(({name, value}) => this.resetModelSubscription(name, value));
   }


  /*
   * QuerySet subscriptions
   */

   eachProps(prop, predicate) {
     if (!this.props || !this.props[prop]) return;

     Object.keys(this.props[prop]).forEach(
       name => predicate({name, value: this.props[prop][name]})
     );
   }

   eachQuerySet(predicate) {
     return this.eachProps('querysets', predicate);
   }

   eachModel(predicate) {
     return this.eachProps('models', predicate);
   }

  removeSubscription(name) {
    if (! (name in this.subscriptions)) return;

    this.subscriptions[name].forEach(subscription => subscription.remove());
    delete this.subscriptions[name];
  }

  resetQuerySetSubscription(name, queryset) {
    this.removeSubscription(name);
    this.subscriptions[name] = [queryset.changed(() => this.forceUpdate())];
  }

  resetModelSubscription(name, model) {
    this.removeSubscription(name);
    this.subscriptions[name] = [model.changed(() => this.forceUpdate())];
  }


  getObserved(filter = {}) {
    const observed = {};
    const push = (name, value) => {
      if ((name in filter) && filter[name] === Observable) {
        observed[name] = value;
      }
    };

    this.eachQuerySet(({name, value}) => push(name, value));
    this.eachModel(({name, value}) => push(name, value.objects.get({id: value.id})));

    return observed;
  }

  cloneElement(el) {
    const props = el.props;
    let children = el.props.children;

    if (React.Children.count(children) > 0 && !isComponent(el)) {
      children = React.Children.map(children, child => this.cloneElement(child));
    }

    return React.cloneElement(el, this.getObserved(el.props), children);
  }


   render() {
     const childrenCount = React.Children.count(this.props.children);

     if (childrenCount !== 1) {
       throw new BadChildrenCount(`Observer accepts only one child. Received : ${childrenCount}`);
     }

     return this.cloneElement(React.Children.only(this.props.children));
   }

};

Observer.BadChildrenCount = function (message) {
  Object.assign(this, ({name: 'BadChildrenCount', message}));
};
