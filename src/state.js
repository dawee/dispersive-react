const {QuerySet} = require('dispersive');


class StateField {

  constructor(querysetResolver) {
    if (querysetResolver instanceof QuerySet) {
      this.querysetResolver = () => querysetResolver;
    } else {
      this.querysetResolver = querysetResolver;
    }
  }

  resolveEmitter(queryset) {
    return queryset;
  }

  resolveQueryset(props) {
    return this.querysetResolver.call(null, props);
  }

  initValues(component, queryset, key) {
    component.state[key] = this.values(queryset);
  }

  updateValues(component, queryset, key) {
    const updater = {};

    updater[key] = this.values(queryset);
    component.setState(updater);
  }

}

class ListStateField extends StateField {

  values(queryset) {
    return queryset.values();
  }

}

class UniqueStateField extends StateField {

  resolveEmitter(queryset) {
    return queryset.get();
  }

  values(queryset) {
    return queryset.get().values();
  }

}

class CountStateField extends StateField {

  values(queryset) {
    return queryset.count();
  }

}


module.exports = {
  StateField,
  ListStateField,
  UniqueStateField,
  CountStateField,
};
