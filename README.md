# dispersive-react

Binding of [dispersive](http://github.com/dawee/dispersive) for [react](http://github.com/facebook/react) components.

## Install

This package has 2 peer dependencies : [dispersive](http://github.com/dawee/dispersive) and [react](http://github.com/facebook/react).

```sh
npm install dispersive react dispersive-react
```

## Usage

```jsx
import React, {Component} from 'react';
import classNames from 'classnames';
import {createModel} from 'dispersive/model';
import {withField} from 'dispersive/field';
import {createAction} from 'dispersive/action';
import {Watcher} from 'dispersive-react';

const Todo = createModel([
  withField('text'),  
  withField('checked'),
]);

const toggleTodo = createAction(todo => todo.update({checked: !todo.checked}));
const addTodo = createAction(text => Todo.objects.create({text}));

const TodoItem = ({todo}) => {
  const className = classNames('todo', todo.checked ? 'checked' : null);

  return (
    <li className={className} onClick={() => toggleTodo(todo)}>
      {todo.text}
    </li>
  );
};

const TodoList = () => (
  <ul className="todo-list">
    {Todo.objects.map(todo => <TodoItem todo={todo} key={todo.pk} />}
  </ul>
);

class TodoForm extends Component {

  submit = (event) => {
    event.preventDefault();
    addTodo({text: this.input.value});
  }

  render() {
    return (
      <form onSubmit={submit}>
        <input ref={input => this.input = input} />
      </form>      
    );
  }
}

class App = () => (
  <Watcher sources={[Todo]}>
    <div className="app">
      <TodoList />
      <TodoForm />
    </div>
  </Watcher>  
);

export default App;
```
