let currentDate = new Date(); // Vytvoří proměnnou currentDate a uloží do ní aktuální datum
let selectedDate; // Vytvoří proměnnou selectedDate pro uložení vybraného data
let calendarDays = JSON.parse(localStorage.getItem('calendar') || '{}'); // Načte události z localStorage nebo vytvoří prázdný objekt
let editingIndex = null; // Vytvoří proměnnou editingIndex pro uložení indexu upravované události

const currentMonthElement = document.getElementById('currentMonth'); // Získá element s ID currentMonth
const daysElement = document.getElementById('days'); // Získá element s ID days
const eventModal = document.getElementById('eventModal'); // Získá element s ID eventModal
const modalDateElement = document.getElementById('modalDate'); // Získá element s ID modalDate
const modalEvents = document.getElementById('modalEvents'); // Získá element s ID modalEvents
const modalEventTimeInput = document.getElementById('modalEventTime'); // Získá element s ID modalEventTime
const modalEventTextInput = document.getElementById('modalEventText'); // Získá element s ID modalEventText
const modalEventColorInput = document.getElementById('modalEventColor'); // Získá element s ID modalEventColor
const modalEventRepeatInput = document.getElementById('modalEventRepeat'); // Získá element s ID modalEventRepeat
const modalEventIconInput = document.getElementById('modalEventIcon'); // Získá element s ID modalEventIcon
const modalSaveEventButton = document.getElementById('modalSaveEvent'); // Získá element s ID modalSaveEvent
const modalCloseButton = eventModal.querySelector('.close'); // Získá element s třídou close uvnitř eventModal
const prevMonthButton = document.getElementById('prevMonth'); // Získá element s ID prevMonth
const nextMonthButton = document.getElementById('nextMonth'); // Získá element s ID nextMonth
const upcomingEventsList = document.getElementById('upcomingEventsList'); // Získá element s ID upcomingEventsList
const dailyEventsList = document.getElementById('dailyEventsList'); // Získá element s ID dailyEventsList

function renderCalendar() {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // Získá první den aktuálního měsíce
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(); // Získá počet dní v aktuálním měsíci
    const startingDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // Získá den v týdnu, kterým začíná měsíc
    const today = new Date().toISOString().split('T')[0]; // Získá aktuální datum ve formátu YYYY-MM-DD

    currentMonthElement.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); // Nastaví text elementu currentMonth na aktuální měsíc a rok
    daysElement.innerHTML = ''; // Vymaže obsah elementu days

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Vytvoří pole s názvy dnů v týdnu
    weekDays.forEach(day => { // Pro každý den v týdnu
        const dayElement = document.createElement('div'); // Vytvoří nový div element
        dayElement.textContent = day; // Nastaví text elementu na název dne
        dayElement.classList.add('day'); // Přidá elementu třídu day
        daysElement.appendChild(dayElement); // Přidá element do elementu days
    });

    for (let i = 0; i < startingDay; i++) { // Pro každý prázdný den na začátku měsíce
        const emptyDay = document.createElement('div'); // Vytvoří prázdný div element
        daysElement.appendChild(emptyDay); // Přidá element do elementu days
    }

    for (let i = 1; i <= daysInMonth; i++) { // Pro každý den v měsíci
        const dayElement = document.createElement('div'); // Vytvoří nový div element
        dayElement.textContent = i.toString(); // Nastaví text elementu na číslo dne
        dayElement.classList.add('day'); // Přidá elementu třídu day

        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i); // Vytvoří datum pro aktuální den
        updateDayElement(dayElement, dayDate); // Aktualizuje vzhled elementu dne

        if (dayDate.toISOString().split('T')[0] === today) { // Pokud je aktuální den dnešní
            dayElement.classList.add('today'); // Přidá elementu třídu today
        }

        dayElement.addEventListener('click', () => { // Při kliknutí na den
            selectedDate = dayDate; // Nastaví vybrané datum
            showModal(); // Zobrazí modální okno
            renderDailyEvents(); // Vykreslí události pro daný den
        });

        daysElement.appendChild(dayElement); // Přidá element do elementu days
    }
}

function updateDayElement(dayElement, date) {
    const dateString = date.toISOString().split('T')[0]; // Získá datum ve formátu YYYY-MM-DD
    if (calendarDays[dateString] && calendarDays[dateString].length > 0) { // Pokud pro daný den existují události
        dayElement.classList.add('has-event'); // Přidá elementu třídu has-event
    } else {
        dayElement.classList.remove('has-event'); // Odebere elementu třídu has-event
    }
}

