import React, {Component} from 'react';

const {expect} = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');
const {Store} = require('dispersive');
const {Observer} = require('../src');
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

    const dump = ReactTestRenderer.create(<Test />).toJSON();

    expect(dump.type).to.equal('section');
  });

});
