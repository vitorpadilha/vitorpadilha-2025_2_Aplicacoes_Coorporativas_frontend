document.addEventListener("DOMContentLoaded", async function() {
    let parametros = {
        idTabela: 'tabelaLivro',
        url: 'http://localhost:8080/AppCorporativaMavenWeb/livros',
        colunas: [
            { titulo: 'ID', dado: 'id' },
            { titulo: 'Título', dado: 'titulo' },
            { titulo: 'Autores', dado: 'autores' },
            { titulo: 'Editora', dado: 'editora.nome' },
            { titulo: 'Ano de Publicação', dado: 'anoPublicacao' },
        ],
        exibeEditar: true,
        idEnvio: 'id',
        exibeRemover: true,
        urlRemover: 'http://localhost:8080/AppCorporativaMavenWeb/livros',
        urlEditar: 'formulario.html?id=',
        token: localStorage.getItem("tokenAppCorporativa")
    };
    await appCorporativa.criarTabela(
        parametros
    );
});