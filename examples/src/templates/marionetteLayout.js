import _ from 'underscore';
import Marionette from 'backbone.marionette';

const View = Marionette.LayoutView.extend({
  template: _.template('<div id=\'component\'></div>'),
  regions: {
    component: '#component'
  }
});

export default View;
