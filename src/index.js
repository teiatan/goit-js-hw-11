import './css/styles.css';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';


const refs = {
    form: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    loadMoreButton: document.querySelector('#load-more'),  
};

const lineParameters = {
  key:"32214751-b09778eb488071213c70b42e8",
  q,
  image_type:"photo",
  orientation: "horizontal",
  safesearch: "true",
};

const PER_PAGE = 40;

let img = undefined;
let page = 1;
let pagesLeft = 0;

refs.form.addEventListener('submit', submitHandler);
refs.loadMoreButton.addEventListener('click', loadMorehandler);

async function submitHandler(e) {
    e.preventDefault();
    refs.loadMoreButton.classList.add('hidden');
    refs.loadMoreButton.classList.remove('visible');
    img = e.currentTarget.elements.searchQuery.value;
    refs.gallery.innerHTML = '';

    await getImg(img, page).then(response => {
      if (img === ' ' || img === '') {
        Notiflix.Notify.failure('Please, enter your search query.');
        return;
      }
      pagesLeft = response.data.totalHits;
      if (response.data.hits.length === 0) {
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        return;
      } else {
        Notiflix.Notify.success(`Hooray! We found ${pagesLeft} images.`);
        refs.gallery.insertAdjacentHTML(
          'beforeend',
          response.data.hits.map(picture => renderPicture(picture)).join('')
        );
        pagesLeft -= PER_PAGE;
        refs.loadMoreButton.classList.remove('hidden');
        refs.loadMoreButton.classList.add('visible');
      }
    });
    lightBox.refresh();
  }
  
async function loadMorehandler() {
    page += 1;
    if (pagesLeft <= 0) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      await getImg(img, page).then(response =>
        refs.gallery.insertAdjacentHTML(
          'beforeend',
          response.data.hits.map(picture => renderPicture(picture)).join('')
        )
      ).catch();
      pagesLeft -= PER_PAGE;
    }
    lightBox.refresh();
}

function renderPicture(picture) {
  return `
    <div class="photo-card">
      <a href=${picture.largeImageURL}><img src=${picture.webformatURL} alt=${picture.tags} loading="lazy"/>
      <div class="info">
        <p class="info-item">
          <span>Likes: </span><span>${picture.likes}</span>
        </p>
        <p class="info-item">
          <span>Views: </span><span>${picture.views}</span>
        </p>
        <p class="info-item">
          <span>Comments: </span><span>${picture.comments}</span>
        </p>
        <p class="info-item">
          <span>Downloads: </span><span>${picture.downloads}</span>
        </p>
      </div></a>
    </div>
  `;
}

function getImg(img, page) {
  return axios.get(
    `https://pixabay.com/api/?key=${lineParameters.key}&q=${img}&image_type=${lineParameters.image_type}&orientation=${lineParameters.orientation}&safesearch=${lineParameters.safesearch}&page=${page}&per_page=${PER_PAGE}`
  );
}

const lightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  scrollZoom: false,
});