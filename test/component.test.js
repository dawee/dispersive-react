import React, {Component} from 'react';

const {expect} = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');
const {Store} = require('dispersive');
const {Observer, Observable} = require('../src');
const ReactTestRenderer = require('react-test-renderer');

describe('Observer', () => {

  it('should render children', () => {

    class Test extends Component {
      render() {
        return (
          <Observer>
            <section />
          </Observer>
        );
      }
    }

    const root = ReactTestRenderer.create(<Test />);

    expect(root.toJSON().type).to.equal('section');
  });

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
          <Observer querysets={{products}}>
            <ProductsCount products={Observable} />
          </Observer>
        );
      }
    }

    const root = ReactTestRenderer.create(<Test />);

    expect(root.toJSON().children[0]).to.equal(0);
    products.create({name: 'foo', price: 42});
    expect(root.toJSON().children[0]).to.equal(1);
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
          <Observer models={{product: foo}}>
            <ProductName product={Observable} />
          </Observer>
        );
      }
    }


    const root = ReactTestRenderer.create(<Test />);

    expect(root.toJSON().children[0]).to.equal('foo');
    foo.update({name: 'bar'});
    expect(root.toJSON().children[0]).to.equal('bar');
  });

});
