let activeTab = 0;
let books = [];
let filteredBooks = [];
const STORAGE_KEY = "BOOKSHELF_DATA";

const isSupportedStorage = () => {
  if (typeof (Storage) === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }

  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  renderTab(activeTab);
  loadDataFromStorage();

  const tabList = document.querySelectorAll(".navbar-list li");
  const navbarBurgerList = document.querySelectorAll(".navbar-burger-content .content li");
  for (let i = 0; i < tabList.length; i++) {
    tabList[i].addEventListener("click", () => {
      activeTab = i;
      renderTab(activeTab);
      renderData();
    });
    navbarBurgerList[i].addEventListener("click", () => {
      activeTab = i;
      renderTab(activeTab);
      renderData();
      setTimeout(closeDrawer, 300);
    });
  }

  const navbarBurger = document.getElementById("navbar-burger");
  navbarBurger.addEventListener("click", () => {
    openDrawer();
  });

  const navbarClose = document.querySelector(".close-button");
  navbarClose.addEventListener("click", () => {
    closeDrawer();
  });

  const burgerMenu = document.querySelector("aside");
  burgerMenu.style.transform = "translate(-110%)";

  const form = document.forms[0];
  form.addEventListener("submit", addBook);

  const search = document.getElementById("search-icon");
  search.addEventListener("click", searchBook);

  const modal = document.getElementById("modal");
  modal.style.display = "none";
});

const renderTab = (tabIndex) => {
  const tabList = document.querySelectorAll(".navbar-list li");
  const navbarBurgerList = document.querySelectorAll(".navbar-burger-content .content li");
  const contents = document.querySelectorAll("section");
  for (let i = 0; i < tabList.length; i++) {
    if (i === tabIndex) {
      tabList[i].classList.add("navbarActive");
      navbarBurgerList[i].classList.add("burgerActive");
      contents[i].classList.remove("hide");
      contents[i].classList.add("show");
    } else {
      tabList[i].classList.remove("navbarActive");
      navbarBurgerList[i].classList.remove("burgerActive");
      contents[i].classList.add("hide");
      contents[i].classList.remove("show");
    }
  }
}

const openDrawer = () => {
  const burgerMenu = document.querySelector("aside");
  burgerMenu.style.transform = "translate(0)";
}

const closeDrawer = () => {
  const burgerMenu = document.querySelector("aside");
  burgerMenu.style.transform = "translate(-110%)";
}

