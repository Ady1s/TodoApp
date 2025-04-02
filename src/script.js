let currentDate = new Date(); // Aktuální datum
let selectedDate; // Vybrané datum pro přidání události
let calendarDays = JSON.parse(localStorage.getItem('calendar') || '{}'); // Načte uložené události nebo vytvoří prázdný objekt

const currentMonthElement = document.getElementById('currentMonth'); // Prvek pro zobrazení názvu měsíce
const daysElement = document.getElementById('days'); // Prvek pro zobrazení dnů
const eventModal = document.getElementById('eventModal'); // Modální okno pro přidání události
const modalDateElement = document.getElementById('modalDate'); // Prvek pro zobrazení data v modálním okně
const modalEvents = document.getElementById('modalEvents'); // Prvek pro zobrazení událostí v modálním okně
const modalEventTimeInput = document.getElementById('modalEventTime'); // Pole pro zadání času události v modálním okně
const modalEventTextInput = document.getElementById('modalEventText'); // Pole pro zadání textu události v modálním okně
const modalSaveEventButton = document.getElementById('modalSaveEvent'); // Tlačítko pro uložení události v modálním okně
const modalCloseButton = eventModal.querySelector('.close'); // Tlačítko pro zavření modálního okna
const prevMonthButton = document.getElementById('prevMonth'); // Tlačítko pro předchozí měsíc
const nextMonthButton = document.getElementById('nextMonth'); // Tlačítko pro další měsíc

function renderCalendar() {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // První den aktuálního měsíce
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(); // Počet dní v aktuálním měsíci
    const startingDay = firstDayOfMonth.getDay(); // Den v týdnu, kterým začíná měsíc

    currentMonthElement.textContent = currentDate.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' }); // Zobrazí název měsíce
    daysElement.innerHTML = ''; // Vymaže obsah dnů

    for (let i = 0; i < startingDay; i++) { // Vytvoří prázdné obdélníčky pro dny před prvním dnem měsíce
        const emptyDay = document.createElement('div');
        daysElement.appendChild(emptyDay);
    }

    for (let i = 1; i <= daysInMonth; i++) { // Vytvoří obdélníčky pro každý den v měsíci
        const dayElement = document.createElement('div');
        dayElement.textContent = i.toString(); // Zobrazí číslo dne jako text
        dayElement.classList.add('day'); // Přidá třídu pro stylování dne

        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i); // Datum pro aktuální den
        if (calendarDays[dayDate.toISOString().split('T')[0]]) { // Pokud má den událost, přidá třídu has-event
            dayElement.classList.add('has-event');
        }

        dayElement.addEventListener('click', () => { // Přidá reakci na kliknutí na den
            selectedDate = dayDate; // Uloží vybrané datum
            showModal(); // Zobrazí modální okno
        });

        daysElement.appendChild(dayElement); // Přidá den do kalendáře
    }
}

function renderEvents() {
    modalEvents.innerHTML = ''; // Vymaže události v modálním okně
    if (selectedDate && calendarDays[selectedDate.toISOString().split('T')[0]]) { // Pokud je vybrané datum a má události
        const events = calendarDays[selectedDate.toISOString().split('T')[0]]; // Načte události pro vybrané datum
        events.forEach((event, index) => { // Pro každou událost
            const eventElement = document.createElement('div'); // Vytvoří prvek pro zobrazení události
            eventElement.classList.add('event-item'); // Přidá třídu pro stylování události
            eventElement.innerHTML = `<span>${event.time} - ${event.text}</span> <button data-index="${index}">×</button>`; // Zobrazí čas a text události a tlačítko pro smazání
            modalEvents.appendChild(eventElement); // Přidá událost do modálního okna
        });
    }
}

function showModal() {
    modalDateElement.textContent = selectedDate.toLocaleDateString('cs-CZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); // Zobrazí datum v modálním okně
    renderEvents(); // Zobrazí události v modálním okně
    eventModal.style.display = 'block'; // Zobrazí modální okno
}

function hideModal() {
    eventModal.style.display = 'none'; // Skryje modální okno
}

function saveEvent() {
    const time = modalEventTimeInput.value; // Načte čas události z formuláře
    const text = modalEventTextInput.value; // Načte text události z formuláře

    if (time && text) { // Pokud jsou čas i text zadané
        const dateString = selectedDate.toISOString().split('T')[0]; // Datum ve formátu YYYY-MM-DD
        if (!calendarDays[dateString]) { // Pokud pro dané datum neexistuje záznam událostí
            calendarDays[dateString] = []; // Vytvoří prázdné pole pro události
        }
        calendarDays[dateString].push({ time, text }); // Přidá událost do pole událostí
        localStorage.setItem('calendar', JSON.stringify(calendarDays)); // Uloží události do prohlížeče
        renderEvents(); // Zobrazí události v modálním okně
        modalEventTimeInput.value = ''; // Vymaže čas z formuláře
        modalEventTextInput.value = ''; // Vymaže text z formuláře
    }
}

function deleteEvent(index) {
    const dateString = selectedDate.toISOString().split('T')[0]; // Datum ve formátu YYYY-MM-DD
    calendarDays[dateString].splice(index, 1); // Odstraní událost z pole událostí
    localStorage.setItem('calendar', JSON.stringify(calendarDays)); // Uloží události do prohlížeče
    renderEvents(); // Zobrazí události v modálním okně
}

prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1); // Nastaví aktuální datum na předchozí měsíc
    renderCalendar(); // Aktualizuje kalendář
});

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1); // Nastaví aktuální datum na další měsíc
    renderCalendar(); // Aktualizuje kalendář
});

modalSaveEventButton.addEventListener('click', saveEvent); // Přidá reakci na kliknutí na tlačítko pro uložení události
modalCloseButton.addEventListener('click', hideModal); // Přidá reakci na kliknutí na tlačítko pro zavření modálního okna
modalEvents.addEventListener('click', (event) => { // Přidá reakci na kliknutí na událost v modálním okně
    if (event.target.tagName === 'BUTTON') { // Pokud byl kliknutý prvek tlačítko
        deleteEvent(event.target.dataset.index); // Odstraní událost
    }
});

renderCalendar(); // Spustí funkci pro zobrazení kalendáře