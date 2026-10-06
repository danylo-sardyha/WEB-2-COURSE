document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mainNav = document.getElementById('main-nav');

    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            // Перемикаємо клас для відкриття/закриття меню
            mainNav.classList.toggle('nav--open');
            
            // Змінюємо іконку бургера на хрестик і навпаки
            const icon = hamburgerBtn.querySelector('i');
            if (mainNav.classList.contains('nav--open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
});