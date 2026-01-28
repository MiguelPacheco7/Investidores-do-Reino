// Smooth scroll com Lenis
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothTouch: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Atualização automática do ano no rodapé (esta lógica não precisa do DOMContentLoaded)
document.getElementById("copyright-year").textContent =
  new Date().getFullYear();


// FUNÇÃO ADICIONADA: Anima o contador de números
function animateCounter(element, target) {
  let start = 0;
  const duration = 4500; // 4.5 segundos
  const step = target / (duration / 10); // Valor a ser adicionado a cada 10ms (10ms é o intervalo)

  const counter = setInterval(() => {
    start += step;

    // Lógica para formatação especial (150mil, +45, +50)
    if (target === 150000) {
      if (start >= target) {
        element.textContent = "150mil";
        clearInterval(counter);
      } else {
        // CORRIGIDO: Remove toLocaleString durante a contagem para evitar reflow do ponto de milhar
        element.textContent = Math.floor(start);
      }
    } else {
      // Para os outros números (+45, +50, 600)
      if (start >= target) {
        // Se for um target menor que 100 (45, 50), adiciona o '+' na exibição final
        element.textContent = target >= 100 ? target : `+${target}`;
        clearInterval(counter);
      } else {
        element.textContent = Math.floor(start);
      }
    }
  }, 10);
}

