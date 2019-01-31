# Backbone.ReactBridge

[![build status](https://img.shields.io/travis/Workable/backbone.react-bridge.svg?style=flat-square)](https://travis-ci.org/Workable/backbone.react-bridge)
[![npm version](https://img.shields.io/npm/v/backbone.react-bridge.svg?style=flat-square)](https://www.npmjs.com/package/backbone.react-bridge)
[![npm version](https://img.shields.io/npm/dm/backbone.react-bridge.svg?style=flat-square)](https://www.npmjs.com/package/backbone.react-bridge)

A toolkit for transforming Backbone views to React components and vice versa. :rocket:

## Installation

```
$ npm install --save-dev backbone.react-bridge
```

## Usage

### React Component :arrow_right: Backbone View

  > This function allows you to get a Backbone.View from a React component. It accepts as input a React Component instance or class along with some extra options.

  Full blown example with available options:

  ```js

  const fooView = ReactBridge.viewFromComponent(FooComponent, {

      // Provide a model for the Backbone.View

      model: fooModel,

      // Provide a collection for the Backbone.View

      collection: fooCollection,

      // By default the view gets re-rendered
      // on model "change" and collection "add remove reset" events
      // But you can override this using the `observe` property

      observe: {
        model: 'change',
        collection: 'reset add remove'
      },

      // Define custom properties which will be passed to the React Component.
      // In case that the properties overlap with the model attributes,
      // the values of the model will be ovewritten.

      props: {
        title: 'Foo Title',
        subtitle: 'Foo Subtitle'
      },

      // Customize the form of the properties which will be passed to the
      // React Component. In case that 'getProps' is undefined, a composition
      // of the model's attributes, the collection's values and the custom
      // properties will be returned to the React Component.
      // `getProps` receives an object with `model` and `collection` as properties.

      getProps({collection}) {
        return {
          titles: collection.map((m) => {title: m.get('title').toUpperCase()})
        }
      }

  });

  fooView.render();

  // Or if using Marionette.js

  region.show(fooView);

  ```

  None of the options described above are required in order to use the viewFromComponent function.

##

### **Backbone View :arrow_right: React Component**

  > This function allows you to get a React component from a Backbone view. It accepts either a Backbone.View instance or class along with some extra options.

  Full blown example with available options:

  ```js

  const Bar = ReactBridge.componentFromView(BarView, {

      // Override the default tagName of the element which will wrap
      // the React Component. If not provided, the default tagName
      // according to Backbone will be used

      tagName: 'ul',

      // Add a custom class on the element which will wrap the React Component

      className: 'barClass',

      // Using Redux? We got you covered!
      // You can define actions that will be dispatched when
      // specific events are triggered from the Backbone View.
      // This feature requires a reference of the store's dispatch function

      eventsToActions : {
        // Dispatch a "BAR_SUBMIT" action when a "submit" event is triggered by the view
        'submit': () => ({type: 'BAR_SUBMIT'})
      }

      // A reference to the Redux store's dispatch function. This function is
      // used to dispatch the actions registered via the eventToActions option

      dispatch: store.dispatch

  });

  ReactDOM.render(<Bar />, document.querySelector('#bar'));

  ```

  None of the options described above are required in order to use the componentFromView function.


### Examples

```
$ npm install
$ npm start
```
Enjoy! :blush:


### Build
```
$ npm run build
```


### Test & Coverage
```
$ npm run coverage
```
