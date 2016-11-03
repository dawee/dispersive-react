const React = require('react');
const {QuerySet, Model} = require('dispersive');


QuerySet.recompute = true;


class StateField {

  constructor({component, name = null}) {
    this.name = name;
    this.component = component;
  }

  compute() {
    return null;
  }

  initialize() {
    this.component.state[this.name] = this.compute();
  }

  update() {
    const updater = {};

    updater[this.name] = this.compute();
    this.component.setState(updater);
  }

  activate() {}
  deactivate() {}
}

class QuerySetStateField extends StateField {

  constructor({component, name, spec}) {
    super({component, name});
    this.resolver = typeof spec === 'function' ? spec : () => spec;
  }

  explode() {
    let initial = this.resolver(this.component.props, this.component.context);
    let qpack = null;
    let model = null;

    if (initial instanceof QuerySet) initial = initial.values();

    qpack = initial.__qpack__;

    if (initial instanceof Model) {
      model = initial;
      initial = initial.values();
    }

    Object.assign(this, {initial, qpack, model});
  }

  initialize() {
    this.explode();
    this.component.state[this.name] = this.initial;
  }

  compute() {
    return this.qpack.recompute();
  }

  activate() {
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

  createFields(specs) {
    this._fields = new Set();
    
    for (const name of Object.keys(specs)) {
      const spec = specs[name];
      const field = new QuerySetStateField({name, spec, component: this});

      field.initialize();
      field.activate();

      this._fields.add(field)
    }
  }

  componentWillUnmount() {
    for (const field of this._fields) {
      this._fields.deactivate();
    }
  }

}


module.exports = Component;