import i18next from 'i18next';
import * as y from 'yup';
import onChange from 'on-change';
import i18n from './locales/i18nEngine';
import { parseLink, getImg } from './parse.js';
import { renderNewChannel, renderPost, renderErrors } from './view.js';

export default () => i18n().then(() => {
  const siteHeader = document.querySelector('[role="head-header"]');
  const siteDescription = document.querySelector('[role="site-descritpiton"]');
  const feedsHeader = document.querySelector('[role="feeds-header"]');
  const languageButton = document.querySelector('[role="language-button"]');
  const input = document.querySelector('[role="rss-input-link"]');
  const inputButton = document.querySelector('[role="input-button"]');
  const inputExmaple = document.querySelector('[role="input-example"]');
  const footerText = document.querySelector('[role="footer-text"]');
  const panelClose = document.querySelector('[role="channels-visiability-toggler"]');
  const feedsContainer = document.querySelector('[role="feeds"]');
  const posts = document.querySelector('[role="posts"]');
  const form = document.querySelector('[role="rss-form"]');
  const feedbackDiv = document.querySelector('[role="feedback"]');
  const feedButtons = posts.getElementsByTagName('button');
  const modalLinkButton = document.querySelector('[role="post-link"]');
  const modalCloseButton = document.querySelector('[role="close-modal"]');

  const state = {
    channels: {
      links: [],
    },
    process: null,
    panel: 'open',
  };

  const elemArr = {
    siteHeader,
    siteDescription,
    feedsHeader,
    languageButton,
    input,
    inputButton,
    inputExmaple,
    footerText,
    panelClose,
    modalLinkButton,
    modalCloseButton,
  };

  function updateElem(elemName, elem) {
    const transletEleme = elem;
    transletEleme.textContent = i18next.t(elemName);
  }

  function updatePageContent() {
    Object.entries(elemArr).map(([propertyName, elem]) => updateElem(propertyName, elem));
    feedbackDiv.textContent = i18next.t(state.process);
    Array.from(feedButtons).map((feedButton) => updateElem('preview', feedButton));
    if (feedsContainer.children.length === 0) {
      feedsContainer.textContent = i18next.t('feeds');
    }
  }

  const languages = ['en', 'de', 'ru'];

  languages.map((lang) => {
    const langButton = document.querySelector(`[role="${lang}"]`);
    return langButton.addEventListener('click', () => {
      i18next.changeLanguage(lang);
      updatePageContent();
    });
  });

  updatePageContent();

  function watchChannel(feedsList, ulId) {
    setTimeout(watchChannel, 5000, feedsList, ulId);
    const comparedPosts = feedsList.map((comparedPost) => comparedPost.postTitle);
    parseLink(ulId).then((currentRssData) => {
      const { postsList } = currentRssData;
      const newPosts = postsList.filter((post) => !comparedPosts.includes(post.postTitle));
      return newPosts;
    }).then((newPosts) => {
      if (newPosts.length !== 0) {
        const parentUl = document.getElementById(ulId);
        newPosts.map((post) => {
          const newPostLi = renderPost(post);
          return parentUl.appendChild(newPostLi);
        });
      }
    });
  }
  const changeFeedsVisability = (indicator) => {
    const tranlete = i18next.t(indicator);
    panelClose.textContent = tranlete;
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'panel':
        feedsContainer.classList.toggle('invisible');
        if (value === 'open') {
          return changeFeedsVisability('panelClose');
        } return changeFeedsVisability('panelOpen');
      default:
        inputButton.disabled = true;
        state.process = 'loading';
        feedbackDiv.textContent = i18next.t(state.process);
        feedbackDiv.classList.remove('text-danger');
        feedbackDiv.classList.add('text-success');
        parseLink(value[value.length - 1]).then((rssData) => {
          const { title, description, postsList } = rssData;
          const promises = Array.from(postsList).map((post) => {
            const {
              pubDate, postTitle, postDescription, postLink,
            } = post;
            return getImg(postLink).then((imgLink) => ({
              pubDate, postTitle, postDescription, postLink, imgLink,
            }));
          });
          const newPostst = document.createElement('ul');
          const postsListTitle = document.createElement('h3');
          newPostst.appendChild(postsListTitle);
          postsListTitle.classList.add('text-secondary', 'p-1');
          const poststDescription = document.createElement('p');
          poststDescription.classList.add('text-muted', 'p-1');
          newPostst.appendChild(poststDescription);
          newPostst.setAttribute('id', `${value[value.length - 1]}`);
          const ulId = newPostst.id;
          posts.appendChild(newPostst);
          Promise.allSettled(promises).then((results) => {
            results.map((post) => {
              const postInfo = post.value;
              const postLi = renderPost(postInfo);
              return newPostst.appendChild(postLi);
            });
            postsListTitle.textContent = title;
            poststDescription.textContent = description;
            renderNewChannel(feedsContainer, title, description);
            state.process = 'loaded';
            feedbackDiv.textContent = i18next.t(state.process);
            feedbackDiv.classList.add('text-success');
            input.value = null;
            inputButton.disabled = false;
            watchChannel(postsList, ulId);
          });
        })
          .catch((err) => {
            inputButton.disabled = false;
            if (err.name === 'TypeError') {
              const urlErr = 'notRss';
              state.process = urlErr;
              renderErrors(feedbackDiv, urlErr);
              state.channels.links.splice(-1, 1);
            }
            if (err.name === 'Error') {
              const urlErr = 'network';
              state.process = urlErr;
              renderErrors(feedbackDiv, urlErr);
              state.channels.links.splice(-1, 1);
            }
          });
    }
    return state;
  });

  panelClose.addEventListener('click', () => {
    if (state.panel === 'open') {
      watchedState.panel = 'close';
      return;
    } watchedState.panel = 'open';
  });

  input.addEventListener('input', () => {
    state.process = null;
    feedbackDiv.textContent = null;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.get('url');
    const urlData = Object.fromEntries(formData).url;
    y
      .string()
      .url('invalidUrl')
      .required('')
      .notOneOf(state.channels.links, 'hasUrlYet')
      .validate(urlData)
      .then((value) => {
        watchedState.channels.links.push(value);
      })
      .catch((err) => {
        inputButton.disabled = false;
        state.error = err.message;
        renderErrors(feedbackDiv, err.message);
      });
  });
});
