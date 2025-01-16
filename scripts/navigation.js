// Script para el movimiento entre secciones

const sectionsContainer = document.querySelector('.sections');
const buttons = document.querySelectorAll('.button');

// Elementos de audio
const hoverSound = new Audio('sfx/hover.mp3');
const clickSound = new Audio('sfx/click.mp3');
const switchSound = new Audio('sfx/littleclick.mp3');
const bigClickSound = new Audio('sfx/bigclick.mp3');

// Scroll
sectionsContainer.style.scrollBehavior = 'smooth';
sectionsContainer.style.scrollTimingFunction = 'ease';
sectionsContainer.style.scrollDuration = '100ms';

let lastActiveButton = null;

// Activar el primer botón por defecto
const defaultButton = document.getElementById('informacion-basica');
defaultButton.classList.add('active');
lastActiveButton = defaultButton;

buttons.forEach(button => {
    // Evento hover
    button.addEventListener('mouseenter', () => {
        hoverSound.currentTime = 0;
        hoverSound.play();
    });

    // Evento click
    button.addEventListener('click', () => {
        if (lastActiveButton) {
            lastActiveButton.classList.remove('active');
        }
        
        clickSound.currentTime = 0;
        clickSound.play();

        button.classList.add('active');
        lastActiveButton = button;

        const sectionId = button.id;
        
        const sectionIndex = Array.from(sectionsContainer.children)
            .findIndex(section => section.classList.contains(sectionId));
        
        const scrollPosition = sectionIndex * sectionsContainer.clientWidth;
        
        sectionsContainer.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    });
});

/* Navegación portada-contenido */

// Navegación portada-contenido
const firstBlock = document.querySelector('.first-block');
const blockColumn = document.querySelector('.block-column');
const topHover = document.querySelector('.top-hover');

firstBlock.addEventListener('click', () => {
    const blockHeight = firstBlock.offsetHeight;
    
    bigClickSound.currentTime = 0;
    bigClickSound.play();
    
    blockColumn.style.transition = 'transform 0.55s ease';
    blockColumn.style.transform = `translateY(-${blockHeight}px)`;
});

topHover.addEventListener('click', () => {
    const blockHeight = firstBlock.offsetHeight;
    
    bigClickSound.currentTime = 0;
    bigClickSound.play();
    
    blockColumn.style.transition = 'transform 0.55s ease';
    blockColumn.style.transform = `translateY(0)`;
});

// Script de datos/stats
document.addEventListener('DOMContentLoaded', () => {
    const switchButton = document.querySelector('.switch');
    const statsElement = document.querySelector('.informacion-basica .stats');
    const dataContent = document.querySelectorAll('.informacion-basica .data span:not(.stats)');

    if (switchButton && statsElement && dataContent) {
        switchButton.addEventListener('click', () => {
            switchSound.currentTime = 0;
            switchSound.play();
            
            const isShowingStats = getComputedStyle(statsElement).display === 'flex';
            
            if (isShowingStats) {
                statsElement.style.display = 'none';
                dataContent.forEach(span => span.style.display = 'block');
                switchButton.textContent = 'Stats';
            } else {
                statsElement.style.display = 'flex';
                dataContent.forEach(span => span.style.display = 'none');
                switchButton.textContent = 'Datos';
            }
        });
    }
});