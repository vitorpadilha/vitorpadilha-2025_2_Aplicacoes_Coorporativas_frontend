document.addEventListener("DOMContentLoaded", async function() {
    let parametros = {
        idTabela: 'tabelaEditora',
        url: 'http://localhost:8080/AppCorporativaMavenWeb/editoras',
        colunas: [
            { titulo: 'ID', dado: 'id' },
            { titulo: 'Nome', dado: 'nome' },
        ],
        exibeEditar: true,
        idEnvio: 'id',
        exibeRemover: true,
        urlRemover: 'http://localhost:8080/AppCorporativaMavenWeb/editoras',
        urlEditar: 'formulario.html?id=',
        token: localStorage.getItem("tokenAppCorporativa"),
    };
    await appCorporativa.criarTabela(
        parametros
    );
});