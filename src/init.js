import 'bootstrap/dist/css/bootstrap.min.css';
import _ from 'lodash';
import i18next from 'i18next';
import * as y from 'yup';
import onChange from 'on-change';
import parseLink from './rss.parser.js';

export default async () => {
  i18next.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru: {
        translation: {
          duplication: 'Этот канал новостей уже был добавлен ранее',
          url: 'Некорректный адрес RSS канала',
        },
      },
    },
  });

  const state = {
    form: {
      fields: {
        url: '',
      },
    },
    listedChannels: [],
    posts: [],
    errors: null,
  };

  const form = document.querySelector('.rss-form');
  const rssInput = form.querySelector('input');
  const feedbackElement = document.querySelector('.feedback');

  const renderErrors = (error) => {
    rssInput.classList.add('is-invalid');
    feedbackElement.textContent = i18next.t(error);
    feedbackElement.classList.add('text-danger');
  };

  const createFeedLi = (title, description) => {
    const li = document.createElement('li');
    const headerTitle = document.createElement('h3');
    headerTitle.textContent = title;
    li.appendChild(headerTitle);
    const decriptionParagrah = document.createElement('p');
    decriptionParagrah.textContent = description;
    li.classList.add('list-group-item');
    li.appendChild(decriptionParagrah);
    return li;
  };

  const createPostLi = (postData) => {
    const { itemTitle, itemLink } = postData;
    const li = document.createElement('li');
    const postLink = document.createElement('a');
    postLink.href = itemLink;
    postLink.textContent = itemTitle;
    li.classList.add('list-group-item');
    li.appendChild(postLink);
    return li;
  };

  const render = (link, parsedURL, previousChannels) => {
    if (previousChannels.length === 0) {
      const feeds = document.querySelector('.feeds');
      const feedsHeader = document.createElement('h2');
      feedsHeader.textContent = 'Feeds';
      feeds.appendChild(feedsHeader);
      const feedsUl = document.createElement('ul');
      feedsUl.id = 'feeds';
      feedsUl.classList.add('list-group');
      feedsUl.classList.add('mb-5');
      feeds.appendChild(feedsUl);
      const posts = document.querySelector('.posts');
      const postsHeader = document.createElement('h2');
      postsHeader.textContent = 'Posts';
      posts.appendChild(postsHeader);
      const postsUl = document.createElement('ul');
      postsUl.id = 'posts';
      postsUl.classList.add('list-group');
      posts.appendChild(postsUl);
    }
    const { title, description, itemsList } = parsedURL;
    state.posts.push({ link, itemsList, lastUpdate: new Date() });
    const feedLi = createFeedLi(title, description);
    const feedsUl = document.getElementById('feeds');
    feedsUl.appendChild(feedLi);
    const postsUl = document.getElementById('posts');
    itemsList.map((postData) => postsUl.appendChild(createPostLi(postData)));
  };

  const watchedState = onChange(state, (path, channels, previousValue) => {
    const newChannel = channels[channels.length - 1];
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(newChannel)}`)
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error('Network response was not ok.');
      })
      .then((data) => parseLink(data))
      .then((parsedUrl) => render(newChannel, parsedUrl, previousValue))
      .catch(() => {
        state.errors = 'url';
        renderErrors(state.errors);
      });
  });

  const watchChannelChanges = () => {
    const hasNewPosts = () => state.posts.map((feed) => fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.link)}`)
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error('Network response was not ok.');
      })
      .then((data) => parseLink(data))
      .then((parsedURL) => parsedURL.itemsList.filter((post) => post.pubDate > feed.lastUpdate))
      .then((newPosts) => {
        if (newPosts.length > 0) {
          newPosts.map((post) => feed.itemsList.push(post));
          feed.lastUpdate = new Date();
        }
      })
      .catch((e) => renderErrors(e)));
    hasNewPosts();
    setTimeout(watchChannelChanges, 5000);
  };

  watchChannelChanges();

  const yup = !y.object ? y.default : y;

  const schema = yup.object().shape({
    url: yup.string().url()
      .test('is already listed?', 'duplication',
        (link) => {
          if (!_.includes(state.listedChannels, link)) {
            rssInput.value = '';
            watchedState.listedChannels.push(link);
            return true;
          }
          return false;
        }),
  });

  rssInput.addEventListener('input', () => {
    rssInput.classList.remove('is-invalid');
    feedbackElement.textContent = '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.get('url');
    const urlData = Object.fromEntries(formData);
    schema.validate(urlData).catch((err) => {
      renderErrors(err);
    });
  });
};
