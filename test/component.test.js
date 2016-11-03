const {assert} = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');
const Dispersive = require('dispersive');
const DispersiveReact = require('../src');


describe('Component', () => {

  let component = null;

  const schema = {text: '', checked: false};
  const Todo = Dispersive.store.register('todos', {schema});

  class Component extends DispersiveReact.Component {

    setState(newState) {
      Object.assign(this.state, newState);
    }

  }

  describe('state', () => {

    afterEach(() => component && component.componentWillUnmount())

    describe('todos: Todo.objects', () => {
      before(() => {
        Component.stateFields = {
          todos: Todo.objects
        };
      });

      beforeEach(() => {
        Todo.objects.delete();
        Todo.objects.create();
      });

      it('should initialize state.todos', () => {
        component = new Component();
        assert.equal(component.state.todos.length, 1);
      });

      it('should update state.todos', () => {
        component = new Component();

        Todo.objects.create();
        assert.equal(component.state.todos.length, 2);
      });
    });

    describe('todo: Todo.objects.get({id: ...})', () => {

      let unique = null;

      before(() => {
        unique = Todo.objects.create();

        Component.stateFields = {
          todo: Todo.objects.get({id: unique.id}),
        };
      });

      it('should initialize state.todo', () => {
        component = new Component();
        assert.equal(component.state.todo.id, unique.id);
      });

      it('should update state.todo', () => {
        component = new Component();

        unique.update({text: 'wash dishes'});
        assert.equal(component.state.todo.text, 'wash dishes');
      });

    });

  });

});