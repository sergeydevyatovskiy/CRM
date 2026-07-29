"use strict";

const API_URL = "https://script.google.com/macros/s/AKfycbzNPTRZVvml99PhBDXN8zEyzE1uLPGsb0orr7J7Qlla003XJFgk_espaLyadM-DxbjA/exec";
async function saveLead(lead) {

    console.log("saveLead вызван", lead);
}


const stages = [

    "Новый лид",
    "Квалифицирован",
    "Назначена консультация",
    "Отказ"

];



const form = document.getElementById("leadForm");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const sourceSelect = document.getElementById("source");
const ownerSelect = document.getElementById("owner");
const stageSelect = document.getElementById("stage");
const tzCheckbox = document.getElementById("tzRequested");
const errorMessage = document.getElementById("errorMessage");
const toast = document.getElementById("toast");
const leadsContainer = document.getElementById("leadsContainer");
const emptyState = document.getElementById("emptyState");
const leadCounter = document.getElementById("leadCounter");
const template = document.getElementById("leadTemplate");


/* ============================================================
   Локальное хранилище

   Используется как резерв.
============================================================ */

let leads = [];


/* ============================================================
   Маска телефона

   Формат

   +7 (999) 123-45-67

============================================================ */

phoneInput.addEventListener("input", phoneMask);

function phoneMask(e) {

    let numbers = e.target.value.replace(/\D/g, "");

    if (numbers.startsWith("8")) {

        numbers = "7" + numbers.substring(1);

    }

    if (!numbers.startsWith("7")) {

        numbers = "7" + numbers;

    }

    numbers = numbers.substring(0, 11);

    let result = "+7";

    if (numbers.length > 1) {

        result += " (" + numbers.substring(1, 4);

    }

    if (numbers.length >= 4) {

        result += ") " + numbers.substring(4, 7);

    }

    if (numbers.length >= 7) {

        result += "-" + numbers.substring(7, 9);

    }

    if (numbers.length >= 9) {

        result += "-" + numbers.substring(9, 11);

    }

    e.target.value = result;

}


/* ============================================================
   Получить только цифры телефона
============================================================ */

function getPhoneDigits(phone) {

    return phone.replace(/\D/g, "");

}


/* ============================================================
   Проверка телефона
============================================================ */

function isPhoneValid(phone) {

    return getPhoneDigits(phone).length === 11;

}


/* ============================================================
   Показать ошибку
============================================================ */

function showError(message) {

    errorMessage.textContent = message;

}


/* ============================================================
   Очистить ошибку
============================================================ */

function clearError() {

    errorMessage.textContent = "";

}


/* ============================================================
   Получить текущую дату

   Формат

   29.07.2026 19:42

============================================================ */

function getCurrentDateTime() {

    const now = new Date();

    return now.toLocaleString("ru-RU", {

        day: "2-digit",

        month: "2-digit",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit"

    });

}


/* ============================================================
   Очистить форму
============================================================ */

function clearForm() {

    form.reset();

    phoneInput.value = "";

    sourceSelect.value = "Холодный";

    ownerSelect.value = "Лидоруб";

    stageSelect.value = "Новый лид";

}


/* ============================================================
   Submit формы
============================================================ */

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    clearError();


    const name = nameInput.value.trim();

    const phone = phoneInput.value.trim();


    if (name === "") {

        showError("Введите имя клиента.");

        return;

    }


    if (phone === "") {

        showError("Введите номер телефона.");

        return;

    }


    if (!isPhoneValid(phone)) {

        showError("Введите корректный номер телефона.");

        return;

    }


    const lead = {

        id: Date.now(),

        name: name,

        phone: phone,

        source: sourceSelect.value,

        owner: ownerSelect.value,

        stage: stageSelect.value,

        tz: tzCheckbox.checked,

        created: getCurrentDateTime()

    };


    try {

        /*
            Эти функции будут реализованы
            во второй части файла
        */

        await saveLead(lead);

        leads.unshift(lead);

        renderLead(lead);

        updateCounter();

        updateEmptyState();

        showToast("Лид успешно сохранён.");

        clearForm();

    }

    catch (error) {

        console.error(error);

        showError("Не удалось сохранить лид.");

    }

});


/* ============================================================
   Запуск приложения

   Реализуем во второй части
============================================================ */

init();

/* ============================================================
   Инициализация приложения
============================================================ */

async function init() {

    try {

        await loadLeads();

    }

    catch (error) {

        console.error(error);

    }

}


/* ============================================================
   Создание карточки лида
============================================================ */

function renderLead(lead) {

    const clone = template.content.cloneNode(true);

    const card = clone.querySelector(".lead-card");

    card.dataset.id = lead.id;


    clone.querySelector(".lead-name").textContent = lead.name;

    clone.querySelector(".lead-phone").textContent = lead.phone;

    clone.querySelector(".lead-source").textContent = lead.source;

    clone.querySelector(".lead-owner").textContent = lead.owner;

    clone.querySelector(".lead-tz").textContent =
        lead.tz ? "Да" : "Нет";

    clone.querySelector(".lead-created").textContent =
        lead.created;


    const stageElement = clone.querySelector(".lead-stage");

    stageElement.textContent = lead.stage;

    setStageColor(stageElement, lead.stage);


    const button =
        clone.querySelector(".change-stage-btn");


    button.addEventListener("click", async () => {

        await nextStage(lead.id);

    });


    leadsContainer.prepend(clone);

}


/* ============================================================
   Перерисовка списка
============================================================ */

function renderAllLeads() {

    leadsContainer.innerHTML = "";

    leads.forEach(renderLead);

}


