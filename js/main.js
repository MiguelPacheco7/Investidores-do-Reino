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
        element.textContent = Math.floor(start).toLocaleString('pt-BR');
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
// ------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================
  // 1. Lógica para carregar estados e cidades do Brasil (API do IBGE)
  // ==========================================================
  const estadoSelect = document.getElementById("estado");
  const cidadeSelect = document.getElementById("cidade");

  // Carregar estados
  fetch(
    "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
  )
    .then((res) => res.json())
    .then((estados) => {
      estados.forEach((estado) => {
        const option = document.createElement("option");
        option.value = estado.sigla;
        option.textContent = estado.nome;
        estadoSelect.appendChild(option);
      });
    });

  // Carregar cidades quando um estado é selecionado
  estadoSelect.addEventListener("change", () => {
    const uf = estadoSelect.value;
    cidadeSelect.innerHTML =
      '<option value="" disabled selected>Carregando cidades...</option>';
    cidadeSelect.disabled = true;

    if (uf) {
      fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
      )
        .then((res) => res.json())
        .then((cidades) => {
          cidadeSelect.innerHTML =
            '<option value="" disabled selected>Selecione sua cidade</option>';
          cidades.forEach((cidade) => {
            const option = document.createElement("option");
            option.value = cidade.nome;
            option.textContent = cidade.nome;
            cidadeSelect.appendChild(option);
          });
          cidadeSelect.disabled = false;
        });
    }
  });

  // ==========================================================
  // 2. Lógica para animação de revelação ao rolar (Scroll Reveal E Contador)
  // ==========================================================
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

      // -----------------------------------
      // Lógica do Contador Animado
      // -----------------------------------
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
});