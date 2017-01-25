import _ from 'underscore';
import Marionette from 'backbone.marionette';
import React from 'react';
import ReactDOM from 'react-dom';

const defaultModelEvents = 'change';
const defaultCollectionEvents = 'add remove reset';

function defaultGetProps({model, collection, state= {}} = {}) {
  if (model) {
    _.extend(state, model.toJSON());
  }

  if (collection) {
    _.extend(state, {items: collection.toJSON()});
  }

  return state;
}

function extractNewState(options = {}) {
  const {getProps, props} = options;
  return _.extend(getProps ? getProps(options) : defaultGetProps(options), props);
}

function viewCallback(...args) {
  this.options.dispatch(...args);
}

// Override the default remove function in order not to erase the
// Marionette.View from the DOM when updating the the React Component

function unobtrusiveRemove() {
  this.$el.off();
  this.stopListening();
  return this;
}

const ReactBridge = {

  /**
   * function to wrap a React Component in a Marionette View
   *
   * @param {React Component} Component, the react component which will be rendered inside the Marionette View
   * @param {Object} options, configuration for the React Component
   */

  viewFromComponent(Component, options = {}) {
    const ReactMarionetteView = Marionette.View.extend({

      onShow() {
        if (this._reactInternalInstance) {
          return false;
        }

        // Create and render a container component wrapping the given component
        class Container extends React.Component {

          constructor() {
            super();
            this.state = extractNewState(options);
          }

          componentDidMount() {
            _.defaults(options, {observe: {}});

            this.initListener(options.model, options.observe.model || defaultModelEvents);
            this.initListener(options.collections, options.observe.collection || defaultCollectionEvents);
          }

          componentWillUnmount() {
            this.destroyListener(options.model);
            this.destroyListener(options.collection);
          }

          initListener(entity, events) {
            if (!entity) {
              return;
            }

            if (events instanceof Array) {
              events = events.join(' ');
            }

            entity.on(events, this.updateComponentState.bind(this));
          }

          updateComponentState() {
            const newState = extractNewState(options);
            this.setState(newState);
          }

          destroyListener(entity) {
            if (!entity) {
              return;
            }

            entity.off();
          }

          render() {
            if (React.isValidElement(Component)) {
              return React.cloneElement(Component, this.state);
            }

            return <Component {...this.state} />;
          }
        }

        this._reactInternalInstance = ReactDOM.render(<Container/>, this.el);
      },

      onDestroy() {
        this._reactInternalInstance._isMounted = false;
        ReactDOM.unmountComponentAtNode(this.el);
      },

      onClose() {
        this._reactInternalInstance._isMounted = false;
        ReactDOM.unmountComponentAtNode(this.el);
      }
    });

    return new ReactMarionetteView(options);
  },


  /**
   * function to wrap a Marionette View in a React Component
   *
   * @param {Marionette View} MarionetteView, the view which will be wrapped inside the React Component
   * @param {Object} options, configuration for the Marionette View
   */

  componentFromView(MarionetteView, options) {
    return React.createClass({

      componentDidMount() {
        const parentElem = ReactDOM.findDOMNode(this._reactInternalInstance._instance);

        if (MarionetteView instanceof Marionette.View) {
          MarionetteView.setElement(parentElem);
          this._marionetteView = MarionetteView;
          _.extend(this._marionetteView.options, options);
        } else {
          this._marionetteView = new MarionetteView(_.extend({el: parentElem}, options));
        }

        this._marionetteView.remove = unobtrusiveRemove;
        this.mapEventsToActions(options);
        this._marionetteView.render();
      },

      shouldComponentUpdate() {
        return false;
      },

      componentWillUnmount() {
        // Unregister listeners for the user defined marionette events
        _.map(options.eventsToActions, (action, event) => {
          this._marionetteView.stopListening(this._marionetteView, event);
        });

        this._marionetteView.destroy && this._marionetteView.destroy();
        this._marionetteView.close && this._marionetteView.close();
      },

      createTemplate(view, opts) {
        let tagName = view instanceof Marionette.View
          ? view.tagName
          : view.prototype.tagName;

        let className = view instanceof Marionette.View
          ? view.className
          : view.prototype.className;

        if (opts.tagName) {
          tagName = opts.tagName;
        }

        if (opts.className) {
          className = opts.className;
        }

        return React.createElement(tagName, {className}, null);
      },

      delegate(methodName, ...args) {
        // Check if method exists
        if (!this._marionetteView[methodName]) {
          return;
        }

        // Pass the arguments to marionette method
        return this._marionetteView[methodName](...args);
      },

      mapEventsToActions(opts) {
        if (!opts.eventsToActions || _.isEmpty(opts.eventsToActions)) {
          return;
        }

        if (!opts.dispatch || !opts.dispatch instanceof Function) {
          console.error('The `dispatch` function is not defined.');
          return;
        }

        _.map(opts.eventsToActions, (action, event) => {
          this._marionetteView.listenTo(this._marionetteView, event, (...args) => {
            const myAction = typeof action === 'function' ? action(...args) : action;
            viewCallback.apply(this._marionetteView, [myAction, ...args]);
          });
        });

        return this._marionetteView;
      },

      render() {
        return this.createTemplate(MarionetteView, options);
      }
    });
  }
};

export default ReactBridge;
