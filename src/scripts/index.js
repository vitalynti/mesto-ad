import { getUserInfo, getCardList, setUserInfo, updateUserAvatar, postCard, deleteCardApi,changeLikeCardStatus } from "./components/api.js";
import { createCardElement} from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalUserList = cardInfoModalWindow.querySelector(".popup__list");

const deleteConfirmModal = document.querySelector('.popup_type_remove-card');
const deleteConfirmForm = deleteConfirmModal.querySelector('.popup__form');

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (label, value) => {
  const template = document.querySelector("#popup-info-definition-template").content;
  const item = template.querySelector(".popup__info-item").cloneNode(true);
  item.querySelector(".popup__info-term").textContent = label;
  item.querySelector(".popup__info-description").textContent = value;
  return item;
};

const handleInfoClick = () => {
  getCardList()
    .then((cards) => {
      cardInfoModalInfoList.innerHTML = "";
      cardInfoModalUserList.innerHTML = "";

      cardInfoModalWindow.querySelector(".popup__title").textContent = "Статистика карточек";
      cardInfoModalWindow.querySelector(".popup__text").textContent = "Популярные карточки:";

      const uniqueUsers = new Set();
      cards.forEach(card => {
        uniqueUsers.add(card.owner._id);
      });

      const totalLikes = cards.reduce((sum, card) => sum + card.likes.length, 0);

      const maxLikes = Math.max(...cards.map(card => card.likes.length));

      const championCard = cards.reduce((maxCard, card) => 
        card.likes.length > maxCard.likes.length ? card : maxCard
      );
      
      const popularCards = [...cards]
        .sort((a, b) => b.likes.length - a.likes.length)
        .slice(0, 3);

      cardInfoModalInfoList.append(
        createInfoString("Всего пользователей:", uniqueUsers.size.toString())
      );
      cardInfoModalInfoList.append(
        createInfoString("Всего лайков:", totalLikes.toString())
      );
      cardInfoModalInfoList.append(
        createInfoString("Максимально лайков от одного:", maxLikes.toString())
      );
      cardInfoModalInfoList.append(
        createInfoString("Чемпион лайков:", championCard.owner.name)
      );

      const userTemplate = document.querySelector("#popup-info-user-preview-template").content;
      
      popularCards.forEach(card => {
        const cardElement = userTemplate.querySelector(".popup__list-item").cloneNode(true);
        cardElement.textContent = card.name;
        cardInfoModalUserList.append(cardElement);
      });

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log("Ошибка при загрузке статистики:", err);
    });
};

function renderLoading(isLoading, button, initialText = "Сохранить", loadingText = "Сохранение...") {
  if (isLoading) {
    button.textContent = loadingText;
  } else {
    button.textContent = initialText;
  }
}

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};


const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  renderLoading(true, submitButton);

  updateUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
    })
    .catch((err) => console.log(err))
    .finally(() => {
      renderLoading(false, submitButton);
    });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  
  renderLoading(true, submitButton);

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      renderLoading(false, submitButton);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  
  renderLoading(true, submitButton, "Создать", "Создание...");

  postCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      const newCardElement = createCardElement(cardData, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: handleLikeClick,
        onDeleteCard:  openDeleteConfirm,
        userId: window.currentUserId,
      });

      placesWrap.prepend(newCardElement);
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
      clearValidation(cardForm, validationSettings);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      renderLoading(false, submitButton, "Создать");
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

setCloseModalWindowEventListeners(deleteConfirmModal);

enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    window.currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url('${userData.avatar}')`;

    cards.forEach((cardData) => {
  const cardElement = createCardElement(cardData, {
    onPreviewPicture: handlePreviewPicture,
    onLikeIcon: handleLikeClick,
    onDeleteCard: openDeleteConfirm,
    userId: window.currentUserId
  });
  placesWrap.append(cardElement);
});

    console.log('Данные успешно загружены с сервера');
  })
  .catch((err) => {
    console.error(`Ошибка при загрузке данных: ${err}`);
  });

let cardToDelete = null;
let cardElementToDelete = null;

const openDeleteConfirm = (cardId, cardElement) => {
  cardToDelete = cardId;
  cardElementToDelete = cardElement;
  openModalWindow(deleteConfirmModal);
};

const handleDeleteConfirm = (evt) => {
  evt.preventDefault();
  
  if (cardToDelete && cardElementToDelete) {
    const submitButton = evt.submitter;
    const initialText = submitButton.textContent;
    
    submitButton.textContent = 'Удаление...';
    
    deleteCardApi(cardToDelete)
      .then(() => {
        cardElementToDelete.remove();
        closeModalWindow(deleteConfirmModal);
        cardToDelete = null;
        cardElementToDelete = null;
      })
      .catch((err) => {
        console.log('Ошибка при удалении карточки:', err);
        closeModalWindow(deleteConfirmModal);
      })
      .finally(() => {
        submitButton.textContent = initialText;
      });
  }
};

deleteConfirmForm.addEventListener('submit', handleDeleteConfirm);

const handleLikeClick = (likeButton, cardId) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCardData) => {
      likeButton.classList.toggle("card__like-button_is-active");

      const cardElement = likeButton.closest('.card');
      const likeCountElement = cardElement.querySelector('.card__like-count');

      likeCountElement.textContent = updatedCardData.likes.length;
    })
    .catch((err) => {
      console.log("Ошибка при обновлении лайка:", err);
    });
};

const logoElement = document.querySelector('.header__logo');
if (logoElement) {
  logoElement.addEventListener('click', handleInfoClick);
  console.log('Обработчик добавлен на логотип');
} else {
  console.log('Логотип не найден! Проверьте HTML');
}