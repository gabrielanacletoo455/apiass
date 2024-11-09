<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alfred - Assistente Pessoal</title>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@2.8.2/dist/alpine.js" defer></script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">

    <!-- Container principal -->
    <div class="max-w-4xl mx-auto p-4">

        <!-- Cabeçalho -->
        <header class="text-center mb-6">
            <h1 class="text-4xl font-semibold text-gray-800">Alfred - Assistente Pessoal</h1>
        </header>

        <!-- Botões de ação -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

            <!-- Botão para Verificar o Clima -->
            <button @click="modalTipo = 'clima'; abrirModal()" class="bg-blue-500 text-white p-4 rounded-md shadow hover:bg-blue-600">
                Verificar Clima
            </button>

            <!-- Botão para Registrar Lembrete -->
            <button @click="modalTipo = 'lembrete'; abrirModal()" class="bg-green-500 text-white p-4 rounded-md shadow hover:bg-green-600">
                Registrar Lembrete
            </button>

            <!-- Botão para Enviar E-mail -->
            <button @click="modalTipo = 'email'; abrirModal()" class="bg-yellow-500 text-white p-4 rounded-md shadow hover:bg-yellow-600">
                Enviar E-mail
            </button>

        </div>

    </div>

    <!-- Modal -->
    <div x-show="isOpen" x-cloak @click.away="fecharModal()" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        
        <!-- Conteúdo do Modal -->
        <div class="bg-white p-6 rounded-lg w-11/12 sm:w-1/2 md:w-1/3 shadow-lg">
            
            <div x-show="modalTipo === 'clima'">
                <h2 class="text-2xl mb-4">Previsão do Clima</h2>
                <div id="climaInfo" class="text-sm"></div>
                <button @click="fecharModal()" class="mt-4 bg-red-500 text-white p-2 rounded-md w-full">Fechar</button>
            </div>

            <div x-show="modalTipo === 'lembrete'">
                <h2 class="text-2xl mb-4">Registrar Lembrete</h2>
                <form id="formLembrete">
                    <div class="mb-4">
                        <label for="titulo" class="block text-sm font-semibold">Título:</label>
                        <input type="text" id="titulo" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Título do Lembrete">
                    </div>
                    <div class="mb-4">
                        <label for="descricao" class="block text-sm font-semibold">Descrição:</label>
                        <textarea id="descricao" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Descrição do Lembrete"></textarea>
                    </div>
                    <div class="mb-4">
                        <label for="dataHora" class="block text-sm font-semibold">Data e Hora:</label>
                        <input type="datetime-local" id="dataHora" class="w-full p-2 border border-gray-300 rounded-md">
                    </div>
                    <button type="submit" class="bg-green-500 text-white p-2 rounded-md w-full">Cadastrar Lembrete</button>
                </form>
                <button @click="fecharModal()" class="mt-4 bg-red-500 text-white p-2 rounded-md w-full">Fechar</button>
            </div>

            <div x-show="modalTipo === 'email'">
                <h2 class="text-2xl mb-4">Enviar E-mail</h2>
                <form id="formEmail">
                    <div class="mb-4">
                        <label for="mensagem" class="block text-sm font-semibold">Mensagem:</label>
                        <textarea id="mensagem" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Escreva sua mensagem"></textarea>
                    </div>
                    <div class="mb-4">
                        <label for="assunto" class="block text-sm font-semibold">Assunto:</label>
                        <input type="text" id="assunto" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Assunto do E-mail">
                    </div>
                    <button type="submit" class="bg-yellow-500 text-white p-2 rounded-md w-full">Enviar E-mail</button>
                </form>
                <button @click="fecharModal()" class="mt-4 bg-red-500 text-white p-2 rounded-md w-full">Fechar</button>
            </div>

        </div>
    </div>

    <!-- Script Alpine.js e funções -->
    <script>
        function app() {
            return {
                isOpen: false,
                modalTipo: null,

                abrirModal() {
                    this.isOpen = true;
                    if (this.modalTipo === 'clima') {
                        this.carregarClima();
                    }
                },

                fecharModal() {
                    this.isOpen = false;
                    document.getElementById("formLembrete").reset();
                    document.getElementById("formEmail").reset();
                },

                async carregarClima() {
                    try {
                        const resposta = await axios.get('http://localhost:3000/verificar-clima');
                        document.getElementById('climaInfo').innerText = resposta.data.mensagem;
                    } catch (error) {
                        document.getElementById('climaInfo').innerText = "Não foi possível carregar o clima.";
                    }
                },

                async enviarLembrete(event) {
                    event.preventDefault();
                    const titulo = document.getElementById("titulo").value;
                    const descricao = document.getElementById("descricao").value;
                    const dataHora = document.getElementById("dataHora").value;

                    try {
                        await axios.post('http://localhost:3000/lembretes', { titulo, descricao, dataHora });
                        alert('Lembrete registrado com sucesso!');
                        this.fecharModal();
                    } catch (error) {
                        alert('Erro ao registrar lembrete.');
                    }
                },

                async enviarEmail(event) {
                    event.preventDefault();
                    const mensagem = document.getElementById("mensagem").value;
                    const assunto = document.getElementById("assunto").value;

                    try {
                        await axios.post('http://localhost:3000/enviar-email', { mensagem, assunto });
                        alert('E-mail enviado com sucesso!');
                        this.fecharModal();
                    } catch (error) {
                        alert('Erro ao enviar e-mail.');
                    }
                }
            }
        }
    </script>

</body>
</html>
