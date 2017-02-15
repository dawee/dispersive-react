import React, {Component} from 'react';

const {expect} = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');
const {Store} = require('dispersive');
const {Watcher} = require('../src');
const ReactTestRenderer = require('react-test-renderer');

describe('Watcher', () => {

  it('should render when entry is added', () => {
    const products = Store.createObjects({schema: {name: '', price: 0}});

    class ProductsCount extends Component {

      render() {
        return <div>{this.props.products.count()}</div>;
      }

    }

    class Test extends Component {
      render() {
        return (
          <Watcher sources={{products}}>
            <ProductsCount products={products} />
          </Watcher>
        );
      }
    }

    const root = ReactTestRenderer.create(<Test />);

    expect(root.toJSON().children[0]).to.equal(0);
    products.create({name: 'foo', price: 42});
    expect(root.toJSON().children[0]).to.equal(1);
  });

  it('should render if validator returns true', () => {
    const products = Store.createObjects({schema: {name: '', price: 0}});

    class ProductsCount extends Component {

      render() {
        return <div>{this.props.products.count()}</div>;
      }

    }

    class Test extends Component {
      render() {
        return (
          <Watcher sources={{products}} validate={() => true}>
            <ProductsCount products={products} />
          </Watcher>
        );
      }
    }

    const root = ReactTestRenderer.create(<Test />);

    expect(root.toJSON().children[0]).to.equal(0);
    products.create({name: 'foo', price: 42});
    expect(root.toJSON().children[0]).to.equal(1);
  });

  it('should render if validator returns true', () => {
    const products = Store.createObjects({schema: {name: '', price: 0}});

    class ProductsCount extends Component {

      render() {
        return <div>{this.props.products.count()}</div>;
      }

    }

    class Test extends Component {
      render() {
        return (
          <Watcher sources={{products}} validate={() => false}>
            <ProductsCount products={products} />
          </Watcher>
        );
      }
    }

    const root = ReactTestRenderer.create(<Test />);

    expect(root.toJSON()).to.equal(null);
  });

  it('should render when a model is changed', () => {
    const products = Store.createObjects({schema: {name: '', price: 0}});
    const foo = products.create({name: 'foo'});

    class ProductName extends Component {

      render() {
        return <div>{this.props.product.name}</div>;
      }

    }

    class Test extends Component {
      render() {
        return (
          <Watcher sources={{product: foo}}>
            <ProductName product={foo} />
          </Watcher>
        );
      }
    }


    const root = ReactTestRenderer.create(<Test />);

    expect(root.toJSON().children[0]).to.equal('foo');
    foo.update({name: 'bar'});
    expect(root.toJSON().children[0]).to.equal('bar');
  });

  it('should work with a sub child component', () => {
    const products = Store.createObjects({schema: {name: '', price: 0}});
    const foo = products.create({name: 'foo'});

    class ProductName extends Component {

      render() {
        return <div>{this.props.product.name}</div>;
      }

    }

    class Test extends Component {
      render() {
        return (
          <Watcher sources={{product: foo}}>
            <div>
              <div>
                <ProductName product={foo} />
              </div>
            </div>
          </Watcher>
        );
      }
    }


    const root = ReactTestRenderer.create(<Test />);

    expect(root.toJSON().children[0].children[0].children[0]).to.equal('foo');
    foo.update({name: 'bar'});
    expect(root.toJSON().children[0].children[0].children[0]).to.equal('bar');
  });

});
