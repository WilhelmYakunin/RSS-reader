import i18next from 'i18next';
import * as y from 'yup';
import onChange from 'on-change';
import i18n from './locales/i18nEngine';
import parseLink from './rss.parser.js';
import parseSiteLink from './link.parser.js';

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
    const linkButtons = document.querySelectorAll('[role="post-link"]');
    const footerCloseButtons = document.querySelectorAll('[role="close-modal"]');
    Array.from(linkButtons).map((linkButton) => updateElem('postLink', linkButton));
    Array.from(footerCloseButtons).map((footerCloseButton) => updateElem('close', footerCloseButton));
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

  function renderNewChannel(title, description) {
    if (feeds.children.length === 0) {
      feeds.textContent = '';
    }
    const newChannelHeader = document.createElement('h3');
    newChannelHeader.textContent = title;
    newChannelHeader.classList.add('display-6');

    const channelDescription = document.createElement('small');
    channelDescription.textContent = description;
    channelDescription.classList.add('text-muted');

    const newChannel = document.createElement('li');
    newChannel.classList.add('list-group-item');
    newChannel.appendChild(newChannelHeader);
    newChannel.appendChild(channelDescription);
    return feeds.appendChild(newChannel);
  }

  function createModal(modalTitle, id, postDescription, postLink) {
    const createDiv = () => document.createElement('div');

    const parentDiv = createDiv();
    parentDiv.classList.add('modal', 'fade', 'bg-transparent');
    parentDiv.setAttribute('id', id);
    parentDiv.setAttribute('tabindex', '-1');
    parentDiv.setAttribute('role', 'dialog');
    parentDiv.setAttribute('aria-labelledby', `${id}Label`);
    parentDiv.setAttribute('aria-hidden', 'true');

    const contentDiv = createDiv();
    contentDiv.classList.add('modal-dialog', 'bg-white');
    contentDiv.setAttribute('role', 'document');
    parentDiv.appendChild(contentDiv);

    const modalHeader = createDiv();
    modalHeader.classList.add('modal-header');
    contentDiv.appendChild(modalHeader);

    const title = document.createElement('h3');
    title.classList.add('modal-title');
    title.setAttribute('id', `${id}Label`);
    title.textContent = modalTitle;
    modalHeader.appendChild(title);

    const closeButton = document.createElement('button');
    closeButton.setAttribute('type', 'button');
    closeButton.classList.add('close');
    closeButton.setAttribute('data-dismiss', 'modal');
    closeButton.setAttribute('aria-label', 'Close');
    const headerSpan = document.createElement('span');
    headerSpan.setAttribute('aria-hidden', 'true');
    closeButton.appendChild(headerSpan);
    modalHeader.appendChild(closeButton);

    const modalBody = createDiv();
    modalBody.classList.add('modal-body');
    modalBody.textContent = postDescription;
    contentDiv.appendChild(modalBody);

    const modalFooter = createDiv();
    modalFooter.classList.add('modal-footer');
    contentDiv.appendChild(modalFooter);

    const linkButton = document.createElement('a');
    linkButton.classList.add('btn', 'btn-primary');
    linkButton.href = postLink;
    linkButton.textContent = `${i18next.t('postLink')}`;
    linkButton.setAttribute('role', 'post-link');
    linkButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(postLink);
    });
    modalFooter.appendChild(linkButton);

    const footerCloseButton = document.createElement('button');
    footerCloseButton.setAttribute('type', 'button');
    footerCloseButton.classList.add('btn', 'btn-secondary');
    footerCloseButton.textContent = `${i18next.t('close')}`;
    footerCloseButton.setAttribute('role', 'close-modal');
    modalFooter.appendChild(footerCloseButton);

    return parentDiv;
  }

  function renderPost(post) {
    const {
      pubDate, postTitle, postDescription, postLink, imgLink,
    } = post;
    const feedLi = document.createElement('li');
    feedLi.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'm-2');

    const postCard = document.createElement('div');
    const feedPicture = document.createElement('img');
    feedPicture.setAttribute('height', '120');
    feedPicture.src = imgLink;
    postCard.appendChild(feedPicture);
    postCard.classList.add('p-1');
    feedLi.appendChild(postCard);

    const postBody = document.createElement('div');
    postBody.classList.add('d-flex', 'flex-column', 'ml-5');
    const postHeader = document.createElement('h5');
    postHeader.classList.add('card-title');
    postBody.appendChild(postHeader);
    const feedLink = document.createElement('a');
    feedLink.href = postLink;
    feedLink.textContent = postTitle;
    postHeader.appendChild(feedLink);
    const feedDescription = document.createElement('p');
    const publicationInfo = pubDate.toString().split(' ').slice(1, 5).join(' ');
    feedDescription.textContent = `${postDescription} / ${publicationInfo}`;
    feedDescription.classList.add('text-muted');
    postBody.appendChild(feedDescription);
    const feedButton = document.createElement('button');
    feedButton.classList.add('btn', 'btn-primary', 'btn-small');
    feedButton.textContent = `${i18next.t('preview')}`;
    feedButton.setAttribute('type', 'button');
    feedButton.setAttribute('data-toggle', 'modal');
    const modalId = postLink.replace(/\W/g, '');
    const buttonId = `#${modalId}`;
    feedButton.setAttribute('data-target', buttonId);
    postBody.appendChild(feedButton);
    const modal = createModal(postTitle, modalId, postDescription, postLink);
    feedLi.appendChild(modal);
    feedLink.classList.add('font-weight-bold');
    feedLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(postLink);
      feedLink.classList.remove('font-weight-bold');
    });
    feedLi.appendChild(postBody);

    return feedLi;
  }

  function renderErrors(err) {
    feedbackDiv.classList.remove('text-success');
    feedbackDiv.classList.add('text-danger');
    feedbackDiv.textContent = `${i18next.t(err)}`;
  }

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

  const watchedState = onChange(state, (path, channels) => {
    inputButton.disabled = true;
    state.process = 'loadingChannel';
    feedbackDiv.textContent = `${i18next.t(state.process)}`;
    feedbackDiv.classList.remove('text-danger');
    feedbackDiv.classList.add('text-success');
    const newChannel = channels[channels.length - 1];
    parseLink(newChannel).then((rssData) => {
      const { title, description, postsList } = rssData;
      renderNewChannel(title, description);
      const promises = Array.from(postsList).map((post) => {
        const {
          pubDate, postTitle, postDescription, postLink,
        } = post;
        return parseSiteLink(postLink).then((imgLink) => ({
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
          const postLi = renderPost(postInfo);
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
          renderErrors(urlErr);
          state.channels.splice(-1, 1);
        }
        if (err.name === 'Error') {
          const urlErr = 'network';
          state.process = urlErr;
          renderErrors(urlErr);
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
        renderErrors(err.message);
      });
  });
});
