const express = require('express');
const nodemailer = require('nodemailer');
const axios = require('axios');
const cron = require('node-cron');
const { DateTime } = require('luxon');
const cors = require('cors'); // Para habilitar CORS
const path = require('path');


// Configurações do e-mail
const EMAIL_ORIGEM = 'bielbybiel@gmail.com';
const EMAIL_DESTINO = 'gabrielanacleto159@live.com';
const SENHA = 'oxeve-senha-gerada-no-google';  // Substitua pela sua senha de aplicativo

// Configuração da API de previsão do tempo
const API_KEY = 'bd5e378503939ddaee76f12ad7a97608';  // Substitua pela sua chave da API
const CITY = 'Bauru';
const API_URL = `http://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=pt_br`;

// Criar uma instância do Express
const app = express();
const port = 3000;

// Middleware para permitir JSON nos corpos das requisições e CORS
app.use(express.json());
app.use(cors());

// Middleware para servir arquivos estáticos (como index.html)
app.use(express.static(path.join(__dirname)));

// Função para verificar as condições climáticas
async function verificarCondicoesClimaticas() {
    try {
        const resposta = await axios.get(API_URL);
        const data = resposta.data;

        if (resposta.status !== 200) {
            console.log("Alfred: Houve um problema ao obter os dados do tempo, chefe.");
            return null;
        }

        const temperatura = data.main.temp;
        const descricao = data.weather[0].description;
        const vaiChover = descricao.toLowerCase().includes('chuva');

        let mensagem = `Alfred, seu assistente pessoal, trazendo a previsão do tempo para ${CITY}:\n\n`;
        if (temperatura > 33) {
            mensagem += "Alfred: Vai estar muuuito acima da temperatura que você gosta, chefe! Temperatura prevista acima de 33°C.\n";
        } else if (temperatura > 30) {
            mensagem += "Alfred: A temperatura estará um pouco acima do confortável hoje, mais de 30°C.\n";
        } else if (temperatura < 27) {
            mensagem += "Alfred: Ótimas notícias, chefe! A temperatura estará agradável hoje, abaixo de 27°C.\n";
        } else {
            mensagem += "Alfred: A temperatura está dentro do normal.\n";
        }

        if (vaiChover) {
            mensagem += "Alfred: Previsão de chuva, senhor. Não se esqueça do guarda-chuva!\n";
        }

        mensagem += `\nTemperatura atual: ${temperatura}°C\nCondições: ${descricao.charAt(0).toUpperCase() + descricao.slice(1)}`;
        return mensagem;
    } catch (error) {
        console.log("Alfred: Houve um erro ao acessar a API do tempo.", error);
        return null;
    }
}

// Função para enviar o e-mail
function enviarEmail(mensagem, assunto = "Notificação do Alfred") {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_ORIGEM,
            pass: SENHA,
        }
    });

    const mailOptions = {
        from: EMAIL_ORIGEM,
        to: EMAIL_DESTINO,
        subject: assunto,
        text: mensagem
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(`Alfred: Houve um erro ao enviar o e-mail, chefe: ${error}`);
        } else {
            console.log(`Alfred: E-mail enviado com sucesso! ${info.response}`);
        }
    });
}

// Função de saudação
function saudacao() {
    const horaAtual = DateTime.local().hour;
    if (horaAtual >= 5 && horaAtual < 12) {
        return "Bom dia senhor.";
    } else if (horaAtual >= 12 && horaAtual < 18) {
        return "Boa tarde senhor.";
    } else {
        return "Boa noite senhor.";
    }
}

// Endpoint para verificar o clima
app.get('/verificar-clima', async (req, res) => {
    const mensagemClima = await verificarCondicoesClimaticas();
    if (mensagemClima) {
        res.status(200).send({ mensagem: mensagemClima });
    } else {
        res.status(500).send({ mensagem: 'Não foi possível obter as informações climáticas.' });
    }
});

// Endpoint para enviar um e-mail manualmente
app.post('/enviar-email', (req, res) => {
    const { mensagem, assunto } = req.body;
    enviarEmail(mensagem, assunto);
    res.status(200).send({ mensagem: 'E-mail enviado com sucesso!' });
});

// Agendamento com cron (executa a cada hora)
cron.schedule('0 * * * *', async () => {
    const saudacaoMensagem = saudacao();
    console.log(saudacaoMensagem);

    const mensagemClima = await verificarCondicoesClimaticas();
    if (mensagemClima) {
        enviarEmail(mensagemClima);
        console.log(mensagemClima);
    }
});

// Inicialização da API
app.listen(port, () => {
    console.log(`Alfred operando na porta ${port}`);
});
