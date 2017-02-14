import {QuerySet, Model} from 'dispersive';
import {Component} from 'react';


export class Observer extends Component {

  /*
   * QuerySet subscriptions
   */

   eachProps(name, predicate) {
     if (!this.props || !this.props[name]) return;

     Object.keys(this.props[name]).forEach(
       name => predicate({name, value: this.props[name][name]})
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

    if (!!model.queryset) {
      this.subscriptions[name].push(model.queryset.changed(() => this.forceUpdate()));
    }
  }

  /*
   * React LifeCycle
   */

   componentDidMount() {
     this.eachQuerySet(({name, queryset}) => this.resetQuerySetSubscription(name, queryset));
     this.eachModel(({name, queryset}) => this.resetModelSubscription(name, queryset));
   }

   componentWillUnmount() {
     this.eachQuerySet(({name}) => this.removeSubscription(name));
     this.eachModel(({name}) => this.removeSubscription(name));
   }


   componentWillUpdate() {
     this.eachQuerySet(({name, queryset}) => this.resetQuerySetSubscription(name, queryset));
     this.eachModel(({name, queryset}) => this.resetModelSubscription(name, queryset));
   }

   render() {
     return this.props.children;
   }

};
