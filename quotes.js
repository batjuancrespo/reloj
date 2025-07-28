// Quotes module
const quotes = [
    { text: "La vida no es la que uno vivió, sino la que uno recuerda y cómo la recuerda para contarla.", author: "Gabriel García Márquez" },
    { text: "En la vida no hay nada que temer, solo hay que comprender.", author: "Marie Curie" },
    { text: "La creatividad es la inteligencia divirtiéndose.", author: "Albert Einstein" },
    { text: "El secreto de la existencia no consiste solamente en vivir, sino en saber para qué se vive.", author: "Fiódor Dostoievski" },
    { text: "La verdadera sabiduría está en reconocer la propia ignorancia.", author: "Sócrates" },
    { text: "El tiempo es el mejor autor: siempre encuentra un final perfecto.", author: "Charles Chaplin" },
    { text: "La paciencia es amarga, pero sus frutos son dulces.", author: "Jean-Jacques Rousseau" },
    { text: "La educación es el arma más poderosa que puedes usar para cambiar el mundo.", author: "Nelson Mandela" },
    { text: "No hay camino para la paz, la paz es el camino.", author: "Mahatma Gandhi" },
    { text: "El único modo de hacer un gran trabajo es amar lo que haces.", author: "Steve Jobs" }
];

export function updateQuote() {
    const contentWrapper = document.querySelector('#quote-section .quote-content');
    const quoteTextEl = document.querySelector('.quote-text');
    const quoteAuthorEl = document.querySelector('.quote-author');

    // Remove animation class to reset it
    contentWrapper.classList.remove('animate');
    // Trigger reflow to restart animation
    void contentWrapper.offsetWidth;

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    quoteTextEl.textContent = '"' + randomQuote.text + '"';
    quoteAuthorEl.textContent = '- ' + randomQuote.author;

    // Add animation class to re-trigger
    contentWrapper.classList.add('animate');
}

