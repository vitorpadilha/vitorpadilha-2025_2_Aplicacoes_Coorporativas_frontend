document.addEventListener("DOMContentLoaded", async function() {
    let parametros = {
        idFormulario: 'formPessoa',
        campos: [
            { titulo: 'ID', dado: 'id', tipo: 'oculto' },
            { titulo: 'Nome', dado: 'nome', tipo: 'textoCurto', obrigatorio: true },
            { titulo: 'CPF', dado: 'cpf', tipo: 'cpf', obrigatorio: true },
            { titulo: 'Data Nascimento', dado: 'dataNascimento', tipo: 'data', obrigatorio: true },
            { titulo: 'E-mail', dado: 'email', tipo: 'email', obrigatorio: true },
        ],
        idObjeto: 'id',
        urlCadastrar: 'http://localhost:8080/pessoas',
        urlEditar: 'http://localhost:8080/pessoas',
        urlCargaDados: 'http://localhost:8080/pessoas/',
        token: localStorage.getItem("tokenAppCorporativa"),
        urlVoltar: 'http://127.0.0.1:5500/public/pessoa/tabela.html'
    };
    await appCorporativa.criarFormulario(
        parametros
    );
});

