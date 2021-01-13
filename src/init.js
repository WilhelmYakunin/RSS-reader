import i18next from 'i18next';
import * as y from 'yup';
import onChange from 'on-change';
import i18n from './locales/i18nEngine';
import { parseLink, getImg } from './parse.js';
import { renderNewChannel, renderPost, renderErrors } from './render.js';

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
  const feeds = document.querySelector('[role="feeds"]');
  const posts = document.querySelector('[role="posts"]');
  const form = document.querySelector('[role="rss-form"]');
  const feedbackDiv = document.querySelector('[role="feedback"]');
  const feedButtons = posts.getElementsByTagName('button');
  const { body } = document;

  const state = {
    channels: [],
    process: '',
  };

  const changeLanguage = (language) => {
    i18next.changeLanguage(language);
  };

  function updateElem(elemName, elem) {
    const transletEleme = elem;
    transletEleme.textContent = i18next.t(elemName);
  }

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
  };

  function updatePageContent() {
    Object.entries(elemArr).map(([propertyName, elem]) => updateElem(propertyName, elem));
    feedbackDiv.textContent = `${i18next.t(state.process)}`;

    Array.from(feedButtons).map((feedButton) => updateElem('preview', feedButton));
    if (feeds.children.length === 0) {
      feeds.textContent = `${i18next.t('feeds')}`;
    }
    const modalLinkButton = document.querySelectorAll('[role="post-link"]');
    const modalCloseButton = document.querySelectorAll('[role="close-modal"]');
    updateElem('postLink', modalLinkButton);
    updateElem('close', modalCloseButton);
  }

  updatePageContent();

  panelClose.addEventListener('click', () => {
    feeds.classList.toggle('invisible');
    const channelsSpoilerIndicater = panelClose.textContent;
    const channelsHidden = `${i18next.t('panelOpen')}`;
    const channelsOpen = `${i18next.t('panelClose')}`;
    if (channelsSpoilerIndicater === channelsHidden) {
      panelClose.textContent = channelsOpen;
    } else {
      panelClose.textContent = channelsHidden;
    }
  });

  const english = document.querySelector('[role="en"]');
  english.addEventListener('click', () => {
    changeLanguage('en');
    updatePageContent();
  });

  const deutsch = document.querySelector('[role="de"]');
  deutsch.addEventListener('click', () => {
    changeLanguage('de');
    updatePageContent();
  });

  const russian = document.querySelector('[role="ru"]');
  russian.addEventListener('click', () => {
    changeLanguage('ru');
    updatePageContent();
  });

  const createDiv = () => document.createElement('div');

  const modalDiv = createDiv();
  modalDiv.classList.add('modal', 'fade', 'bg-transparent');
  modalDiv.setAttribute('id', 'modal');
  modalDiv.setAttribute('tabindex', '-1');
  modalDiv.setAttribute('role', 'dialog');
  modalDiv.setAttribute('aria-labelledby', 'modal');
  modalDiv.setAttribute('style', 'display: none');
  modalDiv.setAttribute('aria-hidden', 'true');
  body.appendChild(modalDiv);

  const dialogDiv = createDiv();
  dialogDiv.classList.add('modal-dialog');
  dialogDiv.setAttribute('role', 'document');
  modalDiv.appendChild(dialogDiv);

  const modalContentDiv = createDiv();
  modalContentDiv.classList.add('modal-content');
  dialogDiv.appendChild(modalContentDiv);

  const modalHeader = createDiv();
  modalHeader.classList.add('modal-header');
  modalContentDiv.appendChild(modalHeader);

  const modalTitle = document.createElement('h5');
  modalTitle.classList.add('modal-title');
  modalHeader.appendChild(modalTitle);

  const cross = createDiv();
  cross.classList.add('close');
  cross.setAttribute('type', 'button');
  cross.setAttribute('data-dismiss', 'modal');
  cross.setAttribute('aria-label', 'close');
  const crossSpan = document.createElement('span');
  crossSpan.setAttribute('aria-hidden', 'true');
  crossSpan.textContent = 'x';
  cross.appendChild(crossSpan);
  modalHeader.appendChild(cross);

  const modalBody = createDiv();
  modalBody.classList.add('modal-body');
  modalContentDiv.appendChild(modalBody);

  const modalFooter = createDiv();
  modalFooter.classList.add('modal-footer');
  modalContentDiv.appendChild(modalFooter);

  const linkButton = document.createElement('a');
  linkButton.classList.add('btn', 'btn-primary');
  linkButton.setAttribute('target', '_blank');
  linkButton.textContent = `${i18next.t('postLink')}`;
  linkButton.setAttribute('role', 'post-link');
  linkButton.setAttribute('rel', 'noopener noreferrer');
  modalFooter.appendChild(linkButton);

  const footerCloseButton = document.createElement('button');
  footerCloseButton.setAttribute('type', 'button');
  footerCloseButton.classList.add('btn', 'btn-secondary');
  footerCloseButton.textContent = `${i18next.t('close')}`;
  footerCloseButton.setAttribute('role', 'close-modal');
  footerCloseButton.setAttribute('data-dismiss', 'modal');
  modalFooter.appendChild(footerCloseButton);

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
          const newPostLi = renderPost(post, { modalTitle, modalBody, linkButton });
          return parentUl.appendChild(newPostLi);
        });
      }
    });
  }

  const watchedState = onChange(state, (path, channels) => {
    inputButton.disabled = true;
    state.process = 'loadingChannel';
    feedbackDiv.textContent = `${i18next.t(state.process)}`;
    feedbackDiv.classList.remove('text-danger');
    feedbackDiv.classList.add('text-success');
    const newChannel = channels[channels.length - 1];
    parseLink(newChannel).then((rssData) => {
      const { title, description, postsList } = rssData;
      renderNewChannel(feeds, title, description);
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
      postsListTitle.textContent = title;
      postsListTitle.classList.add('text-secondary', 'p-1');
      newPostst.appendChild(postsListTitle);
      const poststDescription = document.createElement('p');
      poststDescription.textContent = description;
      poststDescription.classList.add('text-muted', 'p-1');
      newPostst.appendChild(poststDescription);
      newPostst.setAttribute('id', `${newChannel}`);
      const ulId = newPostst.id;
      posts.appendChild(newPostst);
      Promise.allSettled(promises).then((results) => {
        results.map((post) => {
          const postInfo = post.value;
          const postLi = renderPost(postInfo, { modalTitle, modalBody, linkButton });
          return newPostst.appendChild(postLi);
        });
        state.process = 'loaded';
        feedbackDiv.textContent = `${i18next.t(state.process)}`;
        feedbackDiv.classList.add('text-success');
        inputButton.disabled = false;
      });
      watchChannel(postsList, ulId);
    })
      .catch((err) => {
        inputButton.disabled = false;
        if (err.name === 'TypeError') {
          const urlErr = 'notRss';
          state.process = urlErr;
          renderErrors(feedbackDiv, urlErr);
          state.channels.splice(-1, 1);
        }
        if (err.name === 'Error') {
          const urlErr = 'network';
          state.process = urlErr;
          renderErrors(feedbackDiv, urlErr);
        }
      });
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
      .notOneOf(state.channels, 'hasUrlYet')
      .validate(urlData)
      .then((value) => {
        watchedState.channels.push(value);
      })
      .catch((err) => {
        inputButton.disabled = false;
        state.process = err.message;
        renderErrors(feedbackDiv, err.message);
      });
  });
});
