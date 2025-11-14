document.addEventListener("DOMContentLoaded", async function() {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    let parametros = {
        idFormulario: 'formUsuario',
        campos: [
            { titulo: 'ID', dado: 'id', tipo: 'oculto', obrigatorio: false },
            { titulo: 'email', dado: 'email', tipo: 'oculto', obrigatorio: true, valorPadrao: email },
            { titulo: 'Nome', dado: 'nome', tipo: 'textoCurto', obrigatorio: true },
        ],
        urlCadastrar: 'http://localhost:8080/AppCorporativaMavenWeb/usuarios',
        urlEditar: 'http://localhost:8080/AppCorporativaMavenWeb/usuarios',
        urlCargaDados: 'http://localhost:8080/AppCorporativaMavenWeb/usuarios/id=',
        token: localStorage.getItem("tokenAppCorporativa"),
    };
    appCorporativa.criarFormulario(
        parametros
    );

});
