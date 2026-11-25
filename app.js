
// Emojis del memorama
const emojis = ['🐶', '🐱', '🍎', '🍌', '⚽', '🚗', '⭐', '🎮'];

let cards = [...emojis, ...emojis];
let firstCard = null;
let secondCard = null;
let lock = false;
let startTime, timerInterval;

// Mezclar las tarjetas
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Iniciar cronometro
function startTimer() {
    startTime = Date.now();

    timerInterval = setInterval(() => {
        const diff = Math.floor((Date.now() - startTime) / 1000);

        document.getElementById('timer').textContent =
            formatTime(diff);
    }, 1000);
}

// Detener cronometro
function stopTimer() {
    clearInterval(timerInterval);
}

// Formato del tiempo
function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');

    return `${m}:${s}`;
}

// Guardar el mejor tiempo
function saveBestTime(time) {
    const best = localStorage.getItem('bestTime');

    if (best === null || time < Number(best)) {
        localStorage.setItem('bestTime', time);

        document.getElementById('bestTime').textContent =
            formatTime(time);
    }
}

// Crear el tablero
function setupGame() {
    const board = document.getElementById('gameBoard');

    board.innerHTML = '';

    const shuffled = shuffle(cards);

    shuffled.forEach((emoji, index) => {
        const div = document.createElement('div');

        div.classList.add('card');
        div.dataset.emoji = emoji;
        div.dataset.index = index;

        div.addEventListener('click', flipCard);

        board.appendChild(div);
    });

    firstCard = secondCard = null;
    lock = false;

    startTimer();
}

// Voltear las tarjetas
function flipCard(e) {
    const card = e.currentTarget;

    if (lock || card.classList.contains('flipped')) {
        return;
    }

    card.textContent = card.dataset.emoji;
    card.classList.add('flipped');

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    lock = true;

    // Comprobar si las tarjetas coinciden
    if (firstCard.dataset.emoji === secondCard.dataset.emoji) {

        firstCard = secondCard = null;
        lock = false;

        // Comprobar si el jugador gano
        if (document.querySelectorAll('.flipped').length === cards.length) {

            stopTimer();

            const time = Math.floor((Date.now() - startTime) / 1000);

            document.getElementById('timer').textContent =
                formatTime(time);

            saveBestTime(time);

            setTimeout(() => {
                alert('¡Ganaste!');
            }, 300);
        }

    } else {

        // Ocultar tarjetas diferentes
        setTimeout(() => {

            firstCard.textContent = '';
            secondCard.textContent = '';

            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');

            firstCard = secondCard = null;
            lock = false;

        }, 1000);
    }
}

// Cargar el juego
document.addEventListener('DOMContentLoaded', () => {

    const best = localStorage.getItem('bestTime');

    if (best !== null) {
        document.getElementById('bestTime').textContent =
            formatTime(Number(best));
    }

    setupGame();
});

// Registrar Service Worker
if ('serviceWorker' in navigator) {

    navigator.serviceWorker.register('./service-worker.js')
        .then(() => console.log('Service Worker registrado'))
        .catch(err => console.error('Error SW:', err));
}

// Instalacion manual de la PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {

    e.preventDefault();
    deferredPrompt = e;

    const btn = document.getElementById('btnInstall');

    btn.style.display = 'inline-block';

    btn.addEventListener('click', async () => {

        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const choiceResult = await deferredPrompt.userChoice;

        console.log('Resultado:', choiceResult.outcome);

        deferredPrompt = null;
        btn.style.display = 'none';
    });
});
