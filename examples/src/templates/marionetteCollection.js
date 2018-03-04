import _ from 'underscore';
import Marionette from 'backbone.marionette';

const Item = Marionette.LayoutView.extend({
  tagName: 'li',
  template: _.template('<%- name %> - <%- desc %>')
});

const List = Marionette.CollectionView.extend({
  tagName: 'ul',
  childView: Item,
  log: (...args) => {console.log(...args)}
});

export default List;
