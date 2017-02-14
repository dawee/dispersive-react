# dispersive-react

Binding of [dispersive](http://github.com/dawee/dispersive) for [react](http://github.com/facebook/react) components.

## Install

This package has 2 peer dependancies : [dispersive](http://github.com/dawee/dispersive) and [react](http://github.com/facebook/react).

```sh
npm install dispersive react dispersive-react
```

## Usage

```jsx
import {Store} from 'dispersive';
import React, {Component} from 'react';
import {Observer} from 'dispersive-react';

const schema = {
  name: '',
  price: 0,
};

const products = Store.createObjects({schema});

const Product = ({product}) => (
  <li className="product">
    <div className="name">{product.name}</div>
    <div className="price">{product.price}</div>
  </li>
);

const ProductList = ({products}) => (
  <ul>
    {products.map(product => (
      <Observer models={{product}}>
        <Product product={product} />
      </Observer>
    ))}
  </ul>
);

class App extends Component {

  render() {
    return (
      <Observer querysets={{products}}>
        <ProductList products={products} />
      </Observer>
    )
  }

};

export default App;
```

In this example, both the list and the product are observers.

So, if you type this:

```js
products.create({name: 'ball', price: 12.5});
```

Then, the list will re-render.

And if you type this :

```js
products.first().update({price: 15.25});
```

Then, the only the concerned _Product_ element will re-render.
