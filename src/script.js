let currentDate = new Date();
let selectedDate;
let calendarDays = JSON.parse(localStorage.getItem('calendar') || '{}');
let editingIndex = null;

const currentMonthElement = document.getElementById('currentMonth');
const daysElement = document.getElementById('days');
const eventModal = document.getElementById('eventModal');
const modalDateElement = document.getElementById('modalDate');
const modalEvents = document.getElementById('modalEvents');
const modalEventTimeInput = document.getElementById('modalEventTime');
const modalEventTextInput = document.getElementById('modalEventText');
const modalEventColorInput = document.getElementById('modalEventColor');
const modalEventRepeatInput = document.getElementById('modalEventRepeat');
const modalEventIconInput = document.getElementById('modalEventIcon');
const modalSaveEventButton = document.getElementById('modalSaveEvent');
const modalCloseButton = eventModal.querySelector('.close');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const upcomingEventsList = document.getElementById('upcomingEventsList');
const dailyEventsList = document.getElementById('dailyEventsList');

function renderCalendar() {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const startingDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
    const today = new Date().toISOString().split('T')[0];

    currentMonthElement.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    daysElement.innerHTML = '';

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    weekDays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        dayElement.classList.add('day');
        daysElement.appendChild(dayElement);
    });

    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        daysElement.appendChild(emptyDay);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = i.toString();
        dayElement.classList.add('day');

        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        updateDayElement(dayElement, dayDate);

        if (dayDate.toISOString().split('T')[0] === today) {
            dayElement.classList.add('today');
        }

        dayElement.addEventListener('click', () => {
            selectedDate = dayDate;
            showModal();
            renderDailyEvents();
        });

        daysElement.appendChild(dayElement);
    }
}

function updateDayElement(dayElement, date) {
    const dateString = date.toISOString().split('T')[0];
    if (calendarDays[dateString] && calendarDays[dateString].length > 0) {
        dayElement.classList.add('has-event');
    } else {
        dayElement.classList.remove('has-event');
    }
}

function renderEvents() {
    modalEvents.innerHTML = '';
    if (selectedDate && calendarDays[selectedDate.toISOString().split('T')[0]]) {
        const events = calendarDays[selectedDate.toISOString().split('T')[0]];
        events.forEach((event, index) => {
            const eventElement = document.createElement('div');
            eventElement.classList.add('event-item');
            eventElement.innerHTML = `<span style="color: ${event.color};">${event.icon === 'none' ? '' : event.icon + ': '} ${event.time} - ${event.text} (${event.repeat})</span> <button data-index="${index}">×</button> <button data-edit="${index}">✎</button>`;
            modalEvents.appendChild(eventElement);
        });
    }
}

function showModal() {
    modalDateElement.textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    renderEvents();
    eventModal.style.display = 'flex';
    editingIndex = null;
    modalEventTimeInput.value = '';
    modalEventTextInput.value = '';
    modalEventColorInput.value = '#000000';
    modalEventRepeatInput.value = 'once';
    modalEventIconInput.value = 'none';
}

function hideModal() {
    eventModal.style.display = 'none';
}

function saveEvent() {
    const time = modalEventTimeInput.value;
    const text = modalEventTextInput.value;
    const color = modalEventColorInput.value;
    const repeat = modalEventRepeatInput.value;
    const icon = modalEventIconInput.value;

    if (time && text) {
        const dateString = selectedDate.toISOString().split('T')[0];
        if (!calendarDays[dateString]) {
            calendarDays[dateString] = [];
        }
        if (editingIndex !== null) {
            calendarDays[dateString][editingIndex] = { time, text, color, repeat, icon };
        } else {
            calendarDays[dateString].push({ time, text, color, repeat, icon });
        }
        localStorage.setItem('calendar', JSON.stringify(calendarDays));
        renderEvents();
        updateDayElement(document.querySelector(`.day:nth-child(${selectedDate.getDate() + getStartingDay() + 7})`), selectedDate);
        modalEventTimeInput.value = '';
        modalEventTextInput.value = '';
        modalEventColorInput.value = '#000000';
        modalEventRepeatInput.value = 'once';
        modalEventIconInput.value = 'none';
        editingIndex = null;
    }
    renderUpcomingEvents();
}

function deleteEvent(index) {
    const dateString = selectedDate.toISOString().split('T')[0];
    calendarDays[dateString].splice(index, 1);
    localStorage.setItem('calendar', JSON.stringify(calendarDays));
    renderEvents();
    updateDayElement(document.querySelector(`.day:nth-child(${selectedDate.getDate() + getStartingDay() + 7})`), selectedDate);
    renderUpcomingEvents();
}

function getStartingDay() {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() === 0 ? 6 : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() - 1;
}

function renderUpcomingEvents() {
    upcomingEventsList.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];
    const upcoming = Object.keys(calendarDays)
        .filter(date => date >= today)
        .sort();

    upcoming.forEach(date => {
        const events = calendarDays[date];
        events.forEach((event, index) => {
            const eventElement = document.createElement('div');
            eventElement.classList.add('upcoming-event-item');
            eventElement.innerHTML = `<span style="color: ${event.color};">${event.icon === 'none' ? '' : event.icon + ': '} <strong>${date}</strong>: ${event.time} - ${event.text}</span> <button data-date="${date}" data-index="${index}">×</button>`;
            if (date === today) {
                eventElement.style.backgroundColor = "#fff3cd";
            }
            upcomingEventsList.appendChild(eventElement);
        });
    });
}

function renderDailyEvents() {
    dailyEventsList.innerHTML = '';
    if (selectedDate && calendarDays[selectedDate.toISOString().split('T')[0]]) {
        const events = calendarDays[selectedDate.toISOString().split('T')[0]];
        events.forEach((event) => {
            const eventElement = document.createElement('div');
            eventElement.innerHTML = `<span style="color: ${event.color};">${event.icon === 'none' ? '' : event.icon + ': '} ${event.time} - ${event.text}</span>`;
            dailyEventsList.appendChild(eventElement);
        });
    }
}

upcomingEventsList.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        const date = event.target.dataset.date;
        const index = parseInt(event.target.dataset.index);
        deleteEventFromUpcoming(date, index);
    }
});

function deleteEventFromUpcoming(date, index) {
    calendarDays[date].splice(index, 1);
    if (calendarDays[date].length === 0) {
        delete calendarDays[date];
    }
    localStorage.setItem('calendar', JSON.stringify(calendarDays));
    renderUpcomingEvents();
    renderCalendar();
}

prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    renderUpcomingEvents();
});

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    renderUpcomingEvents();
});

modalSaveEventButton.addEventListener('click', saveEvent);
modalCloseButton.addEventListener('click', hideModal);
modalEvents.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        if (event.target.dataset.index) {
            deleteEvent(event.target.dataset.index);
        } else if (event.target.dataset.edit) {
            editingIndex = parseInt(event.target.dataset.edit);
            const dateString = selectedDate.toISOString().split('T')[0];
            const eventData = calendarDays[dateString][editingIndex];
            modalEventTimeInput.value = eventData.time;
            modalEventTextInput.value = eventData.text;
            modalEventColorInput.value = eventData.color;
            modalEventRepeatInput.value = eventData.repeat;
            modalEventIconInput.value = eventData.icon;
        }
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        hideModal();
    }
});

renderCalendar();
renderUpcomingEvents();