const renderData = (searchMode = false) => {
  const container = document.querySelectorAll(".card-container")[activeTab];
  container.innerHTML = "";

  if (!searchMode) {
    filteredBooks = generateDataByTabId(activeTab);
  }

  if (filteredBooks.length === 0) {
    return container.innerText = "No data yet.";
  }

  for (let i = 0; i < filteredBooks.length; i++) {
    const cardItemContainer = document.createElement("div");
    cardItemContainer.classList.add("card-shadow", "card-item-container");
    cardItemContainer.setAttribute("id", filteredBooks[i].id);

    const year = document.createElement("p");
    year.classList.add("year");
    year.textContent = "Year " + filteredBooks[i].year;

    const title = document.createElement("h2");
    title.textContent = filteredBooks[i].title;

    const author = document.createElement("p");
    author.textContent = filteredBooks[i].author;

    const mainButton = document.createElement("button");
    mainButton.classList.add("card-button", filteredBooks[i].isCompleted ? "card-button-unread" : "card-button-read");
    const mainButtonIcon = document.createElement("div");
    mainButtonIcon.classList.add(filteredBooks[i].isCompleted ? "unopened-book-icon" : "opened-book-icon");
    const mainButtonText = document.createElement("p");
    mainButtonText.textContent = filteredBooks[i].isCompleted ? "Unread book" : "Read book";
    mainButton.append(mainButtonIcon);
    mainButton.append(mainButtonText);
    mainButton.addEventListener("click", () => {
      const index = findBooksIndex(filteredBooks[i].id);
      books[index].isCompleted = !filteredBooks[i].isCompleted;
      renderData();
      saveData();
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("card-button", "card-button-delete");
    const trashButtonIcon = document.createElement("div");
    trashButtonIcon.classList.add("trash-icon");
    const trashButtonText = document.createElement("p");
    trashButtonText.textContent = "Delete book";
    trashButton.append(trashButtonIcon);
    trashButton.append(trashButtonText);
    trashButton.addEventListener("click", () => {
      renderDeleteDialog(filteredBooks[i].title, filteredBooks[i].id);
    });

    cardItemContainer.append(year);
    cardItemContainer.append(title);
    cardItemContainer.append(author);
    cardItemContainer.append(mainButton);
    cardItemContainer.append(trashButton);

    container.append(cardItemContainer);
  }
}

const addBook = (e) => {
  e.preventDefault();

  const id = +new Date();
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const year = document.getElementById("year").value;
  const isCompleted = document.getElementById("is-completed").checked;
  const data = { id, title, author, year, isCompleted };

  books.push(data);

  document.getElementById("title").value = "";
  document.getElementById("author").value = "";
  document.getElementById("year").value = "";
  document.getElementById("is-completed").checked = false;

  renderData();
  saveData();
}

const findBooksIndex = (bookId) => {
  return books.findIndex((book) => book.id === bookId);
}

const searchBook = () => {
  const searchValue = document.getElementById("search").value;
  if (!searchValue) {
    filteredBooks = books;
    renderData();
    return;
  };

  filteredBooks = books.filter((book) => book.title.includes(searchValue));
  renderData(true);
}

const generateDataByTabId = (tabIndex) => {
  switch (tabIndex) {
    case 0:
      return books;

    case 1:
      return books.filter((book) => book.isCompleted === true);

    case 2:
      return books.filter((book) => book.isCompleted === false);
  }
}

const saveData = () => {
  if (isSupportedStorage) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    renderData();
  }
}

const loadDataFromStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  renderData();
}

const renderDeleteDialog = (title, id) => {
  const modal = document.getElementById("modal");
  const container = document.querySelector("article .container");
  container.innerHTML = "";

  const modalItemHeader = document.createElement("div");
  modalItemHeader.classList.add("modal-item-container");
  const alertIcon = document.createElement("div");
  alertIcon.classList.add("alert-icon");
  modalItemHeader.append(alertIcon);

  const modalItemText = document.createElement("div");
  modalItemText.classList.add("modal-item-container", "modal-item-text");
  const modalItemTextH2 = document.createElement("h2");
  modalItemTextH2.innerText = `You are going to delete "${title}"`;
  const modalItemTextP = document.createElement("p");
  modalItemTextP.innerText = "Are you sure want to delete it?"
  modalItemText.append(modalItemTextH2);
  modalItemText.append(modalItemTextP);

  const modalButtonContainer = document.createElement("div");
  modalButtonContainer.classList.add("modal-button-container");
  const okButton = document.createElement("button");
  okButton.classList.add("modal-button", "modal-button-ok");
  okButton.innerText = "Yes";
  const cancelButton = document.createElement("button");
  cancelButton.classList.add("modal-button", "modal-button-cancel");
  cancelButton.innerText = "No";
  modalButtonContainer.append(okButton);
  modalButtonContainer.append(cancelButton);

  container.append(modalItemHeader);
  container.append(modalItemText);
  container.append(modalButtonContainer);

  okButton.addEventListener("click", () => {
    deleteBookById(id);
    modal.style.display = "none";
  });
  cancelButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.style.display = "flex";
}

const deleteBookById = (id) => {
  const searchElement = document.getElementById("search");
  if (searchElement.value) {
    console.log(searchElement)
    searchElement.value = "";
  }

  const index = findBooksIndex(id);
  books.splice(index, 1);
  renderData();
  saveData();
}