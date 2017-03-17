import React, {Component} from 'react';

const {expect} = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');
const {createAction} = require('dispersive/action');
const {createModel} = require('dispersive/model');
const {withField} = require('dispersive/field');
const {Watcher} = require('../src');
const ReactTestRenderer = require('react-test-renderer');

describe('Watcher', () => {

  it('should render when entry is added', () => {
    const Product = createModel([
      withField('name'),
      withField('price', {initial: 0}),
    ]);

    const ProductsCount = () => <div>{Product.objects.length}</div>;

    const Test = () => (
      <Watcher models={[Product]}>
        <ProductsCount />
      </Watcher>
    );

    const root = ReactTestRenderer.create(<Test />);
    const addProduct = createAction(data => Product.objects.create(data), [Product]);

    expect(root.toJSON().children[0]).to.equal(0);
    addProduct({name: 'foo', price: 42});
    expect(root.toJSON().children[0]).to.equal(1);
  });

});
