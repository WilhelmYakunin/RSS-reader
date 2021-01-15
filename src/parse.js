import axios from 'axios';

function genLink(url) {
  const proxi = 'https://api.allorigins.win/get?url=';
  return `${proxi}${encodeURIComponent(url)}`;
}

function parseLink(str) {
  return axios.get(genLink(str))
    .then((document) => {
      const domParser = new DOMParser();
      const doc = domParser.parseFromString(`${document.data.contents}`, 'application/xml');
      const channel = doc.querySelector('channel');

      const title = channel.querySelector('title').textContent;
      const description = channel.querySelector('description').textContent;
      const posts = channel.querySelectorAll('item');
      const postsList = [...posts].map((post) => {
        const pubDate = new Date(post.querySelector('pubDate').textContent);
        const postTitle = post.querySelector('title').textContent;
        const postDescription = post.querySelector('description').textContent;
        const postLink = post.querySelector('link').textContent;
        return {
          pubDate, postTitle, postDescription, postLink,
        };
      });
      return { title, description, postsList };
    });
}

function getImg(str) {
  return axios.get(genLink(str))
    .then((document) => {
      const domParser = new DOMParser();
      const doc = domParser.parseFromString(`${document.data.contents}`, 'text/html');
      const head = doc.querySelector('head');
      const og = head.querySelectorAll('[property="og:image"]');
      const postImg = og[0].content;
      return postImg;
    });
}

export { parseLink, getImg };
