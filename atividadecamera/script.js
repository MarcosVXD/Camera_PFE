
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const contexto = canvas.getContext("2d");

const foto = document.getElementById("foto");
const mensagem = document.getElementById("mensagem");
const identificacao = document.getElementById("identificacao");
const filtro = document.getElementById("filtro");

const botaoLigar = document.getElementById("ligar");
const botaoCapturar = document.getElementById("capturar");
const botaoDesligar = document.getElementById("desligar");
const botaoBaixar = document.getElementById("baixar");

const miniaturas = document.getElementById("miniaturas");
const contador = document.getElementById("contador");

let stream = null;
let fotos = [];

async function ligarCamera() {
    try {
        if (stream) {
            return;
        }

        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;
        mensagem.textContent = "Câmera ligada.";
    } catch (erro) {
        mensagem.textContent = "Não foi possível acessar a câmera.";
    }
}

function desligarCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        video.srcObject = null;
    }

    mensagem.textContent = "Câmera desligada.";
}

function capturarFoto() {
    if (!stream || video.readyState < 2) {
        mensagem.textContent = "Ligue a câmera antes de capturar.";
        return;
    }

    const largura = video.videoWidth;
    const altura = video.videoHeight;

    canvas.width = largura;
    canvas.height = altura;

    contexto.filter = filtro.value === "pb"
        ? "grayscale(100%)"
        : "none";

    contexto.drawImage(video, 0, 0, largura, altura);
    contexto.filter = "none";

    if (filtro.value === "negativo") {
        const imagem = contexto.getImageData(0, 0, largura, altura);
        const pixels = imagem.data;

        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = 255 - pixels[i];
            pixels[i + 1] = 255 - pixels[i + 1];
            pixels[i + 2] = 255 - pixels[i + 2];
        }

        contexto.putImageData(imagem, 0, 0);
    }

    const nome = identificacao.value.trim() || "Sem identificação";
    const data = new Date().toLocaleString("pt-BR");

    contexto.fillStyle = "rgba(0, 0, 0, 0.7)";
    contexto.fillRect(0, altura - 55, largura, 55);

    contexto.fillStyle = "#ffffff";
    contexto.font = `${Math.max(16, largura * 0.025)}px Arial`;
    contexto.fillText(nome, 15, altura - 32);
    contexto.fillText(data, 15, altura - 10);

    const imagem = canvas.toDataURL("image/png");

    foto.src = imagem;
    botaoBaixar.disabled = false;

    fotos.push({
        imagem: imagem,
        nome: nome,
        data: data
    });

    atualizarGaleria();

    mensagem.textContent = "Foto capturada com sucesso.";
}

function atualizarGaleria() {
    miniaturas.innerHTML = "";

    contador.textContent = fotos.length === 1
        ? "1 foto capturada."
        : `${fotos.length} fotos capturadas.`;

    fotos.forEach((item, indice) => {
        const card = document.createElement("div");
        card.className = "miniatura";

        const imagem = document.createElement("img");
        imagem.src = item.imagem;
        imagem.alt = `Foto ${indice + 1}`;

        imagem.addEventListener("click", () => {
            foto.src = item.imagem;
            botaoBaixar.disabled = false;
        });

        const descricao = document.createElement("p");
        descricao.textContent = `${item.nome}\n${item.data}`;

        const botao = document.createElement("button");
        botao.textContent = "Baixar foto";

        botao.addEventListener("click", () => {
            baixarImagem(item.imagem, `foto-${indice + 1}.png`);
        });

        card.appendChild(imagem);
        card.appendChild(descricao);
        card.appendChild(botao);

        miniaturas.appendChild(card);
    });
}

function baixarImagem(imagem, nomeArquivo) {
    const link = document.createElement("a");
    link.href = imagem;
    link.download = nomeArquivo;
    link.click();
}

botaoBaixar.addEventListener("click", () => {
    if (foto.src) {
        baixarImagem(foto.src, "foto-capturada.png");
    }
});

botaoLigar.addEventListener("click", ligarCamera);
botaoCapturar.addEventListener("click", capturarFoto);
botaoDesligar.addEventListener("click", desligarCamera);

window.addEventListener("pagehide", desligarCamera);
