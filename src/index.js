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

  initialize() {
    this.component.state[this.name] = this.initial;
  }

  compute() {
    return this.qpack.recompute();
  }

  deactivate() {
    this.activated = false;
  }

  update() {
    if (this.activated) super.update();
  }

  activate() {
    this.activated = true;
    this.qpack.queryset.changed(() => this.update());

    if (!!this.model) this.model.changed(() => this.update());
  }

}


class Component extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {};
    this.createFields(this.constructor.stateFields || {});
  }

  componentWillUnmount() {
    for (const field of this._fields) {
      field.deactivate();
    }
  }

  createFields(specs) {
    this._fields = new Set();

    for (const name of Object.keys(specs)) {
      const spec = specs[name];
      const field = StateField.create({name, spec, component: this});

      field.initialize();
      field.activate();

      this._fields.add(field);
    }
  }

}

module.exports = {Component, StateField, QuerySetStateField};
