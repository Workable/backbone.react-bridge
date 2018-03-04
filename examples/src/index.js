import React from 'react';
import ReactDOM from 'react-dom';
import ReactBridge from '../../src';

import Collection from './templates/marionetteCollection';
import Layout from './templates/marionetteLayout';
import ReactComponent from './templates/reactComponent';
import {viewOptions, reactConfig, store} from './helpers';


/*----------  Marionette View From React Component  ----------*/

reactConfig.props = {
  title : 'I am a React Component inside a Marionette View'
};

const LayoutView = new Layout({el: '#example1'});
const MarionetteView = ReactBridge.viewFromComponent(ReactComponent, reactConfig);
LayoutView.render().getRegion('component').show(MarionetteView);

setTimeout(() => {
  reactConfig.model.set({
    buttonText: 'Oh hooray!'
  });
}, 3000);


/*----------  React Component from Marionette View  ----------*/

let viewInstance = null;
viewOptions.className = 'myClass';
const Component = ReactBridge.componentFromView(Collection, viewOptions);

const render = () => ReactDOM.render(
  <div>
    <Component ref={el => (viewInstance = el)} />
    Total count: {store.getState()}
  </div>,
  document.getElementById('example2')
);

store.subscribe(render);
render();

viewInstance.delegate('log', 'Delegate functionality is awesome!');
