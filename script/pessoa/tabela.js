document.addEventListener("DOMContentLoaded", async function() {
    let parametros = {
        idTabela: 'tabelaPessoa',
        url: 'http://localhost:8080/pessoas',
        colunas: [
            { titulo: 'ID', dado: 'id' },
            { titulo: 'Nome', dado: 'nome', sortable: true },
            { titulo: 'CPF', dado: 'cpf', tipo: "cpf" },
            { titulo: 'Nascimento', dado: 'dataNascimento', tipo: "data" }
        ],
        exibeEditar: true,
        idEnvio: 'id',
        exibeRemover: true,
        urlNovoCadastro: 'formulario.html',
        urlRemover: 'http://localhost:8080/pessoas',
        urlEditar: 'formulario.html?id=',
        tamanhoPagina: 2,
        token: localStorage.getItem("tokenAppCorporativa")
    };
    await appCorporativa.criarTabela(
        parametros
    );
});