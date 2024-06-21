const imagesContainer = document.querySelector(".images-container");
const inputText = document.querySelector(".input-text");
const spinner = document.querySelector(".spinner-border");
const errorContainer = document.querySelector(".alert-danger");
const pageNoPictures = document.querySelector(".no-images-message");

const showError = (errorMessage) => {
  errorContainer.classList.remove("hidden");
  errorContainer.innerHTML = errorMessage;
};

const hideError = () => errorContainer.classList.add("hidden");

const showSpinner = () => spinner.classList.remove("hidden");

const hideSpinner = () => spinner.classList.add("hidden");

const showPageNoPictures = () => pageNoPictures.classList.remove("hidden");

const hidePageNoPictures = () => pageNoPictures.classList.add("hidden");

const isPageNoPicturesVisible = () =>
  !pageNoPictures.classList.contains("hidden");

const validateSearch = (status) => {
  if (status >= 400 && status <= 499) {
    throw new Error("Bad request. Please try again");
  } else if (status >= 500 && status <= 599) {
    throw new Error("Server error. Please try again");
  } else {
    throw new Error("Unknown error.");
  }
};

const debounce = (callback, delay = 1000) => {
  let timeout;
  return (query) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback(query);
    }, delay);
  };
};

let totalImagesAvailable = 0;
let imagesLoaded = 0;
let currentPage = 1;

const fetchImages = async (query, resultsPerQuery = 20) => {
  try {
    const response = await fetch(
      `https://pixabay.com/api/?key=31784289-8c5c8bddae77d61fff616be96&q=${query}&per_page=${resultsPerQuery}&page=${currentPage}`
    );
    if (response.ok) {
      const data = await response.json();
      totalImagesAvailable = data.totalHits;
      currentPage++;
      return data;
    } else {
      validateSearch(response.status);
    }
  } catch (error) {
    showError(error.message);
  }
};

const renderImages = debounce(async (query) => {
  hideError();
  hidePageNoPictures();
  if (query.trim() === "") {
    hideSpinner();
    imagesContainer.innerHTML = "";
    return;
  }

  const images = await fetchImages(query, 20);
  hideSpinner();

  if (!images) {
    return;
  }

  if (!images.hits.length) {
    showPageNoPictures();
    return;
  }

  images.hits.forEach((item) => {
    const img = document.createElement("img");
    img.classList.add("image");
    img.src = item.webformatURL;
    imagesContainer.appendChild(img);
    imagesLoaded++;
  });
});

inputText.addEventListener("input", (event) => {
  hideError();
  hidePageNoPictures();
  imagesLoaded = 0;
  currentPage = 1;
  imagesContainer.innerHTML = "";
  renderImages(event.target.value);
});

window.addEventListener("scroll", () => {
  if (isPageNoPicturesVisible()) return;
  const viewportHeight = document.documentElement.clientHeight;
  const scrolledY = window.scrollY;
  const pageHeight = document.documentElement.scrollHeight;

  if (Math.ceil(scrolledY + viewportHeight) >= pageHeight) {
    showSpinner();
    renderImages(inputText.value);
  }
});