// ------------------------------------------------------------------
// Lógica Principal: Envolve tudo que depende da estrutura do HTML
document.addEventListener("DOMContentLoaded", () => {

  // Lógica para animação de revelação ao rolar (Scroll Reveal E Contador)
  const revealElements = document.querySelectorAll(".scroll-reveal");
  const counterElements = document.querySelectorAll(".counter"); // Seleciona elementos com a classe 'counter'
  let countersAnimated = false; // Flag para garantir que a animação só ocorra uma vez

  const observerOptions = {
    root: null, // observa em relação à viewport
    rootMargin: "0px",
    threshold: 0.1, // aciona quando 10% do elemento estiver visível
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      // -----------------------------------
      // Lógica do Scroll Reveal (já existente)
      // -----------------------------------
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Remove observação de elementos Scroll Reveal após a primeira aparição
        if (!entry.target.id || entry.target.id !== 'numeros') {
          observer.unobserve(entry.target);
        }
      }

      // Lógica do Contador Animado
      // Verifica se a seção 'numeros' (ou seja, o 'entry' atual) está visível
      // E se o contador ainda não foi ativado (usando a flag)
      if (entry.target.id === 'numeros' && entry.isIntersecting && !countersAnimated) {
        counterElements.forEach(el => {
          // Pega o valor final do atributo data-target e converte para número
          // (150000 no caso de "150mil")
          const target = parseInt(el.dataset.target.replace('mil', '000').replace('+', '').trim());
          animateCounter(el, target);
        });
        countersAnimated = true; // Marca como animado para não rodar novamente no scroll
        // Opcional: Para de observar a seção 'numeros' após a animação
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Inicia a observação de todos os elementos para Scroll Reveal
  revealElements.forEach((el) => {
    observer.observe(el);
  });

  // O observer precisa observar a seção 'numeros' especificamente para acionar o contador
  const numerosSection = document.getElementById('numeros');
  if (numerosSection) {
    observer.observe(numerosSection);
  }

  // --- LÓGICA DO CARROSSEL 3D ATUALIZADA (APENAS MANUAL) ---
  const carouselContainers = document.querySelectorAll('.carousel-3d-container, .carousel-3d-container-fotos');

  if (carouselContainers.length > 0) {
    carouselContainers.forEach(container => {
      // Correção no seletor: use querySelector para os tracks específicos de cada container
      const track = container.querySelector('.carousel-3d-track') || container.querySelector('.carousel-3d-fotos-track');
      if (!track) return;

      const slides = Array.from(track.children);
      // Busca os botões dentro do container atual (garanta que os IDs ou classes sejam únicos no HTML)
      const nextButton = container.querySelector('#next-btn') || container.querySelector('#next-btn-fotos');
      const prevButton = container.querySelector('#prev-btn') || container.querySelector('#prev-btn-fotos');

      if (slides.length === 0) return;

      let currentIndex = 0;
      const slideCount = slides.length;
      let touchStartX = 0;
      let touchEndX = 0;
      const swipeThreshold = 50;

      const updateCarousel = () => {
        slides.forEach(slide => slide.classList.remove('active', 'prev', 'next'));

        const prevIndex = (currentIndex - 1 + slideCount) % slideCount;
        const nextIndex = (currentIndex + 1) % slideCount;

        if (slides[currentIndex]) slides[currentIndex].classList.add('active');
        if (slides[prevIndex]) slides[prevIndex].classList.add('prev');
        if (slides[nextIndex]) slides[nextIndex].classList.add('next');
      };

      const goToNext = () => {
        currentIndex = (currentIndex + 1) % slideCount;
        updateCarousel();
      };

      const goToPrev = () => {
        currentIndex = (currentIndex - 1 + slideCount) % slideCount;
        updateCarousel();
      };

      // Eventos de Clique
      if (nextButton) {
        nextButton.addEventListener('click', goToNext);
      }

      if (prevButton) {
        prevButton.addEventListener('click', goToPrev);
      }

      // Lógica de Deslize (Swipe)
      const handleSwipe = () => {
        const swipeDistance = touchEndX - touchStartX;
        if (Math.abs(swipeDistance) > swipeThreshold) {
          if (swipeDistance < 0) {
            goToNext(); // Deslizou para a esquerda
          } else {
            goToPrev(); // Deslizou para a direita
          }
        }
      };

      track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });

      track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
      }, { passive: true });

      // Inicia o estado visual sem disparar o timer
      updateCarousel();
    });
  }

  // --- LÓGICA DO CARROSSEL 3D ATUALIZADA (SEM DESCRIÇÕES) ---
  const carouselContainersFotos = document.querySelectorAll('.carousel-3d-container-fotos');
  if (carouselContainersFotos.length > 0) {
    carouselContainersFotos.forEach(container => {
      const track = container.querySelector('.carousel-3d-fotos-track');
      if (!track) return;

      // Dentro do loop: carouselContainers.forEach(container => { ...
      const slides = Array.from(track.children);

      // CORREÇÃO: Adicionado o ID correto para os botões de vídeo
      const nextButton = container.querySelector('#next-btn') || container.querySelector('#next-btn-video');
      const prevButton = container.querySelector('#prev-btn') || container.querySelector('#prev-btn-video');

      if (slides.length === 0) return;

      let currentIndex = 0;
      const slideCount = slides.length;
      let autoplayInterval = null;
      const AUTOPLAY_DELAY = 5000;
      let touchStartX = 0;
      let touchEndX = 0;
      const swipeThreshold = 50;

      const stopAutoplay = () => {
        clearInterval(autoplayInterval);
      };

      const startAutoplay = () => {
        stopAutoplay();
        autoplayInterval = setInterval(goToNext, AUTOPLAY_DELAY);
      };

      const updateCarousel = () => {
        slides.forEach(slide => slide.classList.remove('active', 'prev', 'next'));

        const prevIndex = (currentIndex - 1 + slideCount) % slideCount;
        const nextIndex = (currentIndex + 1) % slideCount;

        if (slides[currentIndex]) slides[currentIndex].classList.add('active');
        if (slides[prevIndex]) slides[prevIndex].classList.add('prev');
        if (slides[nextIndex]) slides[nextIndex].classList.add('next');
      };

      const goToNext = () => {
        currentIndex = (currentIndex + 1) % slideCount;
        updateCarousel();
      };

      const goToPrev = () => {
        currentIndex = (currentIndex - 1 + slideCount) % slideCount;
        updateCarousel();
      };

      if (nextButton) {
        nextButton.addEventListener('click', () => {
          goToNext();
          startAutoplay();
        });
      }

      if (prevButton) {
        prevButton.addEventListener('click', () => {
          goToPrev();
          startAutoplay();
        });
      }

      container.addEventListener('mouseenter', stopAutoplay);
      container.addEventListener('mouseleave', startAutoplay);

      const handleSwipe = () => {
        const swipeDistance = touchEndX - touchStartX;
        if (Math.abs(swipeDistance) > swipeThreshold) {
          if (swipeDistance < 0) {
            goToNext();
          } else {
            goToPrev();
          }
        }
      };

      track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        stopAutoplay();
      }, { passive: true });

      track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
        startAutoplay();
      });

      // Inicia o carrossel
      updateCarousel();
      startAutoplay();
    });
  }
});