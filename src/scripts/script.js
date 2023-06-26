'use strict';

// Загрузка и сохранение данных

// массив с данными
let habbits = [];

// ключ localStorage
const HABBIT_KEY = 'HABBIT_KEY';

let globalActiveHabbitId;

// page
const page = {
  menu: document.querySelector('.menu__list'),
  header: {
    title: document.querySelector('.title'),
    progressPercent: document.querySelector('.progress__percent'),
    progressScale: document.querySelector('.progress__bar-scale'),
  },
  content: {
    daysContent: document.getElementById('days'),
    nextDay: document.querySelector('.habbit__day'),
  },
  popup: {
    index: document.getElementById('add-habbit-popup'),
    iconField: document.querySelector('.popup__form input[name="icon"]'),
  },
};

// Утилитарные функции:

// Получения данных от пользователя
function loadData() {
  const habbitsString = localStorage.getItem(HABBIT_KEY);
  const habbitArr = JSON.parse(habbitsString);
  if (Array.isArray(habbitArr)) {
    habbits = habbitArr;
  }
}

// Сохранение данных
function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = '';
  }
}

function validateAndGetFormData(form, fields) {
  const formData = new FormData(form);
  const res = {};
  for (const field of fields) {
    const fieldValue = formData.get(field);
    form[field].classList.remove('error');
    if (!fieldValue) {
      form[field].classList.add('error');
      return;
    }
    res[field] = fieldValue;
  }
  let isValid = true;
  for (const field of fields) {
    if (!res[field]) {
      isValid = false;
    }
  }
  if (!isValid) {
    return;
  }
  return res;
}

// render

function rerenderMenu(activeHabbit) {
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);

    if (!existed) {
      const element = document.createElement('li');
      element.setAttribute('menu-habbit-id', habbit.id);
      element.classList.add('menu__item');
      element.addEventListener('click', () => rerender(habbit.id));
      element.innerHTML = `
      <button class="menu__btn">
        <img src="img/${habbit.icon}.svg" alt="${habbit.name}">
      </button>
      `;

      if (activeHabbit.id === habbit.id) {
        element.classList.add('menu__item--active');
      }
      page.menu.appendChild(element);
      continue;
    }

    if (activeHabbit.id === habbit.id) {
      existed.classList.add('menu__item--active');
    } else {
      existed.classList.remove('menu__item--active');
    }
  }
}

function rerenderHead(activeHabbit) {
  page.header.title.textContent = activeHabbit.name;
  const progress =
    activeHabbit.days.length / activeHabbit.target > 1
      ? 100
      : (activeHabbit.days.length / activeHabbit.target) * 100;
  page.header.progressPercent.textContent = progress.toFixed(0) + '%';
  page.header.progressScale.setAttribute(
    'style',
    `width: ${progress.toFixed(0)}%`
  );
}

function rerenderBody(activeHabbit) {
  page.content.daysContent.innerHTML = '';
  for (const index in activeHabbit.days) {
    const element = document.createElement('div');
    element.classList.add('habbit');
    element.innerHTML = `
      <div class="habbit__day">День ${Number(index) + 1}</div>
        <div class="habbit__comment">${activeHabbit.days[index].comment}</div>
        <button class="habbit__delete" onclick="removeDay(${index})">
          <img src="img/delete.svg" alt="Удалить день ${Number(index) + 1}">
        </button>
      </div>
    `;
    page.content.daysContent.appendChild(element);
  }
  page.content.nextDay.textContent = `День ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId) {
  globalActiveHabbitId = activeHabbitId;
  const activeHabbit = habbits.find((habbit) => habbit.id === activeHabbitId);
  if (!activeHabbit) {
    return;
  }
  document.location.replace(document.location.pathname + '#' + activeHabbitId);
  rerenderMenu(activeHabbit);
  rerenderHead(activeHabbit);
  rerenderBody(activeHabbit);
}

// work with days
function addDays(event) {
  event.preventDefault();
  const data = validateAndGetFormData(event.target, ['comment']);
  if (!data) {
    return;
  }
  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.concat([{ comment: data.comment }]),
      };
    }
    return habbit;
  });
  resetForm(event.target, ['comment']);
  rerender(globalActiveHabbitId);
  saveData();
}

function addHabbit(event) {
  event.preventDefault();
  const data = validateAndGetFormData(event.target, ['name', 'icon', 'target']);
  if (!data) {
    return;
  }

  const maxId = habbits.reduce(
    (acc, habbit) => (acc > habbit.id ? acc : habbit.id),
    0
  );

  habbits.push({
    id: maxId + 1,
    name: data.name,
    target: data.target,
    icon: data.icon,
    days: [],
  });
  resetForm(event.target, ['name', 'target']);
  togglePopup();
  saveData();
  rerender(maxId + 1);
}

// delete habbit
function removeDay(index) {
  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      habbit.days.splice(index, 1);
      return {
        ...habbit,
        days: habbit.days,
      };
    }
    return habbit;
  });
  rerender(globalActiveHabbitId);
  saveData();
}

// open popup
function togglePopup() {
  if (page.popup.index.classList.contains('cover--hidden')) {
    page.popup.index.classList.remove('cover--hidden');
  } else {
    page.popup.index.classList.add('cover--hidden');
  }
}

// working with habbits

function setIcon(context, icon) {
  page.popup.iconField.value = icon;
  const activeIcon = document.querySelector(
    '.button-list__item.button-list__item--active'
  );
  activeIcon.classList.remove('button-list__item--active');
  context.parentNode.classList.add('button-list__item--active');
}

// init
(() => {
  loadData();
  const hashId = Number(document.location.hash.replace('#', ''));
  const urlHabbit = habbits.find((habbit) => habbit.id === hashId);
  if (urlHabbit) {
    rerender(urlHabbit.id);
  } else {
    rerender(habbits[0].id);
  }
  togglePopup();
})();
