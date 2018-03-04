'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _backbone = require('backbone.marionette');

var _backbone2 = _interopRequireDefault(_backbone);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultModelEvents = 'change';
var defaultCollectionEvents = 'add remove reset';

function defaultGetProps() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      model = _ref.model,
      collection = _ref.collection,
      _ref$state = _ref.state,
      state = _ref$state === undefined ? {} : _ref$state;

  if (model) {
    Object.assign(state, model.toJSON());
  }

  if (collection) {
    Object.assign(state, { items: collection.toJSON() });
  }

  return state;
}

function extractNewState() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _options$getProps = options.getProps,
      getProps = _options$getProps === undefined ? defaultGetProps : _options$getProps,
      props = options.props;


  var newState = _extends({}, getProps(options), props);

  return newState;
}

function viewCallback() {
  var _options;

  (_options = this.options).dispatch.apply(_options, arguments);
}

// Override the default remove function in order not to erase the
// Marionette.View from the DOM when updating the the React Component

function unobtrusiveRemove() {
  this.$el.off();
  this.stopListening();
  return this;
}

var ReactBridge = {

  /**
   * function to wrap a React Component in a Marionette View
   *
   * @param {React Component} Component, the react component which will be rendered inside the Marionette View
   * @param {Object} options, configuration for the React Component
   */

  viewFromComponent: function viewFromComponent(Component) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var ReactMarionetteView = _backbone2.default.View.extend({
      initialize: function initialize() {

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
      template: function template() {},
      _onShowRender: function _onShowRender() {
        var _this2 = this;

        if (this._reactInternalInstance) {
          return false;
        }

        // Create and render a container component wrapping the given component

        var Container = function (_React$Component) {
          _inherits(Container, _React$Component);

          function Container() {
            _classCallCheck(this, Container);

            var _this = _possibleConstructorReturn(this, (Container.__proto__ || Object.getPrototypeOf(Container)).call(this));

            _this.state = extractNewState(options);
            _this.updateComponentState = _this.updateComponentState.bind(_this);
            return _this;
          }

          _createClass(Container, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
              var model = options.model,
                  collections = options.collections,
                  _options$observe = options.observe,
                  observe = _options$observe === undefined ? {} : _options$observe;


              this.initListener(model, observe.model || defaultModelEvents);
              this.initListener(collections, observe.collection || defaultCollectionEvents);
            }
          }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
              this.destroyListener(options.model);
              this.destroyListener(options.collection);
            }
          }, {
            key: 'initListener',
            value: function initListener(entity, events) {
              if (!entity) {
                return;
              }

              if (events instanceof Array) {
                events = events.join(' ');
              }

              entity.on(events, this.updateComponentState);
            }
          }, {
            key: 'updateComponentState',
            value: function updateComponentState() {
              var newState = extractNewState(options);
              this.setState(newState);
            }
          }, {
            key: 'destroyListener',
            value: function destroyListener(entity) {
              if (!entity) {
                return;
              }

              entity.off();
            }
          }, {
            key: 'render',
            value: function render() {
              if (_react2.default.isValidElement(Component)) {
                return _react2.default.cloneElement(Component, this.state);
              }

              return _react2.default.createElement(Component, this.state);
            }
          }]);

          return Container;
        }(_react2.default.Component);

        _reactDom2.default.render(_react2.default.createElement(Container, { ref: function ref(el) {
            return _this2._reactInternalInstance = el;
          } }), this.el);
      },
      _onCloseDestroy: function _onCloseDestroy() {
        this.stopListening(this, 'show render close destroy');
        _reactDom2.default.unmountComponentAtNode(this.el);
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

  componentFromView: function componentFromView(MarionetteView, options) {
    return function (_React$Component2) {
      _inherits(_class, _React$Component2);

      function _class() {
        _classCallCheck(this, _class);

        return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
      }

      _createClass(_class, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          var parentElem = this._reactInternalFiber ? this._reactInternalFiber.child.stateNode : _reactDom2.default.findDOMNode(this._reactInternalInstance._instance);

          if (MarionetteView instanceof _backbone2.default.View) {
            MarionetteView.setElement(parentElem);
            this._marionetteView = MarionetteView;
            Object.assign(this._marionetteView.options, options);
          } else {
            this._marionetteView = new MarionetteView(_extends({
              el: parentElem
            }, options));
          }

          this._marionetteView.remove = unobtrusiveRemove;
          this.mapEventsToActions(options);
          this._marionetteView.render();
        }
      }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate() {
          return false;
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          var _this4 = this;

          // Unregister listeners for the user defined marionette events
          Object.keys(options.eventsToActions).forEach(function (event) {
            _this4._marionetteView.stopListening(_this4._marionetteView, event);
          });

          this._marionetteView.destroy && this._marionetteView.destroy();
          this._marionetteView.close && this._marionetteView.close();
        }
      }, {
        key: 'createTemplate',
        value: function createTemplate(view, opts) {
          var tagName = view instanceof _backbone2.default.View ? view.tagName : view.prototype.tagName;

          var className = view instanceof _backbone2.default.View ? view.className : view.prototype.className;

          if (opts.tagName) {
            tagName = opts.tagName;
          }

          if (opts.className) {
            className = opts.className;
          }

          return _react2.default.createElement(tagName, { className: className }, null);
        }
      }, {
        key: 'delegate',
        value: function delegate(methodName) {
          var _marionetteView;

          // Check if method exists
          if (!this._marionetteView[methodName]) {
            return;
          }

          // Pass the arguments to marionette method

          for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          return (_marionetteView = this._marionetteView)[methodName].apply(_marionetteView, args);
        }
      }, {
        key: 'mapEventsToActions',
        value: function mapEventsToActions(opts) {
          var _this5 = this;

          var eventsToActions = opts.eventsToActions,
              dispatch = opts.dispatch;


          if (!eventsToActions instanceof Object || !Object.keys(eventsToActions).length) {
            return;
          }

          if (!dispatch || !dispatch instanceof Function) {
            console.error('The `dispatch` function is not defined.');
            return;
          }

          Object.keys(eventsToActions).forEach(function (event) {
            var action = eventsToActions[event];

            _this5._marionetteView.listenTo(_this5._marionetteView, event, function () {
              for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
              }

              var myAction = typeof action === 'function' ? action.apply(undefined, args) : action;
              viewCallback.apply(_this5._marionetteView, [myAction].concat(args));
            });
          });

          return this._marionetteView;
        }
      }, {
        key: 'render',
        value: function render() {
          return this.createTemplate(MarionetteView, options);
        }
      }]);

      return _class;
    }(_react2.default.Component);
  }
};

exports.default = ReactBridge;