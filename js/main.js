
"use strict";

// ======================================================
// GARAGEM ESTÉTICA AUTOMOTIVA
// Arquivo: js/main.js
// ======================================================

// Número do WhatsApp: código do país + DDD + número.
// Altere se necessário, mantendo somente os números.
const WHATSAPP = "5511965020297";

document.addEventListener("DOMContentLoaded", () => {
  // Seletores auxiliares
  const $ = (seletor, contexto = document) =>
    contexto.querySelector(seletor);

  const $$ = (seletor, contexto = document) =>
    Array.from(contexto.querySelectorAll(seletor));

  const reduzirMovimento = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ======================================================
  // ANO AUTOMÁTICO NO RODAPÉ
  // ======================================================

  const ano = $("#ano");

  if (ano) {
    ano.textContent = new Date().getFullYear();
  }

  // ======================================================
  // WHATSAPP
  // ======================================================

  const gerarLinkWhatsApp = (mensagem) => {
    const numero = WHATSAPP.replace(/\D/g, "");

    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  };

  $$("[data-wa]").forEach((link) => {
    const mensagem = link.dataset.wa;

    if (!mensagem) return;

    link.href = gerarLinkWhatsApp(mensagem);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });

  // ======================================================
  // CABEÇALHO AO ROLAR A PÁGINA
  // ======================================================

  const header = $("header");

  if (header) {
    const atualizarCabecalho = () => {
      header.classList.toggle("scrolled", window.scrollY > 30);
    };

    atualizarCabecalho();

    let aguardandoFrame = false;

    window.addEventListener(
      "scroll",
      () => {
        if (aguardandoFrame) return;

        aguardandoFrame = true;

        window.requestAnimationFrame(() => {
          atualizarCabecalho();
          aguardandoFrame = false;
        });
      },
      { passive: true }
    );
  }

  // ======================================================
  // MENU PARA CELULAR
  // ======================================================

  const burger = $("#burger");
  const menu = $("#menu");

  const definirMenu = (aberto) => {
    if (!burger || !menu) return;

    menu.classList.toggle("open", aberto);

    burger.setAttribute("aria-expanded", String(aberto));
    burger.setAttribute(
      "aria-label",
      aberto ? "Fechar menu" : "Abrir menu"
    );

    burger.textContent = aberto ? "✕" : "☰";
  };

  if (burger && menu) {
    burger.addEventListener("click", () => {
      const aberto = !menu.classList.contains("open");
      definirMenu(aberto);
    });

    // Fecha o menu depois de clicar em um link.
    $$("a", menu).forEach((link) => {
      link.addEventListener("click", () => {
        definirMenu(false);
      });
    });

    // Fecha o menu com a tecla Escape.
    document.addEventListener("keydown", (evento) => {
      if (
        evento.key === "Escape" &&
        menu.classList.contains("open")
      ) {
        definirMenu(false);
        burger.focus();
      }
    });

    // Fecha o menu ao voltar para a versão desktop.
    window.addEventListener("resize", () => {
      if (window.innerWidth > 850) {
        definirMenu(false);
      }
    });
  }

  // ======================================================
  // ANIMAÇÕES AO ENTRAR NA TELA
  // ======================================================

  const elementosAnimados = $$(".reveal");

  if (
    "IntersectionObserver" in window &&
    !reduzirMovimento
  ) {
    const observador = new IntersectionObserver(
      (entradas, observer) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("in");
            observer.unobserve(entrada.target);
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    elementosAnimados.forEach((elemento) => {
      observador.observe(elemento);
    });
  } else {
    elementosAnimados.forEach((elemento) => {
      elemento.classList.add("in");
    });
  }

  // ======================================================
  // FORMULÁRIO DE ORÇAMENTO
  // ======================================================

  const form = $("#form");
  const status = $("#status");
  const campoNome = $("#nome");
  const campoTelefone = $("#tel");
  const campoServico = $("#servico");
  const campoCarro = $("#carro");

  const regras = {
    nome: (valor) =>
      valor.trim().length >= 3 ||
      "Digite seu nome (mínimo de 3 caracteres).",

    tel: (valor) =>
      valor.replace(/\D/g, "").length >= 10 &&
      valor.replace(/\D/g, "").length <= 13
        ? true
        : "Digite um telefone válido com DDD.",

    servico: (valor) =>
      valor !== "" || "Escolha um serviço.",

    carro: (valor) =>
      valor.trim().length >= 2 ||
      "Informe o modelo do veículo.",
  };

  function mostrarErro(campo, mensagem) {
    if (!campo) return;

    const mensagemErro = $(
      `[data-for="${campo.name}"]`
    );

    campo.classList.toggle("invalid", Boolean(mensagem));

    campo.setAttribute(
      "aria-invalid",
      String(Boolean(mensagem))
    );

    if (mensagemErro) {
      mensagemErro.textContent = mensagem || "";
    }
  }

  function validarCampo(campo) {
    if (!campo || !regras[campo.name]) {
      return true;
    }

    const resultado = regras[campo.name](campo.value);
    const valido = resultado === true;

    mostrarErro(campo, valido ? "" : resultado);

    return valido;
  }

  function limparStatus() {
    if (status) {
      status.textContent = "";
    }
  }

  if (form) {
    const campos = $$("input, select", form);

    // Validação enquanto o usuário preenche os campos.
    campos.forEach((campo) => {
      campo.addEventListener("input", () => {
        limparStatus();

        if (campo.classList.contains("invalid")) {
          validarCampo(campo);
        }
      });

      campo.addEventListener("change", () => {
        validarCampo(campo);
      });

      campo.addEventListener("blur", () => {
        if (campo.value.trim() !== "") {
          validarCampo(campo);
        }
      });
    });

    // Seleciona o serviço e leva o usuário ao orçamento.
    $$("[data-servico]").forEach((botao) => {
      botao.addEventListener("click", () => {
        if (!campoServico) return;

        const servico = botao.dataset.servico;

        const opcaoExiste = Array.from(
          campoServico.options
        ).some((opcao) => opcao.value === servico);

        if (!opcaoExiste) {
          console.warn(
            "O serviço não existe nas opções do formulário:",
            servico
          );
          return;
        }

        campoServico.value = servico;

        validarCampo(campoServico);

        // Destaca somente o card do serviço escolhido.
        $$("#cards .card").forEach((card) => {
          card.classList.remove("sel");
        });

        const card = botao.closest(".card");

        if (card) {
          card.classList.add("sel");
        }

        const orcamento = $("#orcamento");

        if (orcamento) {
          orcamento.scrollIntoView({
            behavior: reduzirMovimento ? "auto" : "smooth",
            block: "start",
          });
        }

        window.setTimeout(() => {
          if (campoNome) {
            campoNome.focus({ preventScroll: true });
          }
        }, reduzirMovimento ? 0 : 500);
      });
    });

    // Valida todos os campos antes de abrir o WhatsApp.
    form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      limparStatus();

      const resultados = campos.map((campo) =>
        validarCampo(campo)
      );

      const indiceInvalido = resultados.indexOf(false);

      if (indiceInvalido !== -1) {
        campos[indiceInvalido].focus();

        if (status) {
          status.textContent =
            "Confira os campos destacados antes de continuar.";
        }

        return;
      }

      const dados = new FormData(form);

      const nome = String(dados.get("nome") || "").trim();
      const telefone = String(
        dados.get("tel") || ""
      ).trim();
      const servico = String(
        dados.get("servico") || ""
      ).trim();
      const carro = String(
        dados.get("carro") || ""
      ).trim();

      const mensagem = [
        "Olá! Gostaria de solicitar um orçamento.",
        "",
        `Nome: ${nome}`,
        `Telefone: ${telefone}`,
        `Serviço desejado: ${servico}`,
        `Veículo: ${carro}`,
      ].join("\n");

      const link = gerarLinkWhatsApp(mensagem);

      // Abre o WhatsApp em uma nova aba.
      const novaAba = window.open(
        link,
        "_blank",
        "noopener,noreferrer"
      );

      if (status) {
        status.textContent = novaAba
          ? "Sua mensagem foi preparada para o WhatsApp. Confira e envie por lá."
          : "Não foi possível abrir o WhatsApp automaticamente. Use o botão de WhatsApp do site para continuar.";
      }
    });
  }

  // ======================================================
  // GALERIA: ABRIR E FECHAR IMAGENS
  // ======================================================

  const modal = $("#modal");
  const imagemModal = $("#modalImg");
  const botaoFechar = $("#fechar");

  let ultimoElemento = null;

  function abrirImagem(imagem, botao) {
    if (!modal || !imagemModal || !imagem) return;

    ultimoElemento = botao;

    imagemModal.src = imagem.currentSrc || imagem.src;
    imagemModal.alt = imagem.alt || "Imagem ampliada da galeria";

    modal.classList.add("open");
    document.body.style.overflow = "hidden";

    if (botaoFechar) {
      botaoFechar.focus();
    }
  }

  function fecharImagem() {
    if (!modal || !modal.classList.contains("open")) {
      return;
    }

    modal.classList.remove("open");
    document.body.style.overflow = "";

    if (
      ultimoElemento &&
      document.contains(ultimoElemento)
    ) {
      ultimoElemento.focus();
    }

    ultimoElemento = null;
  }

  $$(".gal button").forEach((botao) => {
    botao.addEventListener("click", () => {
      const imagem = $("img", botao);

      abrirImagem(imagem, botao);
    });
  });

  if (botaoFechar) {
    botaoFechar.addEventListener("click", fecharImagem);
  }

  if (modal) {
    modal.addEventListener("click", (evento) => {
      if (evento.target === modal) {
        fecharImagem();
      }
    });
  }

  document.addEventListener("keydown", (evento) => {
    if (
      evento.key === "Escape" &&
      modal &&
      modal.classList.contains("open")
    ) {
      fecharImagem();
    }
  });

  // ======================================================
  // EFEITO SUAVE NOS CARDS COM MOUSE
  // ======================================================

  const suportaInclinacao =
    window.matchMedia("(hover: hover) and (pointer: fine)")
      .matches && !reduzirMovimento;

  if (suportaInclinacao) {
    $$(".card").forEach((card) => {
      let frame = 0;

      card.addEventListener("mousemove", (evento) => {
        window.cancelAnimationFrame(frame);

        frame = window.requestAnimationFrame(() => {
          const retangulo = card.getBoundingClientRect();

          if (!retangulo.width || !retangulo.height) {
            return;
          }

          const x =
            (evento.clientX - retangulo.left) /
              retangulo.width -
            0.5;

          const y =
            (evento.clientY - retangulo.top) /
              retangulo.height -
            0.5;

          card.style.transform =
            `perspective(900px) ` +
            `rotateY(${x * 3}deg) ` +
            `rotateX(${-y * 3}deg) ` +
            `translateY(-2px)`;
        });
      });

      card.addEventListener("mouseleave", () => {
        window.cancelAnimationFrame(frame);
        card.style.transform = "";
      });
    });
  }
});
