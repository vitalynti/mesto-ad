export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick, userId }
) => {
  const cardElement = getTemplate();

  const likeCountElement = cardElement.querySelector(".card__like-count");
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  
  const infoButton = cardElement.querySelector(".card__control-button_type_info"); 
  
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");

  likeCountElement.textContent = data.likes.length;
  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  const isLikedByMe = data.likes.some((user) => user._id === userId);
  
  if (isLikedByMe) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (data.owner._id !== userId) {
    if (deleteButton) deleteButton.remove(); 
  } else {
    deleteButton.addEventListener("click", () => {
      onDeleteCard(data._id, cardElement);
    });
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => {
      onLikeIcon(likeButton, data._id);
    });
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => {
      onPreviewPicture({ name: data.name, link: data.link });
    });
  }

  if (infoButton) {
    if (onInfoClick) {
      infoButton.addEventListener("click", (evt) => {
        evt.stopPropagation();
        console.log("Клик по 'i' сработал! ID карточки:", data._id);
        onInfoClick(data._id);
      });
    } else {
      console.warn("Функция onInfoClick не передана в createCardElement");
    }
  } else {
    console.error("Кнопка .card__control-button_type_info не найдена в шаблоне!");
  }

  return cardElement;
};

export const toggleLikeVisual = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};