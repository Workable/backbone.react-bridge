import _ from 'underscore';
import Backbone from 'backbone';
import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import ReactBridge from '../src';

import { describe } from 'ava-spec';

import Layout from '../examples/templates/marionetteLayout';
import Component from '../examples/templates/reactComponent';
import {reactConfig, MyCollection} from '../examples/helpers';

describe('viewFromComponent', it => {

  it.beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it('renders the Marionette.View created from the React.Component Class', t => {
    const LayoutView = new Layout({el: '#app'});
    const MarionetteView = ReactBridge.viewFromComponent(Component, reactConfig);
    LayoutView.render().getRegion('component').show(MarionetteView);

    t.false(_.isUndefined(LayoutView.component.currentView));
  });

  it('renders the Marionette.View created from the React.Component', t => {
    const LayoutView = new Layout({el: '#app'});
    const MarionetteView = ReactBridge.viewFromComponent(<Component />, reactConfig);
    LayoutView.render().getRegion('component').show(MarionetteView);

    t.false(_.isUndefined(LayoutView.component.currentView));
  });

  it('Marionette.View has a Backbone Model', t => {
    const MarionetteView = ReactBridge.viewFromComponent(Component, reactConfig);
    t.true(MarionetteView.model instanceof Backbone.Model)
  });

  it('Marionette.View has a Backbone Collection', t => {
    const MarionetteView = ReactBridge.viewFromComponent(Component, reactConfig);
    t.true(MarionetteView.collection instanceof Backbone.Collection)
  });

  it('the created React.Component has a default getProps function', t => {
    const LayoutView = new Layout({el: '#app'});
    const MarionetteView = ReactBridge.viewFromComponent(Component, reactConfig);
    LayoutView.render().getRegion('component').show(MarionetteView);

    const model = reactConfig.model.toJSON();
    const collection = reactConfig.collection.toJSON();
    const reactState = MarionetteView._reactInternalInstance.state;

    _.each(_.keys(model), (key) => {
      t.is(reactState[key], model[key]);
    });

    t.deepEqual(reactState.items, collection);
  });

  it('the default getProps function of the React.Component is overridable', t => {
    const customReactConfig = _.extend({}, reactConfig);
    const collection = MyCollection.toJSON();

    customReactConfig.getProps = () => (_.extend({}, {items: collection}));

    const LayoutView = new Layout({el: '#app'});
    const MarionetteView = ReactBridge.viewFromComponent(Component, customReactConfig);
    LayoutView.render().getRegion('component').show(MarionetteView);

    const reactState = MarionetteView._reactInternalInstance.state;
    t.deepEqual(reactState.items, collection);
  });


  it('the React.Component may has props which override the default Marionette.View Model', t => {
    const customReactConfig = _.extend({}, reactConfig);
    customReactConfig.props = {
      title : 'I am a React Component inside a Marionette View'
    };

    const LayoutView = new Layout({el: '#app'});
    const MarionetteView = ReactBridge.viewFromComponent(Component, customReactConfig);
    LayoutView.render().getRegion('component').show(MarionetteView);

    const reactState = MarionetteView._reactInternalInstance.state;
    t.is(reactState.title, 'I am a React Component inside a Marionette View');
  });

  it('renders properly the React.Component', t => {
    const LayoutView = new Layout({el: '#app'});
    const MarionetteView = ReactBridge.viewFromComponent(Component, reactConfig);

    const renderedView = LayoutView.render().getRegion('component').show(MarionetteView);
    const reactInstance = renderedView.currentView._reactInternalInstance;

    const buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(reactInstance, 'button');
    const textAreas = ReactTestUtils.scryRenderedDOMComponentsWithTag(reactInstance, 'textarea');

    require('assert').ok(LayoutView);
    t.is(buttons.length, 1);
    t.is(buttons[0].textContent, 'Click Me');
    t.is(textAreas.length, 1);
    t.is(textAreas[0].placeholder, 'Please insert your text..');
  });

  it('React.Component responds to Backbone.Model changes', t => {
    const LayoutView = new Layout({el: '#app'});
    const MarionetteView = ReactBridge.viewFromComponent(Component, reactConfig);

    const renderedView = LayoutView.render().getRegion('component').show(MarionetteView);
    const reactInstance = renderedView.currentView._reactInternalInstance;

    const buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(reactInstance, 'button');

    reactConfig.model.set({buttonText: 'Oh hooray!'});

    t.is(buttons.length, 1);
    t.is(buttons[0].textContent, 'Oh hooray!');
  });

  it('React.Component responds to Backbone.Model changes triggered by custom events', t => {
    //define a custom model event listener
    reactConfig.observe = {
      model: 'customEvent'
    };

    const LayoutView = new Layout({el: '#app'});
    const MarionetteView = ReactBridge.viewFromComponent(Component, reactConfig);

    const renderedView = LayoutView.render().getRegion('component').show(MarionetteView);
    const reactInstance = renderedView.currentView._reactInternalInstance;
    const buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(reactInstance, 'button');

    reactConfig.model.set({buttonText: 'Oh hooray!'});
    reactConfig.model.trigger('customEvent');

    t.is(buttons.length, 1);
    t.is(buttons[0].textContent, 'Oh hooray!');
  });

  it('destroys the Marionette.View rendered inside the React.Component', t => {
    const LayoutView = new Layout({el: '#app'});
    const MarionetteView = ReactBridge.viewFromComponent(Component, reactConfig);

    const renderedView = LayoutView.render().getRegion('component').show(MarionetteView);
    t.false(typeof renderedView.currentView._reactInternalInstance === 'undefined');

    MarionetteView.destroy();

    t.true(MarionetteView.isDestroyed);
  });
});
