import i18next from 'i18next';

const modalTitle = document.querySelector('[class="modal-title"]');
const modalBody = document.querySelector('[class="modal-body"]');
const linkButton = document.querySelector('[role="post-link"]');

function renderNewChannel(feeds, title, description) {
  if (feeds.children.length === 0) {
    const tatrgetDiv = feeds;
    tatrgetDiv.textContent = '';
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
  feedLink.setAttribute('target', '_blank');
  feedLink.href = postLink;  
  feedLink.textContent = postTitle;
  feedLink.classList.add('font-weight-bold');
  feedLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.open(postLink);
    feedLink.classList.remove('font-weight-bold');
  });
  postHeader.appendChild(feedLink);
  const feedDescription = document.createElement('p');
  const pubDateSlioceToElements = 5;
  const publicationInfo = pubDate.toString().split(' ').slice(0, pubDateSlioceToElements).join(' ');
  const previewMaxLenght = 200;
  const previewInfo = `${postDescription.slice(0, previewMaxLenght)}...`;
  feedDescription.innerHTML = `${previewInfo} / ${publicationInfo}`;
  feedDescription.classList.add('text-muted');
  postBody.appendChild(feedDescription);
  const feedButton = document.createElement('button');
  feedButton.classList.add('btn', 'btn-primary', 'btn-small');
  feedButton.textContent = i18next.t('preview');
  feedButton.setAttribute('type', 'button');
  feedButton.setAttribute('data-toggle', 'modal');
  const buttonId = '#modal';
  feedButton.setAttribute('data-target', buttonId);
  feedButton.addEventListener('click', () => {
    modalTitle.textContent = postTitle;
    modalBody.innerHTML = postDescription;
    linkButton.href = postLink;
  });
  postBody.appendChild(feedButton);
  feedLi.appendChild(postBody);

  return feedLi;
}

function renderErrors(feedbackDiv, err) {
  const targetDiv = feedbackDiv;
  feedbackDiv.classList.remove('text-success');
  feedbackDiv.classList.add('text-danger');
  targetDiv.textContent = i18next.t(err);
}

export { renderNewChannel, renderPost, renderErrors };
