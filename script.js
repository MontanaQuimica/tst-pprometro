let valorEbitdaGlobal = 0;
let valorTaxaSindicatoGlobal = 75;
let tabelaIRGlobal = [];

// ================================
// Carregar dados iniciais da API
// ================================
async function carregarDadosIniciais() {
  try {
    const res = await fetch("http://localhost:5000/");
    const dados = await res.json();

    if (dados.valorEbitda !== undefined) {
      valorEbitdaGlobal = parseFloat(dados.valorEbitda) || 0;
      const campoEbitda = document.getElementById("valorEbitda");
      if (campoEbitda) campoEbitda.innerText = valorEbitdaGlobal.toFixed(2) + "%";
      const inputEbitda = document.getElementById("percentualEbitida");
      if (inputEbitda) inputEbitda.value = valorEbitdaGlobal.toFixed(2);
    }

    if (dados.valorTaxaSindicato !== undefined) {
      valorTaxaSindicatoGlobal = parseFloat(dados.valorTaxaSindicato) || 75;
      const campoTaxa = document.getElementById("taxa");
      if (campoTaxa) campoTaxa.innerText = formataEmReal(valorTaxaSindicatoGlobal);
      const inputTaxa = document.getElementById("taxaSindicato");
      if (inputTaxa) inputTaxa.value = formataEmReal(valorTaxaSindicatoGlobal);
    }

    if (dados.tabelaIR) {
      tabelaIRGlobal = dados.tabelaIR;
      const tabelaInputs = document.querySelectorAll("#tabelaIR input");
      tabelaInputs.forEach((input, i) => {
        if (dados.tabelaIR[i] !== undefined) input.value = dados.tabelaIR[i];
      });
    }
  } catch (err) {
    console.error("Erro ao carregar dados iniciais:", err);
  }
}

// ================================
// Toggle Edit para EBITDA e Taxa
// ================================
function toggleEdit(buttonId, inputId, storageKey, isPercent = false) {
  const button = document.getElementById(buttonId);
  const input = document.getElementById(inputId);
  if (!button || !input) return;

  button.addEventListener("click", async () => {
    const isReadonly = input.hasAttribute("readonly");

    if (isReadonly) {
      input.removeAttribute("readonly");
      input.focus();
      button.textContent = "Salvar";
      button.classList.remove("btn-warning");
      button.classList.add("btn-success");
    } else {
      input.setAttribute("readonly", true);
      button.textContent = "Alterar";
      button.classList.remove("btn-success");
      button.classList.add("btn-warning");

      let valor = input.value.replace(/[^\d,]/g, "").replace(",", ".");
      valor = parseFloat(valor) || 0;

      // Atualiza a variável global
      if (storageKey === "valorEbitda") valorEbitdaGlobal = valor;
      if (storageKey === "valorTaxaSindicato") valorTaxaSindicatoGlobal = valor;

      // Salva no servidor
      try {
        await fetch("http://localhost:5000/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [storageKey]: valor })
        });
      } catch (err) {
        console.error("Erro ao salvar dado:", err);
      }

      // Atualiza o campo visual
      if (storageKey === "valorTaxaSindicato") {
        document.getElementById("taxa").innerText = formataEmReal(valor);
      }
      if (storageKey === "valorEbitda") {
        document.getElementById("valorEbitda").innerText = valor.toFixed(2) + "%";
      }
    }
  });
}

// ================================
// Editar Tabela IR
// ================================
function editarTabela() {
  const btnEditarTabela = document.getElementById("btnEditarTabela");
  const tabelaInputs = document.querySelectorAll("#tabelaIR input");

  btnEditarTabela.addEventListener("click", async () => {
    const isDisabled = tabelaInputs[0].disabled;

    if (isDisabled) {
      tabelaInputs.forEach((input) => input.removeAttribute("disabled"));
      btnEditarTabela.textContent = "Salvar Tabela";
      btnEditarTabela.classList.remove("btn-warning");
      btnEditarTabela.classList.add("btn-success");
    } else {
      const novosValores = [];
      tabelaInputs.forEach((input) => {
        input.setAttribute("disabled", true);
        novosValores.push(input.value);
      });

      tabelaIRGlobal = novosValores;

      try {
        await fetch("http://localhost:5000/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tabelaIR: novosValores })
        });
        alert("Tabela de IR atualizada com sucesso!");
      } catch (err) {
        console.error("Erro ao salvar tabela:", err);
      }

      btnEditarTabela.textContent = "Alterar Tabela";
      btnEditarTabela.classList.remove("btn-success");
      btnEditarTabela.classList.add("btn-warning");
    }
  });
}

