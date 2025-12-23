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

  // ... (Mantenha o código do Lenis, Counter e Observer acima como estava) ...

  // ------------------------------------------------------------------
  // CARROSSEL INFINITO SEC-4 (Mobile)
  // ------------------------------------------------------------------
  const track = document.getElementById('carousel-track');
  const btnPrev = document.getElementById('carousel-prev');
  const btnNext = document.getElementById('carousel-next');

  if (track && btnPrev && btnNext) {
    // 1. Configurações
    const autoPlayDelay = 4500; // Tempo mais lento (4.5 segundos) entre slides
    let autoPlayInterval;
    let isScrolling = false;

    // 2. Lógica de Clonagem Infinita
    // Clonamos os itens para criar [Original] + [Original] + [Original]
    // Isso garante espaço suficiente para rolar sem bater na parede
    const items = Array.from(track.children);
    
    // Clona 2 vezes para garantir buffer suficiente
    items.forEach(item => {
      const cloneEnd = item.cloneNode(true);
      track.appendChild(cloneEnd); // Adiciona ao final
    });
    items.forEach(item => {
      const cloneEnd2 = item.cloneNode(true);
      track.appendChild(cloneEnd2); // Adiciona mais uma vez ao final
    });

    // Agora temos 9 itens (3 originais x 3 conjuntos). 
    // Largura de um item + gap (assumindo gap-4 = 16px)
    // Precisamos recalcular isso dinamicamente pois o CSS define largura em %
    const getItemWidth = () => track.firstElementChild.offsetWidth + 16; 

    // 3. Função de Scroll Controlado
    const moveCarousel = (direction) => {
      const itemWidth = getItemWidth();
      if (direction === 'next') {
        track.scrollBy({ left: itemWidth, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: -itemWidth, behavior: 'smooth' });
      }
    };

    // 4. Reset "Invisível" do Loop
    // Verifica se chegamos muito perto do fim ou do começo e "teletransporta"
    const checkInfiniteLoop = () => {
      if (isScrolling) return;

      const itemWidth = getItemWidth();
      const maxScroll = track.scrollWidth - track.clientWidth;
      const totalSets = 3; // Temos 3 conjuntos de itens
      const singleSetWidth = (track.scrollWidth / totalSets); 

      // Se passou de 2/3 do caminho (fim do segundo set), volta para o final do primeiro set
      if (track.scrollLeft >= (singleSetWidth * 2) - 50) { 
        track.classList.add('disable-scroll-behavior'); // Desliga animação
        track.scrollLeft -= singleSetWidth; // Pula para trás instantaneamente
        track.classList.remove('disable-scroll-behavior'); // Religa animação
      }
      // Se está muito no começo (tentando voltar do inicio), joga para o meio
      else if (track.scrollLeft <= 50) {
        track.classList.add('disable-scroll-behavior');
        track.scrollLeft += singleSetWidth;
        track.classList.remove('disable-scroll-behavior');
      }
    };

    // 5. Event Listeners
    btnNext.addEventListener('click', () => {
      moveCarousel('next');
      resetAutoPlay();
    });

    btnPrev.addEventListener('click', () => {
      moveCarousel('prev');
      resetAutoPlay();
    });

    // Detecta o fim do scroll para fazer a verificação do loop infinito
    track.addEventListener('scroll', () => {
      // Usamos um pequeno timeout para não sobrecarregar e checar apenas quando o movimento 'quase' parar
      clearTimeout(isScrolling);
      isScrolling = setTimeout(() => {
        isScrolling = false;
        checkInfiniteLoop();
      }, 50); // Checa 50ms após o evento de scroll
    });

    // 6. Autoplay (Passar Devagar)
    const startAutoPlay = () => {
      stopAutoPlay(); // Garante que não tenha duplos
      autoPlayInterval = setInterval(() => {
        // Verifica se o usuário não está tocando na tela
        if (!track.matches(':hover') && !track.matches(':active')) { 
           moveCarousel('next');
        }
      }, autoPlayDelay);
    };

    const stopAutoPlay = () => clearInterval(autoPlayInterval);
    
    const resetAutoPlay = () => {
      stopAutoPlay();
      startAutoPlay();
    };

    // Inicia e gerencia interrupções (toque do usuário)
    track.addEventListener('touchstart', stopAutoPlay, { passive: true });
    track.addEventListener('touchend', startAutoPlay);
    
    // Centraliza o carrossel no "meio" (Set 2) ao carregar a página
    // Para permitir rolagem para esquerda e direita desde o início
    window.addEventListener('load', () => {
        track.classList.add('disable-scroll-behavior');
        const singleSetWidth = (track.scrollWidth / 3);
        track.scrollLeft = singleSetWidth; // Começa no segundo set
        track.classList.remove('disable-scroll-behavior');
        startAutoPlay();
    });
  }
});