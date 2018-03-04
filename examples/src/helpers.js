import Backbone from 'backbone';
import {createStore} from 'redux';

const EmptyCollection = new Backbone.Collection([]);

const MyCollection = new Backbone.Collection([
  {name: 'Bacon', desc: 'Should buy ASAP!'},
  {name: 'Vegetables', desc: 'Forget it..'}
]);

const MyModel = new Backbone.Model({
  title: '',
  buttonText: 'Click Me',
  placeholder: 'Please insert your text..'
});

const reactConfig = {
  model: MyModel,
  collection: EmptyCollection,
  observe: {
    model: ['change', 'myEvent']
  }
};

const counter = (state = 0, action) => {
  switch (action.type) {
    case 'INIT':
      return 2;
    default:
      return state;
  }
}

const store = createStore(counter);

const viewOptions = {
  collection: MyCollection,
  dispatch: store.dispatch,
  eventsToActions : {
    'render': () => ({type: 'INIT'})
  }
};

export {
  EmptyCollection,
  MyCollection,
  MyModel,
  reactConfig,
  viewOptions,
  store
}