// ================================
// Funções Auxiliares
// ================================
function getValorEbitda() {
  return valorEbitdaGlobal;
}

function getValorTaxaSindicato() {
  return valorTaxaSindicatoGlobal;
}

function formataEmReal(valorNaoFormatado) {
  return (valorNaoFormatado || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formataPercentual(valorNaoFormatado) {
  return valorNaoFormatado.toFixed(2);
}

function transformarEmNumero(valorString) {
  return parseFloat(valorString.replace(/\./g, "").replace(",", ".")) || 0;
}

function calcularPercentual(valorPontos) {
  return valorPontos;
}

// ================================
// Função Principal do Formulário
// ================================
function enviaForm(form) {
  const ebitida = getValorEbitda();
  document.getElementById("valorEbitda").innerText = ebitida.toFixed(2) + "%";

  const salario = transformarEmNumero(form.salario.value);
  const mesesTrabalhados = transformarEmNumero(form.qtdMesesTrabalhado.value);
  const recebePericulosidade = form.recebePeri.value;
  const multiploCargos = form.multiploCargos.value;
  const recebeComissao = form.selectComissao.value;
  const valorPontos = transformarEmNumero(form.valorPontos.value);
  const percentualIndividual = transformarEmNumero(
    form.percIndividual.value.replace("%", "")
  );

  let salarioComPericulosidade = "";
  if (recebePericulosidade === "sim") {
    salarioComPericulosidade = salario + (salario * 30) / 100;
  }

  let valorComissao = "";
  if (recebeComissao === "sim") {
    valorComissao = transformarEmNumero(form.comissao.value);
  }

  let baseCalculoPPR = salario;
  if (valorComissao && salarioComPericulosidade) {
    baseCalculoPPR = valorComissao + salarioComPericulosidade;
  } else if (salarioComPericulosidade) {
    baseCalculoPPR = salarioComPericulosidade;
  } else if (valorComissao) {
    baseCalculoPPR = salario + valorComissao;
  }

  if (multiploCargos == 1.1) baseCalculoPPR *= 1.1;
  if (multiploCargos == 2.3) baseCalculoPPR *= 2.3;
  if (multiploCargos == 3) baseCalculoPPR *= 3.3;

  // Cálculos dinâmicos
  let metaFixaIndividual = (ebitida * 30) / 100;
  let metaUnidade = (ebitida * 60) / 100;

  let valorMetaIndividual = calculoMetasIndividuaisPPR(percentualIndividual, metaFixaIndividual);
  let valorAvComportamental = calculaAvaliacaoComportamental(
    document.getElementById("perIndividual").value.replace("%", "")
  );
  let valorPercentualPPR = calculoPercentualPPR(valorMetaIndividual, valorPontos, metaUnidade);
  let valorRealPPRSemIR =
    calculoPPRSemIR(baseCalculoPPR, valorPercentualPPR / 12) * mesesTrabalhados;
  let deducaoIR = calculoDeducaoDeIR(valorRealPPRSemIR);
  let valorIR = deducaoIR ? calculoValorIR(valorRealPPRSemIR) : 0;
  let valorLiquido = valorRealPPRSemIR;
  let valorSimulado = valorLiquido - valorIR;
  let taxa = getValorTaxaSindicato();
  let valorFinal = valorSimulado > 0 ? valorSimulado - taxa : 0;

  // Exibir no HTML
  document.getElementById("valorCalculadoPericulosidade").innerHTML =
    formataEmReal(salarioComPericulosidade || 0);
  document.getElementById("valorBaseCalculoPPR").innerHTML =
    formataEmReal(baseCalculoPPR);
  document.getElementById("aliquotaIr").innerHTML =
    formataPercentual(deducaoIR.percentualIr) + "%";
  document.getElementById("deducaoIR").innerHTML = formataEmReal(
    deducaoIR.resultadoDeducao
  );
  document.getElementById("valorMetasIndividuais").innerHTML =
    formataPercentual(metaFixaIndividual) + "%";
  document.getElementById("idpercentualAvaliacaocompor").innerHTML =
    formataPercentual(valorAvComportamental) + "%";
  document.getElementById("percetualMetaIndividual").innerHTML =
    formataPercentual(valorMetaIndividual) + "%";
  document.getElementById("baseCalculoMetaCoporativa").innerHTML =
    formataPercentual(metaUnidade) + "%";
  document.getElementById("percentualPPR").innerHTML =
    formataPercentual(valorPercentualPPR) + "%";
  document.getElementById("baseCalculoSemIr").innerHTML =
    formataEmReal(valorRealPPRSemIR);
  document.getElementById("totalIR").innerHTML = formataEmReal(valorIR);
  document.getElementById("liquidoPPR").innerHTML = formataEmReal(valorLiquido);
  document.getElementById("valorSimulado").innerHTML =
    formataEmReal(valorSimulado);
  document.getElementById("taxa").innerHTML = formataEmReal(taxa);
  document.getElementById("valorFinal").innerHTML = formataEmReal(valorFinal);
}

// ================================
// Funções de cálculo
// ================================
function calculoDeducaoDeIR(baseDeCalculo) {
  if (baseDeCalculo <= 7640.5) return { percentualIr: 0, resultadoDeducao: 0 };
  if (baseDeCalculo <= 9922.28) return { percentualIr: 7.5, resultadoDeducao: 573.06 };
  if (baseDeCalculo <= 13167.0) return { percentualIr: 15, resultadoDeducao: 1317.23 };
  if (baseDeCalculo <= 16380.38) return { percentualIr: 22.5, resultadoDeducao: 2304.76 };
  return { percentualIr: 27.5, resultadoDeducao: 3123.78 };
}

function calculoMetasIndividuaisPPR(meta, metaFixaIndividual) {
  let axuPerc = document.getElementById("perIndividual").value.replace("%", "");
  if (meta >= metaFixaIndividual && axuPerc >= 70) {
    return (meta * metaFixaIndividual) / 100;
  }
  return 0;
}

function calculaAvaliacaoComportamental() {
  let percentualPontos =
    document.getElementById("porcetagemPontos").value.replace("%", "") || 0;
  return (getValorEbitda() * percentualPontos) / 100;
}

function calculoPercentualPPR(valorMetaIndividual, valorPontos, metaUnidade) {
  const avaliacao = calcularPercentual(valorPontos);
  const pontosAvaliacao = (getValorEbitda() * avaliacao) / 100;
  return valorMetaIndividual + metaUnidade + pontosAvaliacao;
}

function calculoPPRSemIR(baseCalculoPPR, valorPercentualPPR) {
  return (baseCalculoPPR * valorPercentualPPR) / 100;
}

function calculoValorIR(salarioSemIR) {
  const { percentualIr, resultadoDeducao } = calculoDeducaoDeIR(salarioSemIR);
  return (salarioSemIR * percentualIr) / 100 - resultadoDeducao;
}

// ================================
// Limpar formulário
// ================================
function limpaCampos() {
  document.getElementById("salario").value = "";
  document.getElementById("mesesTrabalhado").value = "0";
  document.getElementById("recebePeri").value = "";
  document.getElementById("multiploCargos").value = "1";
  document.getElementById("selectComissao").value = "";
  document.getElementById("comissao").value = "";
  document.getElementById("valorPontos").value = "0";
  document.getElementById("porcetagemPontos").value = "";
  document.getElementById("perIndividual").value = "";
}

// ================================
// Inicialização
// ================================
document.addEventListener("DOMContentLoaded", () => {
  carregarDadosIniciais();
  toggleEdit("btnEditarEbitda", "percentualEbitida", "valorEbitda", true);
  toggleEdit("btnEditarTaxa", "taxaSindicato", "valorTaxaSindicato");
  editarTabela();

  const selectPontos = document.getElementById("valorPontos");
  if (selectPontos) {
    selectPontos.addEventListener("change", (event) => {
      const valor = event.target.value;
      const percentualPontos = calcularPercentual(valor);
      document.getElementById("porcetagemPontos").value = percentualPontos + "%";
    });
  }

  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      enviaForm(form);
      limpaCampos();
    });
  }
});