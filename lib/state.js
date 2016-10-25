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
