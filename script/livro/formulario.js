document.addEventListener("DOMContentLoaded", async function() {
    let parametros = {
        idFormulario: 'formLivro',
        colunas: [
            { titulo: 'ID', dado: 'id', tipo: 'oculto' },
            { titulo: 'Título', dado: 'titulo', tipo: 'textoCurto', obrigatorio: true },
            { titulo: 'Autores', dado: 'autores', tipo: 'textoCurto', obrigatorio: true },
            { titulo: 'Editora', dado: 'editora', dadoExibicao: 'editora.nome', urlConsulta: 'http://localhost:8080/AppCorporativaMavenWeb/editoras', tipo: 'relacionamento', obrigatorio: true },
            { titulo: 'Ano de Publicação', dado: 'anoPublicacao', tipo: 'ano', obrigatorio: true },
        ],
        idObjeto: 'id',
        urlCadastrar: 'http://localhost:8080/AppCorporativaMavenWeb/livros',
        urlEditar: 'http://localhost:8080/AppCorporativaMavenWeb/livros',
        urlCargaDados: 'http://localhost:8080/AppCorporativaMavenWeb/livros/id=',
    };
    await appCorporativa.criarFormulario(
        parametros
    );
});