function renderEvents() {
    modalEvents.innerHTML = ''; // Vymaže obsah elementu modalEvents
    if (selectedDate && calendarDays[selectedDate.toISOString().split('T')[0]]) { // Pokud je vybrané datum a existují pro něj události
        const events = calendarDays[selectedDate.toISOString().split('T')[0]]; // Získá události pro daný den
        events.forEach((event, index) => { // Pro každou událost
            const eventElement = document.createElement('div'); // Vytvoří nový div element
            eventElement.classList.add('event-item'); // Přidá elementu třídu event-item
            eventElement.innerHTML = `<span style="color: ${event.color};">${event.icon === 'none' ? '' : event.icon + ': '} ${event.time} - ${event.text} (${event.repeat})</span> <button data-index="${index}">×</button> <button data-edit="${index}">✎</button>`; // Nastaví obsah elementu události
            modalEvents.appendChild(eventElement); // Přidá element události do elementu modalEvents
        });
    }
}

function showModal() {
    modalDateElement.textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); // Nastaví text elementu modalDate na vybrané datum
    renderEvents(); // Vykreslí události v modálním okně
    eventModal.style.display = 'flex'; // Zobrazí modální okno
    editingIndex = null; // Resetuje index upravované události
    modalEventTimeInput.value = ''; // Resetuje čas události
    modalEventTextInput.value = ''; // Resetuje text události
    modalEventColorInput.value = '#000000'; // Resetuje barvu události
    modalEventRepeatInput.value = 'once'; // Resetuje opakování události
    modalEventIconInput.value = 'none'; // Resetuje ikonu události
}

function hideModal() {
    eventModal.style.display = 'none'; // Skryje modální okno
}

function saveEvent() {
    const time = modalEventTimeInput.value; // Získá čas události z formuláře
    const text = modalEventTextInput.value; // Získá text události z formuláře
    const color = modalEventColorInput.value; // Získá barvu události z formuláře
    const repeat = modalEventRepeatInput.value; // Získá opakování události z formuláře
    const icon = modalEventIconInput.value; // Získá ikonu události z formuláře

    if (time && text) { // Pokud je čas a text události vyplněn
        const dateString = selectedDate.toISOString().split('T')[0]; // Získá datum ve formátu YYYY-MM-DD
        if (!calendarDays[dateString]) { // Pokud pro daný den neexistují události
            calendarDays[dateString] = []; // Vytvoří prázdné pole pro události
        }
        if (editingIndex !== null) { // Pokud se upravuje existující událost
            calendarDays[dateString][editingIndex] = { time, text, color, repeat, icon }; // Aktualizuje událost
        } else { // Pokud se přidává nová událost
            calendarDays[dateString].push({ time, text, color, repeat, icon }); // Přidá událost do pole událostí
        }
        localStorage.setItem('calendar', JSON.stringify(calendarDays)); // Uloží události do localStorage
        renderEvents(); // Vykreslí události v modálním okně
        updateDayElement(document.querySelector(`.day:nth-child(${selectedDate.getDate() + getStartingDay() + 7})`), selectedDate); // Aktualizuje vzhled elementu dne
        modalEventTimeInput.value = ''; // Resetuje čas události
        modalEventTextInput.value = ''; // Resetuje text události
        modalEventColorInput.value = '#000000'; // Resetuje barvu události
        modalEventRepeatInput.value = 'once'; // Resetuje opakování události
        modalEventIconInput.value = 'none'; // Resetuje ikonu události
        editingIndex = null; // Resetuje index upravované události
    }
    renderUpcomingEvents(); // Vykreslí nadcházející události
}

function deleteEvent(index) {
    const dateString = selectedDate.toISOString().split('T')[0]; // Získá datum ve formátu YYYY-MM-DD
    calendarDays[dateString].splice(index, 1); // Odstraní událost z pole událostí
    localStorage.setItem('calendar', JSON.stringify(calendarDays)); // Uloží události do localStorage
    renderEvents(); // Vykreslí události v modálním okně
    updateDayElement(document.querySelector(`.day:nth-child(${selectedDate.getDate() + getStartingDay() + 7})`), selectedDate); // Aktualizuje vzhled elementu dne
    renderUpcomingEvents(); // Vykreslí nadcházející události
}

function getStartingDay() {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() === 0 ? 6 : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() - 1; // Získá den v týdnu, kterým začíná měsíc
}

function renderUpcomingEvents() {
    upcomingEventsList.innerHTML = ''; // Vymaže obsah elementu upcomingEventsList
    const today = new Date().toISOString().split('T')[0]; // Získá aktuální datum ve formátu YYYY-MM-DD
    const upcoming = Object.keys(calendarDays) // Získá klíče (data) z objektu calendarDays
        .filter(date => date >= today) // Filtruje data, která jsou rovna nebo větší než dnešní datum
        .sort(); // Seřadí data vzestupně

    upcoming.forEach(date => { // Pro každé nadcházející datum
        const events = calendarDays[date]; // Získá události pro dané datum
        events.forEach((event, index) => { // Pro každou událost
            const eventElement = document.createElement('div'); // Vytvoří nový div element
            eventElement.classList.add('upcoming-event-item'); // Přidá elementu třídu upcoming-event-item
            eventElement.innerHTML = `<span style="color: ${event.color};">${event.icon === 'none' ? '' : event.icon + ': '} <strong>${date}</strong>: ${event.time} - ${event.text}</span> <button data-date="${date}" data-index="${index}">×</button>`; // Nastaví obsah elementu události
            if (date === today) { // Pokud je datum dnešní
                eventElement.style.backgroundColor = "#fff3cd"; // Nastaví pozadí elementu na žlutou
            }
            upcomingEventsList.appendChild(eventElement); // Přidá element události do elementu upcomingEventsList
        });
    });
}

