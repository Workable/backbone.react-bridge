import _ from 'underscore';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import initStore from 'redux-test-belt';
import ReactBridge from '../src';

import sinon from 'sinon'
import chai from 'chai';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);
const expect = chai.expect;

import Collection from '../examples/templates/marionetteCollection';
import {viewOptions} from '../examples/helpers';

describe('BackboneReactBridge', () => {

  describe('componentFromView', () => {
    beforeEach(function () {
      document.body.innerHTML = '<div id="app"></div>';
    });

    it('creates a React.Component from a Marionette.View Class', function() {
      const ReactComponent = ReactBridge.componentFromView(Collection, viewOptions);
      expect(ReactTestUtils.isElement(<ReactComponent />)).to.be.true;
    });

    it('creates a React.Component from a Marionette.View', function() {
      const ReactComponent = ReactBridge.componentFromView(new Collection(), viewOptions);
      expect(ReactTestUtils.isElement(<ReactComponent />)).to.be.true;
    });

    it('renders a React.Component from a Marionette.View', function() {
      let element = null;

      const ReactComponent = ReactBridge.componentFromView(Collection, viewOptions);
      ReactDOM.render(<ReactComponent ref={el => (element = el)}/>, document.getElementById('app'));

      const listItems = ReactDOM.findDOMNode(element).children;

      expect(listItems.length).to.equal(2);
      expect(listItems[0].textContent).to.contain('Bacon - Should buy ASAP!');
      expect(listItems[1].textContent).to.contain('Vegetables - Forget it..');
    });

    it('wraps the the React.Component with an element with default tag according to Marionette', function() {
      let element = null;

      const ReactComponent = ReactBridge.componentFromView(Collection, viewOptions);
      ReactDOM.render(<ReactComponent ref={el => (element = el)}/>, document.getElementById('app'));

      const tagName = ReactDOM.findDOMNode(element).tagName;
      expect(tagName).to.equal('UL');
    });

    it('wraps the the React.Component with an element without className', function() {
      let element = null;

      const ReactComponent = ReactBridge.componentFromView(Collection, viewOptions);
      ReactDOM.render(<ReactComponent ref={el => (element = el)}/>, document.getElementById('app'));

      const tagName = ReactDOM.findDOMNode(element).className;
      expect(tagName).to.equal('');
    });

    it('wraps the the React.Component with an element with custom tag', function() {
      let element = null;
      const customViewOptions = _.extend({}, viewOptions);
      customViewOptions.tagName = 'div';

      const ReactComponent = ReactBridge.componentFromView(Collection, customViewOptions);
      ReactDOM.render(<ReactComponent ref={el => (element = el)}/>, document.getElementById('app'));

      const tagName = ReactDOM.findDOMNode(element).tagName;
      expect(tagName).to.equal('DIV');
    });

    it('wraps the the React.Component with an element with custom className', function() {
      let element = null;
      const customViewOptions = _.extend({}, viewOptions);
      customViewOptions.className = 'myClass';

      const ReactComponent = ReactBridge.componentFromView(Collection, customViewOptions);
      ReactDOM.render(<ReactComponent ref={el => (element = el)}/>, document.getElementById('app'));

      const tagName = ReactDOM.findDOMNode(element).className;
      expect(tagName).to.equal('myClass');
    });

    it('calls a function of the Marionette View', function() {
      let viewInstance = null;

      const ReactComponent = ReactBridge.componentFromView(Collection, viewOptions);
      ReactDOM.render(<ReactComponent ref={el => (viewInstance = el)} />, document.getElementById('app'));

      const spy = sinon.spy(viewInstance, 'delegate');
      viewInstance.delegate('log', 'this is a test');

      expect(spy).to.have.been.calledOnce;
      expect(spy).to.have.been.calledWith('log', 'this is a test');
    });

    it('throws an error when eventsToActions function exists without defining a dispatch function', function() {
      const spy = sinon.spy(console, 'error');
      const customViewOptions = _.extend({}, viewOptions);
      delete customViewOptions.dispatch;

      const ReactComponent = ReactBridge.componentFromView(Collection, customViewOptions);
      ReactDOM.render(<ReactComponent />, document.getElementById('app'));

      expect(spy).to.have.been.calledOnce;
      expect(spy).to.have.been.calledWith('The `dispatch` function is not defined.');
    });

    it('dispatches an action when the view triggers an event', function() {
      const mockStore = initStore();
      const store = mockStore({});
      const customViewOptions = _.extend({}, viewOptions);
      customViewOptions.dispatch = store.dispatch;

      const ReactComponent = ReactBridge.componentFromView(Collection, customViewOptions);
      ReactDOM.render(<ReactComponent />, document.getElementById('app'));

      expect(store.hasActions({type: 'INIT'})).to.be.true;
    });


    it('destroys the Marionette.View rendered inside the React.Component', function() {
      const ReactComponent = ReactBridge.componentFromView(Collection, viewOptions);
      const reactInstance = ReactDOM.render(<ReactComponent/>, document.getElementById('app'));

      reactInstance.componentWillUnmount();

      const marionetteViewDestroyed = reactInstance._marionetteView.isDestroyed;
      expect(marionetteViewDestroyed).to.be.true;
    });
  });
});
