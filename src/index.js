import './css/styles.css';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import debounce from 'lodash.debounce';


const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  /* uncomment for load more with button
  loadMoreButton: document.querySelector('#load-more'),  */ 
};

const lineParameters = {
  key:"32214751-b09778eb488071213c70b42e8",
  image_type:"photo",
  orientation: "horizontal",
  safesearch: "true",
};



const PER_PAGE = 40;

let img = undefined;
let page = 1;
let pagesLeft = 0;

function getImg(img, page) {
  return axios.get(
    `https://pixabay.com/api/?key=${lineParameters.key}&q=${img}&image_type=${lineParameters.image_type}&orientation=${lineParameters.orientation}&safesearch=${lineParameters.safesearch}&page=${page}&per_page=${PER_PAGE}`
  );
}

/* uncomment for load more with button
refs.loadMoreButton.addEventListener('click', loadMorehandler); */
refs.form.addEventListener('submit', submitHandler);

async function submitHandler(e) {
  page = 1;
  e.preventDefault();
  img = e.currentTarget.elements.searchQuery.value;
  refs.gallery.innerHTML = '';
  /* uncomment for load more with button
  refs.loadMoreButton.classList.add('hidden');
  refs.loadMoreButton.classList.remove('visible'); */
  if (img.trim() === '') {
    Notiflix.Notify.failure('Please, enter your search query.');
    return;
  }
  try {const response = await getImg(img, page);  
    pagesLeft = response.data.totalHits;
    if (response.data.totalHits === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    } else {
      Notiflix.Notify.success(`Hooray! We found ${pagesLeft} images.`);
      refs.gallery.insertAdjacentHTML(
        'beforeend',
        response.data.hits.map(picture => renderPicture(picture)).join('')
      );
      pagesLeft -= PER_PAGE;
      /* uncomment for load more with button
      refs.loadMoreButton.classList.remove('hidden');
      refs.loadMoreButton.classList.add('visible'); */
      smoothScroll();
      window.addEventListener('scroll', checkPosition);
    };
    lightBox.refresh();
  } catch (error) {};
}

async function loadMorehandler() {
  
  page += 1;
  if (pagesLeft <= 0) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
    /* uncomment for load more with button
    refs.loadMoreButton.classList.add('hidden');
    refs.loadMoreButton.classList.remove('visible'); */
    return;
  } else {
    try {
      const response = await getImg(img, page);
      refs.gallery.insertAdjacentHTML(
        'beforeend',
        response.data.hits.map(picture => renderPicture(picture)).join('')
      );
      pagesLeft -= PER_PAGE;
      lightBox.refresh();
    } catch (error) {};
  }
}

function renderPicture(picture) {
  return `
    <div class="photo-card">
      <a href=${picture.largeImageURL}><div class="photo-img"><img src=${picture.webformatURL} alt=${picture.tags} loading="lazy" width="270" max-height="180"/></div>
      <div class="info">
        <p class="info-item">
          <b>Likes: </b><span>${picture.likes}</span>
        </p>
        <p class="info-item">
          <b>Views: </b><span>${picture.views}</span>
        </p>
        <p class="info-item">
          <b>Comments: </b><span>${picture.comments}</span>
        </p>
        <p class="info-item">
          <b>Downloads: </b><span>${picture.downloads}</span>
        </p>
      </div></a>
    </div>
  `;
}



const lightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  scrollZoom: false,
});

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  
  window.scrollBy({
    top: cardHeight * -1,
    behavior: 'smooth',
    
  });
};


async function infiniteScroll() {
  // высота документа и высота экрана:
  const height = document.body.offsetHeight;
  const screenHeight = window.innerHeight;

  // сколько проскроллено:
  const scrolled = window.scrollY;

  // порог для вызова функции
  const threshold = height - screenHeight / 4;

  // низ экрана относительно страницы:
  const position = scrolled + screenHeight;
console.log(position);
  if (position < threshold) {
    return;
  } else if (pagesLeft <= 0) {
    window.removeEventListener('scroll', checkPosition);
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
    return;
  } else {
    page += 1;
    const response = await getImg(img, page);
    refs.gallery.insertAdjacentHTML(
      'beforeend',
      response.data.hits.map(picture => renderPicture(picture)).join('')
    );
    pagesLeft -= PER_PAGE;
    lightBox.refresh();
    
  }
}

const checkPosition = debounce(infiniteScroll, 300);