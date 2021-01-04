import axios from 'axios';

function genLink(url) {
  const proxi = 'https://api.allorigins.win/get?url=';
  return `${proxi}${encodeURIComponent(url)}`;
}

export default (postLink) => axios.get(genLink(postLink))
  .then((response) => {
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(`${response.data.contents}`, 'text/html');
    const head = doc.querySelector('head');
    const og = head.querySelectorAll('[property="og:image"]');
    const postImg = og[0].content;
    return postImg;
  });
