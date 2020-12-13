import * as y from 'yup';
import axios from 'axios';
import onChange from 'on-change';
import Viwer from './view';
import parseLink from './rss.parser.js';

const channels = [];

const watchedState = onChange(channels, (path, value) => {
  const newChannel = value[value.length - 1];
  const allorigins = 'https://api.allorigins.win/get?url=';
  axios.get(`${allorigins}${encodeURIComponent(newChannel)}`)
    .then((response) => parseLink(response.data))
    .then((parsedUrl) => {
      console.log(newChannel)
      const newView = new Viwer(null, newChannel, parsedUrl);
      newView.renderNewChannel();
    })
    .then(() => {
      const newView = new Viwer();
      newView.afterRenderChannel();
    })
    .catch((err) => {
      if (err.name === 'TypeError') {
        const urlErr = new Viwer('notRss');
        urlErr.renderErrors();
        console.log(err);
        channels.splice(-1, 1);
      }
      if (err.name === 'Network error') {
        const urlErr = new Viwer('network');
        urlErr.renderErrors();
      }
    });
});

export default class Model {
  constructor(inputData) {
    this.link = inputData;
  }

  isValidLink() {
    y
      .string()
      .url('invalidUrl')
      .required('')
      .notOneOf(channels, 'hasUrlYet')
      .validate(this.link)
      .then((value) => {
        watchedState.push(value);
      })
      .catch((err) => {
        const error = new Viwer(err.message);
        error.renderErrors();
      });
  }
}
