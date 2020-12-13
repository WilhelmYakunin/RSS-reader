import 'bootstrap/dist/css/bootstrap.min.css';
import _ from 'lodash';
import Viewer from './view.js';

export default () => {
  const view = new Viewer();
  view.internalize();
  view.handleInput();
  view.postsUpdate();
};
