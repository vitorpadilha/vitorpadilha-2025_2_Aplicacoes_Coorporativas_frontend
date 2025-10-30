document.addEventListener("DOMContentLoaded", async function() {
    let parametros = {
        idFormulario: 'formEditora',
        colunas: [
            { titulo: 'ID', dado: 'id', tipo: 'oculto', obrigatorio: false },
            { titulo: 'Nome', dado: 'nome', tipo: 'textoCurto', obrigatorio: true },
        ],
        urlCadastrar: 'http://localhost:8080/AppCorporativaMavenWeb/editoras',
        urlEditar: 'http://localhost:8080/AppCorporativaMavenWeb/editoras',
        urlCargaDados: 'http://localhost:8080/AppCorporativaMavenWeb/editoras/id=',
    };
    appCorporativa.criarFormulario(
        parametros
    );

});