function renderDailyEvents() {
    dailyEventsList.innerHTML = ''; // Vymaže obsah elementu dailyEventsList
    if (selectedDate && calendarDays[selectedDate.toISOString().split('T')[0]]) { // Pokud je vybrané datum a existují pro něj události
        const events = calendarDays[selectedDate.toISOString().split('T')[0]]; // Získá události pro daný den
        events.forEach((event) => { // Pro každou událost
            const eventElement = document.createElement('div'); // Vytvoří nový div element
            eventElement.innerHTML = `<span style="color: ${event.color};">${event.icon === 'none' ? '' : event.icon + ': '} ${event.time} - ${event.text}</span>`; // Nastaví obsah elementu události
            dailyEventsList.appendChild(eventElement); // Přidá element události do elementu dailyEventsList
        });
    }
}

upcomingEventsList.addEventListener('click', (event) => { // Při kliknutí na element upcomingEventsList
    if (event.target.tagName === 'BUTTON') { // Pokud byl kliknutý element tlačítko
        const date = event.target.dataset.date; // Získá datum z datového atributu tlačítka
        const index = parseInt(event.target.dataset.index); // Získá index události z datového atributu tlačítka
        deleteEventFromUpcoming(date, index); // Odstraní událost z nadcházejících událostí
    }
});

function deleteEventFromUpcoming(date, index) {
    calendarDays[date].splice(index, 1); // Odstraní událost z pole událostí
    if (calendarDays[date].length === 0) { // Pokud pro dané datum neexistují žádné události
        delete calendarDays[date]; // Odstraní datum z objektu calendarDays
    }
    localStorage.setItem('calendar', JSON.stringify(calendarDays)); // Uloží události do localStorage
    renderUpcomingEvents(); // Vykreslí nadcházející události
    renderCalendar(); // Vykreslí kalendář
}

prevMonthButton.addEventListener('click', () => { // Při kliknutí na tlačítko předchozí měsíc
    currentDate.setMonth(currentDate.getMonth() - 1); // Nastaví aktuální datum na předchozí měsíc
    renderCalendar(); // Vykreslí kalendář
    renderUpcomingEvents(); // Vykreslí nadcházející události
});

nextMonthButton.addEventListener('click', () => { // Při kliknutí na tlačítko další měsíc
    currentDate.setMonth(currentDate.getMonth() + 1); // Nastaví aktuální datum na další měsíc
    renderCalendar(); // Vykreslí kalendář
    renderUpcomingEvents(); // Vykreslí nadcházející události
});

modalSaveEventButton.addEventListener('click', saveEvent); // Při kliknutí na tlačítko uložit událost
modalCloseButton.addEventListener('click', hideModal); // Při kliknutí na tlačítko zavřít modální okno
modalEvents.addEventListener('click', (event) => { // Při kliknutí na element modalEvents
    if (event.target.tagName === 'BUTTON') { // Pokud byl kliknutý element tlačítko
        if (event.target.dataset.index) { // Pokud má tlačítko datový atribut index
            deleteEvent(event.target.dataset.index); // Odstraní událost
        } else if (event.target.dataset.edit) { // Pokud má tlačítko datový atribut edit
            editingIndex = parseInt(event.target.dataset.edit); // Nastaví index upravované události
            const dateString = selectedDate.toISOString().split('T')[0]; // Získá datum ve formátu YYYY-MM-DD
            const eventData = calendarDays[dateString][editingIndex]; // Získá data upravované události
            modalEventTimeInput.value = eventData.time; // Nastaví čas události ve formuláři
            modalEventTextInput.value = eventData.text; // Nastaví text události ve formuláři
            modalEventColorInput.value = eventData.color; // Nastaví barvu události ve formuláři
            modalEventRepeatInput.value = eventData.repeat; // Nastaví opakování události ve formuláři
            modalEventIconInput.value = eventData.icon; // Nastaví ikonu události ve formuláři
        }
    }
});

document.addEventListener('keydown', (event) => { // Při stisknutí klávesy
    if (event.key === 'Escape') { // Pokud byla stisknuta klávesa Escape
        hideModal(); // Skryje modální okno
    }
});

renderCalendar(); // Vykreslí kalendář
renderUpcomingEvents(); // Vykreslí nadcházející události