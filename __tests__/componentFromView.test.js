import _ from 'underscore';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import initStore from 'redux-test-belt';
import ReactBridge from '../src';

import { describe } from 'ava-spec';
import sinon from 'sinon'

import Collection from '../examples/vanilla-example/templates/marionetteCollection';
import {viewOptions} from '../examples/helpers';

describe('componentFromView', it => {

  it.beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it('creates a React.Component from a Marionette.View Class', t => {
    const ReactComponent = ReactBridge.componentFromView(Collection, viewOptions);
    t.true(ReactTestUtils.isElement(<ReactComponent />));
  });

  it('creates a React.Component from a Marionette.View', t => {
    const ReactComponent = ReactBridge.componentFromView(new Collection(), viewOptions);
    t.true(ReactTestUtils.isElement(<ReactComponent />));
  });

  it('renders a React.Component from a Marionette.View', t => {
    let element = null;

    const ReactComponent = ReactBridge.componentFromView(Collection, viewOptions);
    ReactDOM.render(<ReactComponent ref={el => (element = el)}/>, document.getElementById('app'));

    const listItems = ReactDOM.findDOMNode(element).children;

    t.is(listItems.length, 2);
    t.is(listItems[0].textContent, 'Bacon - Should buy ASAP!');
    t.is(listItems[1].textContent, 'Vegetables - Forget it..');
  });

  it('wraps the the React.Component with an element with default tag according to Marionette', t => {
    let element = null;

    const ReactComponent = ReactBridge.componentFromView(Collection, viewOptions);
    ReactDOM.render(<ReactComponent ref={el => (element = el)}/>, document.getElementById('app'));

    const tagName = ReactDOM.findDOMNode(element).tagName;
    t.is(tagName, 'UL');
  });

  it('wraps the the React.Component with an element without className', t => {
    let element = null;

    const ReactComponent = ReactBridge.componentFromView(Collection, viewOptions);
    ReactDOM.render(<ReactComponent ref={el => (element = el)}/>, document.getElementById('app'));

    const tagName = ReactDOM.findDOMNode(element).className;
    t.is(tagName, '');
  });

  it('wraps the the React.Component with an element with custom tag', t => {
    let element = null;
    const customViewOptions = _.extend({}, viewOptions);
    customViewOptions.tagName = 'div';

    const ReactComponent = ReactBridge.componentFromView(Collection, customViewOptions);
    ReactDOM.render(<ReactComponent ref={el => (element = el)}/>, document.getElementById('app'));

    const tagName = ReactDOM.findDOMNode(element).tagName;
    t.is(tagName, 'DIV');
  });

  it('wraps the the React.Component with an element with custom className', t => {
    let element = null;
    const customViewOptions = _.extend({}, viewOptions);
    customViewOptions.className = 'myClass';

    const ReactComponent = ReactBridge.componentFromView(Collection, customViewOptions);
    ReactDOM.render(<ReactComponent ref={el => (element = el)}/>, document.getElementById('app'));

    const tagName = ReactDOM.findDOMNode(element).className;
    t.is(tagName, 'myClass');
  });

  it('calls a function of the Marionette View', t => {
    let viewInstance = null;

    const ReactComponent = ReactBridge.componentFromView(Collection, viewOptions);
    ReactDOM.render(<ReactComponent ref={el => (viewInstance = el)} />, document.getElementById('app'));

    const spy = sinon.spy(viewInstance, 'delegate');
    viewInstance.delegate('log', 'this is a test');

    t.true(spy.calledOnce);
    t.true(spy.calledWith('log', 'this is a test'));
  });

  it('throws an error when eventsToActions function exists without defining a dispatch function', t => {
    const spy = sinon.spy(console, 'error');
    const customViewOptions = _.extend({}, viewOptions);
    delete customViewOptions.dispatch;

    const ReactComponent = ReactBridge.componentFromView(Collection, customViewOptions);
    ReactDOM.render(<ReactComponent />, document.getElementById('app'));

    t.true(spy.calledOnce);
    t.true(spy.calledWith('The `dispatch` function is not defined.'));
  });

  it('dispatches an action when the view triggers an event', t => {
    const mockStore = initStore();
    const store = mockStore({});
    const customViewOptions = _.extend({}, viewOptions);
    customViewOptions.dispatch = store.dispatch;

    const ReactComponent = ReactBridge.componentFromView(Collection, customViewOptions);
    ReactDOM.render(<ReactComponent />, document.getElementById('app'));

    t.true(store.hasActions({type: 'INIT'}));
  });


  it('destroys the Marionette.View rendered inside the React.Component', t => {
    const ReactComponent = ReactBridge.componentFromView(Collection, viewOptions);
    const reactInstance = ReactDOM.render(<ReactComponent/>, document.getElementById('app'));

    reactInstance.componentWillUnmount();

    const marionetteViewDestroyed = reactInstance._marionetteView.isDestroyed;
    t.true(marionetteViewDestroyed)
  });
});
