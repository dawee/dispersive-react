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

  afterEach(() => component && component.componentWillUnmount())

  describe('QuerySetStateField', () => {

    describe('todos: Todo.objects', () => {
      beforeEach(() => {
        Todo.objects.delete();
        Todo.objects.create();

        Component.stateFields = {
          todos: Todo.objects
        };
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

      beforeEach(() => {
        Todo.objects.delete();
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

    describe('todo: Todo.objects.first()', () => {

      beforeEach(() => {
        Todo.objects.delete();
        Todo.objects.create({text: 'wash dishes'});

        Component.stateFields = {
          todo: Todo.objects.orderBy('text').first(),
        };
      });

      it('should initialize state.todo', () => {
        component = new Component();
        assert.equal(component.state.todo.text, 'wash dishes');
      });

      it('should update state.todo', () => {
        component = new Component();
        Todo.objects.create({text: 'star dispersive'});
        assert.equal(component.state.todo.text, 'star dispersive');
      });

    });

    describe('todo: Todo.objects.last()', () => {

      beforeEach(() => {
        Todo.objects.delete();
        Todo.objects.create({text: 'star dispersive'});

        Component.stateFields = {
          todo: Todo.objects.orderBy('text').last(),
        };
      });

      it('should initialize state.todo', () => {
        component = new Component();
        assert.equal(component.state.todo.text, 'star dispersive');
      });

      it('should update state.todo', () => {
        component = new Component();
        Todo.objects.create({text: 'wash dishes'});
        assert.equal(component.state.todo.text, 'wash dishes');
      });

    });

    describe('todo: Todo.objects.at(<index>)', () => {

      beforeEach(() => {
        Todo.objects.delete();
        Todo.objects.create({text: 'build a rocket'});
        Todo.objects.create({text: 'star dispersive'});

        Component.stateFields = {
          todo: Todo.objects.orderBy('text').at(1),
        };
      });

      it('should initialize state.todo', () => {
        component = new Component();
        assert.equal(component.state.todo.text, 'star dispersive');
      });

      it('should update state.todo', () => {
        component = new Component();
        Todo.objects.create({text: 'feed the cat'});
        assert.equal(component.state.todo.text, 'feed the cat');
      });

    });

    describe('todo: Todo.objects.all()', () => {

      beforeEach(() => {
        Todo.objects.delete();
        Todo.objects.create();

        Component.stateFields = {
          todos: Todo.objects.all()
        };
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

  });

  describe('AtLeastOnceTodo (CustomField)', () => {

    class AtLeastOnceTodo extends DispersiveReact.QuerySetStateField {

      get queryset() {
        return Todo.objects;
      }

      initialize() {
        super.initialize();
        this.initValue(false);
      }

      update() {
        if (!this.value) this.updateValue(true);
      }

    }

    beforeEach(() => {
      Todo.objects.delete();

      Component.stateFields = {
        booted: AtLeastOnceTodo,
      };
    });

    it('should initialize booted to false', () => {
      component = new Component();
      assert.equal(component.state.booted, false);
    });

    it('should update booted to true', () => {
      component = new Component();
      Todo.objects.create();
      assert.equal(component.state.booted, true);
    });

  })

});