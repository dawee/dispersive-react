const {assert} = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');
const Dispersive = require('dispersive');
const DispersiveReact = require('../src');


describe('Component', () => {

  const schema = {text: '', checked: false};
  const Todo = Dispersive.store.register('todos', {schema});

  class Component extends DispersiveReact.Component {

    setState(newState) {
      Object.assign(this.state, newState);
    }

  }

  Component.stateFields = {
    todos: Todo.objects
  };

  beforeEach(() => Todo.objects.delete());

  it('should initialize state.todos', () => {
    Todo.objects.create();

    const component = new Component();

    assert.equal(component.state.todos.length, 1);
  });

  it('should update state.todos', () => {
    Todo.objects.create();

    const component = new Component();

    Todo.objects.create();

    assert.equal(component.state.todos.length, 2);
  });

});