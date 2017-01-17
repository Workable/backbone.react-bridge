import _ from 'underscore';
import Backbone from 'backbone';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import ReactBridge from '../src';

import {expect} from 'chai';

import Layout from '../examples/templates/marionetteLayout';
import Component from '../examples/templates/reactComponent';
import {reactConfig, MyCollection} from '../examples/helpers';


describe('BackboneReactBridge', () => {

  describe('viewFromComponent', () => {

    beforeEach(function () {
      document.body.innerHTML = '<div id="app"></div>';
    });

    it('renders the Marionette.View created from the React.Component Class', function() {
      const LayoutView = new Layout({el: '#app'});
      const MarionetteView = ReactBridge.viewFromComponent(Component, reactConfig);
      LayoutView.render().getRegion('component').show(MarionetteView);

      expect(_.isUndefined(LayoutView.component.currentView)).to.be.false;
    });

    it('renders the Marionette.View created from the React.Component', function() {
      const LayoutView = new Layout({el: '#app'});
      const MarionetteView = ReactBridge.viewFromComponent(<Component />, reactConfig);
      LayoutView.render().getRegion('component').show(MarionetteView);

      expect(_.isUndefined(LayoutView.component.currentView)).to.be.false;
    });

    it('Marionette.View has a Backbone Model', function () {
      const MarionetteView = ReactBridge.viewFromComponent(Component, reactConfig);
      expect(MarionetteView.model instanceof Backbone.Model).to.be.true;
    });

    it('Marionette.View has a Backbone Collection', function () {
      const MarionetteView = ReactBridge.viewFromComponent(Component, reactConfig);
      expect(MarionetteView.collection instanceof Backbone.Collection).to.be.true;
    });

    it('the created React.Component has a default getProps function', function () {
      const LayoutView = new Layout({el: '#app'});
      const MarionetteView = ReactBridge.viewFromComponent(Component, reactConfig);
      LayoutView.render().getRegion('component').show(MarionetteView);

      const model = reactConfig.model.toJSON();
      const collection = reactConfig.collection.toJSON();
      const reactState = MarionetteView._reactInternalInstance.state;

      _.each(_.keys(model), (key) => {
        expect(reactState[key]).to.equal(model[key]);
      });

      expect(reactState.items).to.deep.equal(collection);
    });

    it('the default getProps function of the React.Component is overridable', function () {
      const customReactConfig = _.extend({}, reactConfig);
      const collection = MyCollection.toJSON();

      customReactConfig.getProps = () => (_.extend({}, {items: collection}));

      const LayoutView = new Layout({el: '#app'});
      const MarionetteView = ReactBridge.viewFromComponent(Component, customReactConfig);
      LayoutView.render().getRegion('component').show(MarionetteView);

      const reactState = MarionetteView._reactInternalInstance.state;
      expect(reactState.items).to.deep.equal(collection);
    });


    it('the React.Component may has props which override the default Marionette.View Model', function () {
      const customReactConfig = _.extend({}, reactConfig);
      customReactConfig.props = {
        title : 'I am a React Component inside a Marionette View'
      };

      const LayoutView = new Layout({el: '#app'});
      const MarionetteView = ReactBridge.viewFromComponent(Component, customReactConfig);
      LayoutView.render().getRegion('component').show(MarionetteView);

      const reactState = MarionetteView._reactInternalInstance.state;
      expect(reactState.title).to.be.equal('I am a React Component inside a Marionette View');
    });

    it('renders properly the React.Component', function() {
      const LayoutView = new Layout({el: '#app'});
      const MarionetteView = ReactBridge.viewFromComponent(Component, reactConfig);

      const renderedView = LayoutView.render().getRegion('component').show(MarionetteView);
      const reactInstance = renderedView.currentView._reactInternalInstance;

      const buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(reactInstance, 'button');
      const textAreas = ReactTestUtils.scryRenderedDOMComponentsWithTag(reactInstance, 'textarea');

      expect(LayoutView).to.be.ok;
      expect(buttons.length).to.equal(1);
      expect(buttons[0].textContent).to.equal('Click Me');
      expect(textAreas.length).to.equal(1);
      expect(textAreas[0].placeholder).to.equal('Please insert your text..');
    });

    it('React.Component responds to Backbone.Model changes', function() {
      const LayoutView = new Layout({el: '#app'});
      const MarionetteView = ReactBridge.viewFromComponent(Component, reactConfig);

      const renderedView = LayoutView.render().getRegion('component').show(MarionetteView);
      const reactInstance = renderedView.currentView._reactInternalInstance;

      const buttons = ReactTestUtils.scryRenderedDOMComponentsWithTag(reactInstance, 'button');

      reactConfig.model.set({buttonText: 'Oh hooray!'});

      expect(buttons.length).to.equal(1);
      expect(buttons[0].textContent).to.equal('Oh hooray!');
    });

    it('React.Component responds to Backbone.Model changes triggered by custom events', function() {
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

      expect(buttons.length).to.equal(1);
      expect(buttons[0].textContent).to.equal('Oh hooray!');
    });

    it('destroys the Marionette.View rendered inside the React.Component', function() {
      const LayoutView = new Layout({el: '#app'});
      const MarionetteView = ReactBridge.viewFromComponent(Component, reactConfig);

      const renderedView = LayoutView.render().getRegion('component').show(MarionetteView);
      const reactInstance = renderedView.currentView._reactInternalInstance;

      MarionetteView.destroy();

      const reactInstanceDestroyed = reactInstance._isMounted;
      expect(reactInstanceDestroyed).to.be.false;

      const marionetteViewDestroyed = MarionetteView.isDestroyed;
      expect(marionetteViewDestroyed).to.be.true;
    });
  });
});
