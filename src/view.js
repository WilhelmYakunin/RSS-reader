import axios from 'axios';
import I18next from './locales/i18nEngine';
import Controller from './controller';
import parseLink from './rss.parser.js';

const siteMask = {
  siteHeader: document.querySelector('[role="head-header"]'),
  siteDescription: document.querySelector('[role="site-descritpiton"]'),
  input: document.querySelector('[role="rss-input-link"]'),
  inputButton: document.querySelector('[role="input-button"]'),
  inputExmaple: document.querySelector('[role="input-example"]'),
  footerText: document.querySelector('[role="footer-text"]'),
};

const addedFeeds = {};

export default class Viewer {
  constructor(err, newChannel, parsedUrl) {
    this.siteMask = siteMask;
    this.form = document.querySelector('[role="rss-form"]');
    this.err = err;
    this.channel = newChannel;
    this.feed = parsedUrl;
  }

  internalize() {
    const pageContent = new I18next(this.siteMask);
    pageContent.createMaskContent();
  }

  handleInput() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      formData.get('url');
      const urlData = Object.fromEntries(formData).url;
      const controller = new Controller(urlData);
      controller.transmitData();
    });
  }

  renderNewChannel() {
    this.siteMask.inputButton.disabled = true;
    const rssInput = this.form.querySelector('input');
    rssInput.textContent = '';
    const feedbackElement = document.querySelector('.feedback');
    const feedbackContent = new I18next(feedbackElement, 'loadingChannel');
    feedbackContent.renderFeedbackMessage();
    feedbackElement.classList.add('text-success');
    const feeds = document.querySelector('[role="feeds"]');
    if (feeds.children.length === 0) {
      const feedsUl = document.createElement('ul');
      const feedsHeader = document.createElement('h2');
      feedsUl.appendChild(feedsHeader);
      const feedsTitle = new I18next(feedsHeader, 'feeds');
      feedsTitle.renderFeedbackMessage();
      feedsUl.setAttribute('role', 'feeds-desk');
      feedsUl.classList.add('list-group', 'mb-5');
      feeds.appendChild(feedsUl);
      const posts = document.querySelector('[role="posts"]');
      const postsUl = document.createElement('ul');
      const postsHeader = document.createElement('h2');
      postsUl.appendChild(postsHeader);
      const postsTitle = new I18next(postsHeader, 'posts');
      postsTitle.renderFeedbackMessage();
      postsUl.setAttribute('role', 'posts-desk');
      posts.appendChild(postsUl);
    }
    const feedsUl = document.querySelector('[role="feeds-desk"]');
    const newChannel = document.createElement('li');
    newChannel.classList.add('list-group-item');
    const channelHeader = document.createElement('h3');
    channelHeader.textContent = this.feed.title;
    addedFeeds[this.channel] = [];
    const channelDescription = document.createElement('p');
    channelDescription.textContent = this.feed.description;
    newChannel.appendChild(channelHeader);
    newChannel.appendChild(channelDescription);
    feedsUl.appendChild(newChannel);
    const postsUl = document.querySelector('[role="posts-desk"]');
    postsUl.classList.add('list-group');
    this.feed.postsList.map((post) => {
      const postLi = document.createElement('li');
      postLi.classList.add('list-group-item', 'd-flex',
        'justify-content-between', 'align-items-start');
      const link = document.createElement('a');
      link.classList.add('font-weight-bold');
      link.href = `${post.postLink}`;
      addedFeeds[this.channel].push(post.postLink);
      link.textContent = post.postTitle;
      postLi.appendChild(link);
      postsUl.appendChild(postLi);
    });
  }

  postsUpdate() {
    const newPosts = [];
    Object.entries(addedFeeds).map(([url, posts]) => {
      const allorigins = 'https://api.allorigins.win/get?url=';
      axios.get(`${allorigins}${encodeURIComponent(url)}`)
        .then((response) => parseLink(response.data))
        .then((data) => (data.postsList))
        .then((list) => list.map((post) => {
          if (!posts.includes(post.postLink)) {
            newPosts.push(post.postLink);
          }
        }));
    });
    if (newPosts.length !== 0) {
      this.renderNewChannel();
    }
    setTimeout(this.postsUpdate(), 5000);
  }

  afterRenderChannel() {
    this.siteMask.inputButton.disabled = false;
    const feedbackElement = document.querySelector('.feedback');
    const feedbackContent = new I18next(feedbackElement, 'loaded');
    feedbackContent.renderFeedbackMessage();
    feedbackElement.classList.remove('text-danger');
    feedbackElement.classList.add('text-success');
  }

  renderErrors() {
    const rssInput = this.form.querySelector('input');
    const feedbackElement = document.querySelector('.feedback');
    const feedbackContent = new I18next(feedbackElement, this.err);
    rssInput.classList.add('is-invalid');
    feedbackContent.renderFeedbackMessage();
    feedbackElement.classList.add('text-danger');
    rssInput.addEventListener('input', () => {
      rssInput.classList.remove('is-invalid');
      feedbackElement.textContent = '';
    });
  }
}
