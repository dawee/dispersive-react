const {assert} = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');

let Dispersive = null;
let DispersiveReact = null

if (process.env.DISPERSIVE_ECMA === '5') {
  const DispersiveES6 = require('dispersive/es5');

  Dispersive = require('dispersive/es5');

  mock('dispersive', Dispersive);
  DispersiveReact = require('../es5');
} else {
  Dispersive = require('dispersive');
  DispersiveReact = require('..');
}

const {Component, UniqueStateField, ListStateField, CountStateField} = DispersiveReact;

class MockComponent {

  constructor(props = {}) {
    this.props = props;
  }

  setState(newState) {
    Object.assign(this.state, newState);
  }

}

const schema = {
  text: null,
  checked: false
};

class Todo extends Dispersive.Model {
  // Todo model is empty
}

const store = new Dispersive.Store();

store.register('todos', {model: Todo, schema});

describe('Component', () => {


  describe('ListStateField', () => {

    /*
     * TodoList
     */

    const state = {
      todos: new ListStateField(Todo.objects)
    };

    class TodoList extends Component.mixin(MockComponent) {
      // TodoList is empty
    }

    Component.attach(TodoList, {state});

    // -- tests

    beforeEach(() => Todo.objects.delete());

    it('should init with existing list elements', () => {
      Todo.objects.create({text: 'foo'});

      const todoList = new TodoList();

      assert.equal(todoList.state.todos[0].text, 'foo');
    });

    it('should update with new elements', () => {
      const todoList = new TodoList();

      Todo.objects.create({text: 'foo'});

      assert.equal(todoList.state.todos[0].text, 'foo');
    });

  });


  describe('UniqueStateField', () => {

    /*
     * TodoLine
     */

    const state = {
      todo: new UniqueStateField(Todo.objects)
    };

    class TodoLine extends Component.mixin(MockComponent) {
      // TodoLine is empty
    }

    Component.attach(TodoLine, {state});

    // -- tests

    Todo.objects.create({text: 'foo'});


    it('should init with existing element', () => {
      const todoLine = new TodoLine();

      assert.equal(todoLine.state.todo.text, 'foo');
    });

    it('should update when element changes', () => {
      const todoLine = new TodoLine();

      Todo.objects.get().update({checked: true});

      assert.equal(todoLine.state.todo.checked, true);
    });

  });

  describe('CountStateField', () => {

    /*
     * TodoLine
     */

    const state = {
      todosCount: new CountStateField(
        props => props.uncheckedOnly ? Todo.objects.filter({checked: false}) : Todo.objects
      )
    };

    class TodoStatus extends Component.mixin(MockComponent) {
      // TodoLine is empty
    }

    Component.attach(TodoStatus, {state});

    // -- tests

    beforeEach(() => Todo.objects.delete());

    it('should init with existing element', () => {
      Todo.objects.create({text: 'foo'});

      const todoStatus = new TodoStatus();

      assert.equal(todoStatus.state.todosCount, 1);
    });

    it('should update when element changes', () => {
      const todoStatus = new TodoStatus();

      Todo.objects.create({text: 'foo'});

      assert.equal(todoStatus.state.todosCount, 1);
    });

    it('should update when element changes', () => {
      const todoStatus = new TodoStatus({uncheckedOnly: true});

      Todo.objects.create({text: 'foo', checked: true});

      assert.equal(todoStatus.state.todosCount, 0);
    });

  });
});
