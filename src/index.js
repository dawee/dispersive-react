const React = require('react');
const {QuerySet, Model} = require('dispersive');


QuerySet.recompute = true;


class StateField {

  static create({component, name, spec}) {
    if (!!spec.prototype && spec.prototype instanceof StateField) {
      const CustomStateField = spec;

      return new CustomStateField({component, name});
    }

    return new QuerySetStateField({component, name, queryset: spec});
  }

  constructor({component = null, name = null}) {
    this.name = name;
    this.component = component;
  }

  initValue(value) {
    this.component.state[this.name] = value;
    this.value = value;
  }

  updateValue(value) {
    const updater = {};

    updater[this.name] = value;
    this.component.setState(updater);
    this.value = value;
  }

  compute() {
    return null;
  }

  initialize() {
    this.initValue(this.compute());
  }

  update() {
    this.updateValue(this.compute());
  }

  activate() {}
  deactivate() {}
}


class QuerySetStateField extends StateField {

  constructor({component, name, queryset}) {
    super({component, name});

    this.subscriptions = [];

    if (!this.queryset) this.queryset = queryset;

    this.explode();
  }

  explode() {
    let initial = null;
    let qpack = null;
    let model = null;

    if (typeof this.queryset === 'function') {
      initial = this.queryset(this.component.props, this.component.context);
    } else {
      initial = this.queryset;
    }

    if (initial instanceof QuerySet) initial = initial.values();

    qpack = initial.__qpack__;

    if (initial instanceof Model) {
      model = initial;
      initial = initial.values();
    }

    Object.assign(this, {initial, qpack, model});
  }

  compute() {
    return this.qpack.recompute();
  }

  deactivate() {
    for (const subscription of this.subscriptions) {
      subscription.remove();
    }

    this.subscriptions = [];
  }

  activate() {
    this.subscriptions.push(this.qpack.queryset.changed(() => this.update()));

    if (!!this.model) this.subscriptions.push(this.model.changed(() => this.update()));
  }

}

const count = queryset => class extends QuerySetStateField {

  get queryset() {
    return queryset;
  }

  compute() {
    const list = super.compute();

    return Array.isArray(list) ? list.length : 0;
  }

};


class Component extends React.Component {

  static using({events = [], props = {}, context = {}, state = {}}) {
    return class extends Component {
      static get eventNames() {
        return events;
      }

      static get stateFields() {
        return state;
      }

      static get contextTypes() {
        return context;
      }

      static get propTypes() {
        return props;
      }
    };
  }

  static attach(component, {events = [], props = {}, context = {}, state = {}}) {
    component.eventNames = events;
    component.stateFields = state;
    component.contextTypes = context;
    component.propTypes = props;

    return component;
  }

  constructor(...args) {
    super(...args);

    this.state = !!this.state ? this.state : {};
    this.createFields(this.constructor.stateFields || {});
    this.bindEvents(this.constructor.eventNames || []);
  }

  componentWillMount() {
    this.createFieldsFromState();
  }

  componentWillUnmount() {
    for (const field of this._fields) {
      field.deactivate();
    }
  }

  createFieldsFromState() {
    const dispersiveState = {};

    if (!this.state) return;

    for (const key of Object.keys(this.state)) {
      const spec = this.state[key];

      if (typeof spec === 'function'
          || (spec instanceof QuerySet)
          || (!!spec.prototype && spec.prototype instanceof StateField)) {
        dispersiveState[key] = this.state[key];
      }
    }

    this.createFields(dispersiveState);
  }

  bindEvents(events) {
    for (const event of events) {
      this[event] = !!this[event] && this[event].bind(this) || (() => null);
    }
  }

  createFields(specs) {
    this._fields = !!this._fields ? this._fields : new Set();

    for (const name of Object.keys(specs)) {
      const spec = specs[name];
      const field = StateField.create({name, spec, component: this});

      field.initialize();
      field.activate();

      this._fields.add(field);
    }
  }

}

module.exports = {Component, StateField, QuerySetStateField, count};
