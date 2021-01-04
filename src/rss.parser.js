import axios from 'axios';

function genLink(url) {
  const proxi = 'https://api.allorigins.win/get?url=';
  return `${proxi}${encodeURIComponent(url)}`;
}

export default (newChannel) => axios.get(genLink(newChannel))
  .then((response) => {
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(`${response.data.contents}`, 'application/xml');
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
