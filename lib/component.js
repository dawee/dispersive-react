const React = require('react');


class StateFieldApplier {

  constructor(stateField, props) {
    this.stateField = stateField;
    this.queryset = this.stateField.resolveQueryset(props);
    this.emitter = this.stateField.resolveEmitter(this.queryset);
  }

  values() {
    return this.stateField.values(this.queryset);
  }

  initValues(component, key) {
    return this.stateField.initValues(component, this.queryset, key);
  }

  updateValues(component, key) {
    return this.stateField.updateValues(component, this.queryset, key);
  }

}

const componentMixin = Base => class extends Base {

  constructor(...args) {
    super(...args);
    this.applyStateFields();
    this.bindEvents();
    this.listenStores();
    this.initState();
  }

  applyStateFields() {
    const stateFields = this.constructor.stateFields || {};

    this._fields = {};

    for (const key of Object.keys(stateFields)) {
      this._fields[key] = new StateFieldApplier(stateFields[key], this.props);
    }
  }

  bindEvents() {
    const eventsNames = this.constructor.eventsNames || [];

    for (const eventName of eventsNames) {
      this[eventName] = this[eventName].bind(this);
    }
  }

  listenStores() {
    for (const key of Object.keys(this._fields)) {
      this._fields[key].emitter.changed(() => this.updateStateValue(key));
    }
  }

  initState() {
    this.state = {};

    Object.keys(this._fields).forEach(key => this.initStateValue(key));
  }

  initStateValue(key) {
    this._fields[key].initValues(this, key);
  }

  updateStateValue(key) {
    this._fields[key].updateValues(this, key);
  }

};

class Component extends componentMixin(React.Component) {

  static attach(component, config = {}) {
    if (!!config.events) component.eventsNames = config.events;
    if (!!config.context) component.contextTypes = config.context;
    if (!!config.props) component.propTypes = config.props;
    if (!!config.state) component.stateFields = config.state;

    return component;
  }

  static mixin(Base) {
    return componentMixin(Base);
  }

}

module.exports = Component;