/* ============================================================
   Следующий этап сделки
============================================================ */

async function nextStage(id) {

    const lead = leads.find(l => l.id == id);

    if (!lead)
        return;


    let index = stages.indexOf(lead.stage);

    index++;

    if (index >= stages.length) {

        index = 0;

    }

    lead.stage = stages[index];


    await updateLead(lead);

    renderAllLeads();

}


/* ============================================================
   Цвет этапа
============================================================ */

function setStageColor(element, stage) {

    switch (stage) {

        case "Новый лид":

            element.style.background = "#DBEAFE";
            element.style.color = "#1D4ED8";

            break;


        case "Квалифицирован":

            element.style.background = "#DCFCE7";
            element.style.color = "#15803D";

            break;


        case "Назначена консультация":

            element.style.background = "#FEF3C7";
            element.style.color = "#B45309";

            break;


        case "Отказ":

            element.style.background = "#FEE2E2";
            element.style.color = "#B91C1C";

            break;

    }

}


/* ============================================================
   Toast
============================================================ */

let toastTimer = null;

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


/* ============================================================
   Счетчик лидов
============================================================ */

function updateCounter() {

    leadCounter.textContent = leads.length;

}


/* ============================================================
   Пустой список
============================================================ */

function updateEmptyState() {

    if (leads.length === 0) {

        emptyState.style.display = "block";

        leadsContainer.style.display = "none";

    }

    else {

        emptyState.style.display = "none";

        leadsContainer.style.display = "grid";

    }

}


/* ============================================================
   Добавить лид в память
============================================================ */

function addLeadToMemory(lead) {

    leads.unshift(lead);

}


/* ============================================================
   Найти лид
============================================================ */

function findLead(id) {

    return leads.find(lead => lead.id == id);

}


/* ============================================================
   Удалить лид из памяти

   Пока не используется,
   но пригодится, если захотим
   добавить кнопку удаления.
============================================================ */

function removeLead(id) {

    leads = leads.filter(
        lead => lead.id != id
    );

}


/* ============================================================
   Сохранить в localStorage

   Используется как резервное
   хранилище.

============================================================ */

function saveLocal() {

    localStorage.setItem(

        "crm_leads",

        JSON.stringify(leads)

    );

}


/* ============================================================
   Загрузить localStorage

============================================================ */

function loadLocal() {

    const data =
        localStorage.getItem("crm_leads");


    if (!data) {

        leads = [];

        return;

    }


    try {

        leads = JSON.parse(data);

    }

    catch {

        leads = [];

    }

}
/* ============================================================
   Сохранение лида

   Если API_URL указан —
   сохраняем в Google Sheets.

   Иначе используем localStorage.

============================================================ */

async function saveLead(lead) {

    if (API_URL.trim() === "") {

        saveLeadLocal(lead);

        return;

    }

    try {

    await fetch(API_URL, {

        method:"POST",

        mode:"no-cors",

        headers:{

        "Content-Type":"text/plain"

    },

    body:JSON.stringify({

        action:"create",

        lead:lead

    })

});


    }

    catch (error) {

        console.warn("Google Sheets недоступен.");

        saveLeadLocal(lead);

    }

}


/* ============================================================
   Обновление лида

============================================================ */

async function updateLead(lead) {

    saveLocal();

    if (API_URL.trim() === "") {

        return;

    }

    try {

        await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                action: "update",

                lead: lead

            })

        });

    }

    catch (error) {

        console.warn("Не удалось обновить Google Sheets.");

    }

}


/* ============================================================
   Загрузка лидов

============================================================ */

async function loadLeads() {

    if (API_URL.trim() === "") {

        loadLocal();

        renderAllLeads();

        updateCounter();

        updateEmptyState();

        return;

    }

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {

            throw new Error();

        }

        leads = await response.json();

        saveLocal();

    }

    catch (error) {

        console.warn("Используется localStorage.");

        loadLocal();

    }

    renderAllLeads();

    updateCounter();

    updateEmptyState();

}


/* ============================================================
   Локальное сохранение

============================================================ */

function saveLeadLocal(lead) {

    const stored = localStorage.getItem("crm_leads");

    let list = [];

    if (stored) {

        try {

            list = JSON.parse(stored);

        }

        catch {

            list = [];

        }

    }

    list.unshift(lead);

    localStorage.setItem(

        "crm_leads",

        JSON.stringify(list)

    );

}


/* ============================================================
   Обновление localStorage

============================================================ */

function updateLocalStorage() {

    localStorage.setItem(

        "crm_leads",

        JSON.stringify(leads)

    );

}


/* ============================================================
   Обновление после смены этапа

============================================================ */

async function updateLead(lead) {

    updateLocalStorage();

    if (API_URL.trim() === "") {

        return;

    }

    try {

        await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                action: "update",

                lead: lead

            })

        });

    }

    catch (error) {

        console.warn(error);

    }

}


/* ============================================================
   Восстановление данных после перезагрузки

============================================================ */

window.addEventListener("load", async () => {

    await loadLeads();

});


/* ============================================================
   Enter в форме

============================================================ */

document.addEventListener("keydown", function (event) {

    if (

        event.key === "Enter" &&

        document.activeElement.tagName !== "TEXTAREA"

    ) {

        const formElement = document.activeElement.form;

        if (formElement === form) {

            event.preventDefault();

            form.requestSubmit();

        }

    }

});


/* ============================================================
   Очистка ошибок при вводе

============================================================ */

nameInput.addEventListener("input", clearError);

phoneInput.addEventListener("input", clearError);


/* ============================================================
   Конец файла

============================================================ */