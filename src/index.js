import Marionette from 'backbone.marionette';
import React from 'react';
import ReactDOM from 'react-dom';

const defaultModelEvents = 'change';
const defaultCollectionEvents = 'add remove reset';

function defaultGetProps({model, collection, state = {}} = {}) {
  if (model) {
    Object.assign(state, model.toJSON());
  }

  if (collection) {
    Object.assign(state, {items: collection.toJSON()});
  }

  return state;
}

function extractNewState(options = {}) {
  const {
    getProps = defaultGetProps,
    props
  } = options;

  const newState = {
    ...getProps(options),
    ...props
  };

  return newState;
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

      initialize() {

        // +-----+--------------------+
        // | Mn  | Lifecycle Events   |
        // +-----+--------------------+
        // | v1  | ['show close']     |
        // +-----+--------------------+
        // | v2  | ['show destroy']   |
        // +-----+--------------------+
        // | v3  | ['render destroy'] |
        // +-----+--------------------+

        this.listenTo(this, 'show render', this._onShowRender);
        this.listenTo(this, 'close destroy', this._onCloseDestroy);
      },

      template() {},

      _onShowRender() {
        if (this._reactInternalInstance) {
          return false;
        }

        // Create and render a container component wrapping the given component
        class Container extends React.Component {

          constructor() {
            super();
            this.state = extractNewState(options);
            this.updateComponentState = this.updateComponentState.bind(this);
          }

          componentDidMount() {
            const {
              model,
              collections,
              observe = {}
            } = options;

            this.initListener(model, observe.model || defaultModelEvents);
            this.initListener(collections, observe.collection || defaultCollectionEvents);
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

            entity.on(events, this.updateComponentState);
          }

          updateComponentState() {
            const newState = extractNewState(options);
            this.setState(newState);
          }

          destroyListener(entity) {
            if (!entity) {
              return;
            }

            entity.off(null, this.updateComponentState);
          }

          render() {
            if (React.isValidElement(Component)) {
              return React.cloneElement(Component, this.state);
            }

            return <Component {...this.state} />;
          }

        }

        ReactDOM.render(<Container ref={el => (this._reactInternalInstance = el)} />, this.el);
      },

      _onCloseDestroy() {
        this.stopListening(this, 'show render close destroy');
        ReactDOM.unmountComponentAtNode(this.el);
        delete this._reactInternalInstance;
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
    return class extends React.Component {

      componentDidMount() {
        const parentElem = this._reactInternalFiber
          ? this._reactInternalFiber.child.stateNode
          : ReactDOM.findDOMNode(this._reactInternalInstance._instance);

        if (MarionetteView instanceof Marionette.View) {
          MarionetteView.setElement(parentElem);
          this._marionetteView = MarionetteView;
          Object.assign(this._marionetteView.options, options);
        } else {
          this._marionetteView = new MarionetteView({
            el: parentElem,
            ...options
          });
        }

        this._marionetteView.remove = unobtrusiveRemove;
        this.mapEventsToActions(options);
        this._marionetteView.render();
      }

      shouldComponentUpdate() {
        return false;
      }

      componentWillUnmount() {
        // Unregister listeners for the user defined marionette events
        Object.keys(options.eventsToActions).forEach(event => {
          this._marionetteView.stopListening(this._marionetteView, event);
        });

        this._marionetteView.destroy && this._marionetteView.destroy();
        this._marionetteView.close && this._marionetteView.close();
      }

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
      }

      delegate(methodName, ...args) {
        // Check if method exists
        if (!this._marionetteView[methodName]) {
          return;
        }

        // Pass the arguments to marionette method
        return this._marionetteView[methodName](...args);
      }

      mapEventsToActions(opts) {
        const {
          eventsToActions,
          dispatch
        } = opts;

        if (!eventsToActions instanceof Object || !Object.keys(eventsToActions).length) {
          return;
        }

        if (!dispatch || !dispatch instanceof Function) {
          console.error('The `dispatch` function is not defined.');
          return;
        }

        Object.keys(eventsToActions).forEach(event => {
          const action = eventsToActions[event];

          this._marionetteView.listenTo(this._marionetteView, event, (...args) => {
            const myAction = typeof action === 'function' ? action(...args) : action;
            viewCallback.apply(this._marionetteView, [myAction, ...args]);
          });
        });

        return this._marionetteView;
      }

      render() {
        return this.createTemplate(MarionetteView, options);
      }

    }
  }
};

export default ReactBridge;
