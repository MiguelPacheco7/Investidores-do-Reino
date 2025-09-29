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

// Atualização automática do ano no rodapé
document.getElementById("copyright-year").textContent =
  new Date().getFullYear();

// Lógica para carregar estados e cidades do Brasil (API do IBGE)
document.addEventListener("DOMContentLoaded", () => {
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
});
