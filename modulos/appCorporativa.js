const appCorporativa = {
    // -----------------------------------------
    // FUNÇÃO: criarTabela()
    // -----------------------------------------
    async criarTabela(parametros) {

        const tabela = document.getElementById(parametros.idTabela);

        if (!tabela) {
            console.error("Tabela não encontrada:", parametros.idTabela);
            return;
        }

        tabela.innerHTML = "";
        // -----------------------------------
        // BOTÃO NOVO CADASTRO
        // -----------------------------------

        if(parametros.urlNovoCadastro){

            let containerTopo =
                document.getElementById(
                    parametros.idTabela + "_topo"
                );

            if(!containerTopo){

                containerTopo =
                    document.createElement("div");

                containerTopo.id =
                    parametros.idTabela + "_topo";

                containerTopo.className = "topo-tabela";
                tabela.parentNode.insertBefore(
                    containerTopo,
                    tabela
                );
            }

            containerTopo.innerHTML = "";

            const btnNovo =
                document.createElement("button");

            btnNovo.textContent =
                "Novo Cadastro";

            btnNovo.type = "button";

            btnNovo.onclick = () => {

                window.location.href =
                    parametros.urlNovoCadastro;
            };

            containerTopo.appendChild(btnNovo);
        }
        // -----------------------------------
        // CONTROLE DE PAGINAÇÃO
        // -----------------------------------

        if (parametros.paginaAtual == null)
            parametros.paginaAtual = 0;

        if (parametros.tamanhoPagina == null)
            parametros.tamanhoPagina = 10;

        // -----------------------------------
        // MONTA URL COM PAGEABLE
        // -----------------------------------

        let url = `${parametros.url}?page=${parametros.paginaAtual}&size=${parametros.tamanhoPagina}`;

        if (parametros.sortCampo) {
            url += `&sort=${parametros.sortCampo},${parametros.sortDirecao || 'asc'}`;
        }

        // -----------------------------------
        // CABEÇALHO
        // -----------------------------------

        const thead = document.createElement("thead");
        const linhaCabecalho = document.createElement("tr");

        parametros.colunas.forEach(coluna => {

            const th = document.createElement("th");

            // -----------------------------------
            // TEXTO DA COLUNA
            // -----------------------------------

            let tituloColuna = coluna.titulo;

            // -----------------------------------
            // ÍCONE DE ORDENAÇÃO
            // -----------------------------------

            if(coluna.sortable){

                // Coluna atualmente ordenada
                if(parametros.sortCampo === coluna.dado){

                    tituloColuna +=
                        parametros.sortDirecao === "asc"
                        ? " ↑"
                        : " ↓";

                } else {

                    tituloColuna += " ↕";
                }
            }

            th.textContent = tituloColuna;

            // ORDENAÇÃO
            if (coluna.sortable) {

                th.style.cursor = "pointer";

                th.onclick = () => {

                    parametros.sortCampo = coluna.dado;

                    parametros.sortDirecao =
                        parametros.sortDirecao === "asc"
                        ? "desc"
                        : "asc";

                    appCorporativa.criarTabela(parametros);
                };
            }

            linhaCabecalho.appendChild(th);
        });

        if (parametros.exibeEditar || parametros.exibeRemover) {

            const thAcoes = document.createElement("th");
            thAcoes.textContent = "Ações";

            linhaCabecalho.appendChild(thAcoes);
        }

        thead.appendChild(linhaCabecalho);

        tabela.appendChild(thead);

        const tbody = document.createElement("tbody");

        try {

            let headers = {
                "Content-Type": "application/json"
            };

            if (parametros.token) {
                headers["Authorization"] =
                    "Bearer " + parametros.token;
            }

            const resposta = await fetch(url, {
                method: "GET",
                mode: "cors",
                headers: headers
            });

            if (!resposta.ok)
                throw new Error("Erro ao carregar dados");

            const retorno = await resposta.json();

            // -----------------------------------
            // SPRING PAGEABLE
            // -----------------------------------

            const dados = retorno.content ? retorno.content: ( retorno || []);

            dados.forEach(item => {

                const linha = document.createElement("tr");

                parametros.colunas.forEach(coluna => {

                    const td = document.createElement("td");
                    let valor = coluna.dado
                        .split('.')
                        .reduce((obj, chave) => obj && obj[chave], item);

                    if(coluna.tipo && coluna.tipo === "cpf" && valor){
                        valor = appCorporativa.formatarCPF(valor);
                    }
                    else if(coluna.tipo && coluna.tipo === "data" && valor){

                        valor = appCorporativa.formatarData(valor);
                    }

                    td.textContent = valor ?? "";

                    linha.appendChild(td);
                });

                // -----------------------------------
                // AÇÕES
                // -----------------------------------

                if (parametros.exibeEditar || parametros.exibeRemover) {

                    const tdAcoes = document.createElement("td");

                    const idItem =
                        item[parametros.idEnvio || "id"];

                    // EDITAR
                    if (parametros.exibeEditar) {

                        const btnEditar =
                            document.createElement("button");

                        btnEditar.textContent = "Editar";

                        btnEditar.onclick = () => {

                            window.location.href =
                                parametros.urlEditar + idItem;
                        };

                        tdAcoes.appendChild(btnEditar);
                    }

                    // REMOVER
                    if (parametros.exibeRemover) {

                        const btnRemover =
                            document.createElement("button");

                        btnRemover.textContent = "Remover";

                        btnRemover.onclick = async () => {

                            if (confirm("Deseja remover?")) {

                                const resp = await fetch(
                                    parametros.urlRemover + "/" + idItem,
                                    {
                                        method: "DELETE",
                                        headers: headers
                                    }
                                );

                                if (resp.ok) {

                                    alert("Removido com sucesso");

                                    appCorporativa.criarTabela(parametros);

                                } else {

                                    alert("Erro ao remover");
                                }
                            }
                        };

                        tdAcoes.appendChild(btnRemover);
                    }

                    linha.appendChild(tdAcoes);
                }

                tbody.appendChild(linha);
            });

            tabela.appendChild(tbody);

            // -----------------------------------
            // PAGINAÇÃO VISUAL
            // -----------------------------------

            let paginacao =
                document.getElementById(
                    parametros.idTabela + "_paginacao"
                );

            if (!paginacao) {

                paginacao = document.createElement("div");

                paginacao.id =
                    parametros.idTabela + "_paginacao";
                paginacao.className = "paginacao";
                // -----------------------------------
                // TOTAL DE ELEMENTOS
                // -----------------------------------

                const spanTotal =
                    document.createElement("span");

                const inicio =
                    (retorno.number * retorno.size) + 1;

                let fim =
                    inicio + retorno.numberOfElements - 1;

                if(retorno.totalElements === 0){

                    fim = 0;
                }

                spanTotal.textContent =
                    `Mostrando ${inicio}-${fim} de ${retorno.totalElements} registros`;

                paginacao.appendChild(spanTotal);
                tabela.parentNode.appendChild(paginacao);
            }

            paginacao.innerHTML = "";

            const btnAnterior =
                document.createElement("button");

            btnAnterior.textContent = "Anterior";

            btnAnterior.disabled = retorno.first;

            btnAnterior.onclick = () => {

                parametros.paginaAtual--;

                appCorporativa.criarTabela(parametros);
            };

            paginacao.appendChild(btnAnterior);

            // -----------------------------------
            // INPUT DA PÁGINA
            // -----------------------------------

            const containerPagina =
                document.createElement("div");

            containerPagina.style.display = "flex";
            containerPagina.style.alignItems = "center";
            containerPagina.style.gap = "8px";

            const labelPagina =
                document.createElement("span");

            labelPagina.textContent = "Página";

            containerPagina.appendChild(labelPagina);

            const inputPagina =
                document.createElement("input");

            inputPagina.type = "number";

            inputPagina.min = 1;

            inputPagina.max = retorno.totalPages;

            inputPagina.value = retorno.number + 1;

            inputPagina.style.width = "60px";

            containerPagina.appendChild(inputPagina);

            const labelTotal =
                document.createElement("span");

            labelTotal.textContent =
                `de ${retorno.totalPages}`;

            containerPagina.appendChild(labelTotal);

            // ENTER no input
            inputPagina.addEventListener("keypress", e => {

                if(e.key === "Enter"){

                    let pagina =
                        parseInt(inputPagina.value);

                    if(isNaN(pagina))
                        return;

                    if(pagina < 1)
                        pagina = 1;

                    if(pagina > retorno.totalPages)
                        pagina = retorno.totalPages;

                    parametros.paginaAtual =
                        pagina - 1;

                    appCorporativa.criarTabela(parametros);
                }
            });

            // Saiu do campo
            inputPagina.addEventListener("blur", () => {

                let pagina =
                    parseInt(inputPagina.value);

                if(isNaN(pagina))
                    return;

                if(pagina < 1)
                    pagina = 1;

                if(pagina > retorno.totalPages)
                    pagina = retorno.totalPages;

                parametros.paginaAtual =
                    pagina - 1;

                appCorporativa.criarTabela(parametros);
            });

            paginacao.appendChild(containerPagina);


            // -----------------------------------
            // INPUT TAMANHO DA PÁGINA
            // -----------------------------------

            const containerTamanho =
                document.createElement("div");

            containerTamanho.style.display = "flex";
            containerTamanho.style.alignItems = "center";
            containerTamanho.style.gap = "8px";

            const labelTamanho =
                document.createElement("span");

            labelTamanho.textContent = "Exibir";

            containerTamanho.appendChild(labelTamanho);

            const inputTamanho =
                document.createElement("input");

            inputTamanho.type = "number";

            inputTamanho.min = 1;

            inputTamanho.value =
                parametros.tamanhoPagina;

            inputTamanho.style.width = "70px";

            containerTamanho.appendChild(inputTamanho);

            const labelItens =
                document.createElement("span");

            labelItens.textContent = "itens";

            containerTamanho.appendChild(labelItens);

            // ENTER
            inputTamanho.addEventListener("keypress", e => {

                if(e.key === "Enter"){

                    let tamanho =
                        parseInt(inputTamanho.value);

                    if(isNaN(tamanho) || tamanho <= 0)
                        return;

                    parametros.tamanhoPagina =
                        tamanho;

                    parametros.paginaAtual = 0;

                    appCorporativa.criarTabela(parametros);
                }
            });

            // SAIU DO INPUT
            inputTamanho.addEventListener("blur", () => {

                let tamanho =
                    parseInt(inputTamanho.value);

                if(isNaN(tamanho) || tamanho <= 0)
                    return;

                parametros.tamanhoPagina =
                    tamanho;

                parametros.paginaAtual = 0;

                appCorporativa.criarTabela(parametros);
            });

            paginacao.appendChild(containerTamanho);

            const btnProximo =
                document.createElement("button");

            btnProximo.textContent = "Próximo";

            btnProximo.disabled = retorno.last;

            btnProximo.onclick = () => {

                parametros.paginaAtual++;

                appCorporativa.criarTabela(parametros);
            };

            paginacao.appendChild(btnProximo);

        } catch (erro) {

            console.error("Erro ao carregar tabela:", erro);
        }
    },

    // -----------------------------------------
    // FUNÇÃO: criarFormulario()
    // -----------------------------------------
    async criarFormulario(parametros) {
        console.log("Carregando Formulário....");
        const form = document.getElementById(parametros.idFormulario);
        if (!form) {
            console.error("Elemento de destino não encontrado:", parametros.idFormulario);
            return;
        }

        form.innerHTML = "";

        // Extrai ID da URL (modo edição)
        const urlParams = new URLSearchParams(window.location.search);
        const idEdicao = urlParams.get("id");
        if(parametros.colunas && !parametros.campos){
            parametros.campos = parametros.colunas;
        }
        // Cria campos
        for (const col of parametros.campos) {
            const divContainer = document.createElement("div");
            divContainer.style.marginBottom = "10px";
            form.appendChild(divContainer);
            if (col.tipo !== "oculto") {
                const label = document.createElement("label");
                label.textContent = col.titulo+": ";
                label.style.display = "block";
                divContainer.appendChild(label);
            }
            let input;

            if (col.tipo === "relacionamento") {
                input = document.createElement("select");
                input.name = col.dado;
                input.id = col.dado;
                input.value =  col.valorPadrao ? col.valorPadrao : "";
                const optGenerico = document.createElement("option");
                optGenerico.value = "";
                optGenerico.textContent = "Selecione...";
                input.appendChild(optGenerico);
                if (col.obrigatorio)
                    input.required = true;
                // Carrega opções da URL
                try {
                    let headers = { "Content-Type": "application/json" };
                    if (parametros.token) {
                        headers["Authorization"] = "Bearer " + parametros.token;
                    }
                    const resp = await fetch(col.urlConsulta, { headers: headers });
                    let dados = await resp.json();
                    if(dados && dados.content) {
                        dados = dados.content;
                    }
                    dados.forEach(op => {
                        const opt = document.createElement("option");
                        const idRel = JSON.stringify(op);
                        const nomeRel = col.dadoExibicao.split('.');
                        opt.value = idRel;
                        opt.textContent = op[nomeRel[1]];
                        input.appendChild(opt);
                    });
                    
                } catch (e) {
                    console.error("Erro ao carregar relacionamento:", e);
                }
            }
            else if (col.tipo === "selecao") {
                input = document.createElement("select");
                input.name = col.dado;
                input.id = col.dado;
                input.value =  col.valorPadrao ? col.valorPadrao : "";
                const optGenerico = document.createElement("option");
                optGenerico.value = "";
                optGenerico.textContent = "Selecione...";
                input.appendChild(optGenerico);
                if (col.obrigatorio)
                    input.required = true;
                // Carrega opções da URL
                try {
                    
                    col.opcoes?.forEach(op => {
                        const opt = document.createElement("option");
                        opt.value = op.valor;
                        opt.textContent = op.texto;
                        input.appendChild(opt);
                    });
                } catch (e) {
                    console.error("Erro ao carregar relacionamento:", e);
                }
            }
            else if(col.tipo === "textarea" || col.tipo === "textoLongo"){
                input = document.createElement("textarea");
                input.name = col.dado;
                input.id = col.dado;
                input.placeholder = col.titulo;
                input.textContent =  col.valorPadrao ? col.valorPadrao : "";
                if (col.obrigatorio)
                    input.required = true;
            }
            else {
                input = document.createElement("input");
                input.name = col.dado;
                input.id = col.dado;
                input.placeholder = col.titulo;
                input.value =  col.valorPadrao ? col.valorPadrao : "";
                if (col.obrigatorio)
                    input.required = true;

                switch (col.tipo) {
                    case "numero":
                        input.type = "number";
                        col.tipo? input.step = col.casasDecimais:''; 
                        break;
                    case "textoCurto":
                        input.type = "text";
                        break;
                    case "textoLongo":
                        input.type = "textarea";
                        break;
                    case "email":
                        input.type = "email";
                        break;
                    case "data":
                        input.type = "date";
                        break;
                    case "senha":
                        input.type = "password";
                        break;
                    case "telefone":
                        input.type = "tel";
                        break;
                    case "url":
                        input.type = "url";
                        break;
                    case "oculto":
                        input.type = "hidden";
                        break;
                    case "ano":
                        input.type = "number";
                        input.min = "1900";
                        input.max = new Date().getFullYear();
                        break;
                    case "cpf":
                        input.type = "text";
                        input.maxLength = 14;
                        break;
                    default:
                        input.type = "text";
                }
            }

            input.style.marginBottom = "10px";
            input.style.display = "block";
            if(col.tipo === "cpf") {

                input.addEventListener("input", e => {

                    let valor = e.target.value;

                    // Remove tudo que não for número
                    valor = valor.replace(/\D/g, "");

                    // Limita 11 dígitos
                    valor = valor.substring(0, 11);

                    // Máscara CPF
                    valor = valor.replace(
                        /(\d{3})(\d)/,
                        "$1.$2"
                    );

                    valor = valor.replace(
                        /(\d{3})(\d)/,
                        "$1.$2"
                    );

                    valor = valor.replace(
                        /(\d{3})(\d{1,2})$/,
                        "$1-$2"
                    );

                    e.target.value = valor;
                });
            }
            
            divContainer.appendChild(input);
        }

        // Botão de enviar
        const divContainerBtn = document.createElement("div");

        divContainerBtn.style.display = "flex";
        divContainerBtn.style.gap = "10px";
        divContainerBtn.style.marginTop = "15px";

        // -----------------------------------
        // BOTÃO SALVAR
        // -----------------------------------

        const btnSalvar = document.createElement("button");

        btnSalvar.textContent =
            idEdicao ? "Atualizar" : "Cadastrar";

        btnSalvar.type = "submit";

        divContainerBtn.appendChild(btnSalvar);

        // -----------------------------------
        // BOTÃO VOLTAR
        // -----------------------------------

        const btnVoltar = document.createElement("button");

        btnVoltar.textContent = "Voltar";

        btnVoltar.type = "button";

        btnVoltar.onclick = () => {
            if(parametros.urlVoltar){
                window.location.href = parametros.urlVoltar;
            } else {
                window.history.back();
            }
        };

        divContainerBtn.appendChild(btnVoltar);

        // -----------------------------------

        form.appendChild(divContainerBtn);

        // Se for edição, carrega dados
        if (idEdicao) {
            console.log("Edição"+ idEdicao);
            try {
                let headers = { "Content-Type": "application/json" };
                if (parametros.token) {
                    headers["Authorization"] = "Bearer " + parametros.token;
                }
                const resp = await fetch(parametros.urlCargaDados.replace("id=", "") + idEdicao, { headers: headers });
                if (resp.ok) {
                    const dados = await resp.json();
                    console.log("Dados retornados", dados);
                    parametros.campos.forEach(col => {
                        const campo = form.querySelector(`[name='${col.dado}']`);
                        if (campo) {
                            if(col.tipo === "relacionamento") {
                                const valorRel = JSON.stringify(dados[col.dado]);
                                console.log("Valor relacionamento:", valorRel);
                                campo.value = valorRel;
                                return;
                            } 
                            else {
                                const valor = col.dado.split('.').reduce((obj, chave) => obj && obj[chave], dados);
                                if(col.tipo === "cpf" && valor){
                                    campo.value = appCorporativa.formatarCPF(valor);
                                }
                                else if(col.tipo === "data" && valor){
                                    campo.value = valor.substring(0,10);
                                }
                                else{
                                    campo.value = valor ?? "";
                                }
                            }
                        }
                    });
                }
            } catch (e) {
                console.error("Erro ao carregar dados do registro:", e);
            }
        }

        // Submissão do formulário
        form.addEventListener("submit", async e => {
            e.preventDefault();
            const obj = {};

            parametros.campos.forEach(col => {
                const valor = form.querySelector(`[name='${col.dado}']`).value;
                if(col.tipo === "numero" && valor !== "") {
                    obj[col.dado] = parseFloat(valor);
                }
                else if(col.tipo === "ano" && valor !== "") {
                    obj[col.dado] = parseInt(valor);
                }else  if(col.tipo === "relacionamento") {
                    obj[col.dado] = JSON.parse(valor);
                } else if(col.tipo === "data" && valor !== "") {
                    obj[col.dado] = valor + "T00:00:00";
                }else if(col.tipo === "cpf") {
                    obj[col.dado] = valor.replace(/\D/g, "");
                }else {
                    obj[col.dado] = valor;
                }
            });

            const metodo = idEdicao ? "PUT" : "POST";
            for(const col of parametros.campos){
                if(col.tipo === "cpf"){
                    const valor =
                        form.querySelector(`[name='${col.dado}']`).value;
                    if(!appCorporativa.validarCPF(valor)){
                        alert("CPF inválido!");
                        return;
                    }
                }
            }
            const baseEditar =
                parametros.urlEditar.replace(/\/$/, "");

            const urlEnvio = idEdicao
                ? `${baseEditar}/${idEdicao}`
                : parametros.urlCadastrar;

            try {
                let headers = { "Content-Type": "application/json" };
                if (parametros.token) {
                    headers["Authorization"] = "Bearer " + parametros.token;
                }
                const resp = await fetch(urlEnvio, {
                    method: metodo,
                    headers: headers,
                    body: JSON.stringify(obj)
                });
                if (resp.ok) {
                    alert(
                        idEdicao
                        ? "Registro atualizado com sucesso!"
                        : "Registro cadastrado com sucesso!"
                    );
                    if(parametros.urlVoltar){
                        window.location.href = parametros.urlVoltar;
                    } else {
                        form.reset();
                    }
                } else {
                    alert("Erro ao salvar registro.");
                }
            } catch (err) {
                console.error("Erro ao enviar formulário:", err);
            }
        });
    },
    validarCPF(cpf) {
        cpf = cpf.replace(/\D/g, "");
        if (cpf.length !== 11)
            return false;
        if (/^(\d)\1+$/.test(cpf))
            return false;
        let soma = 0;
        let resto;
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11))
            resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10)))
            return false;
        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11))
            resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11)))
            return false;
        return true;
    },
    formatarCPF(cpf) {
        if(!cpf)
            return "";
        cpf = cpf.toString();
        cpf = cpf.padStart(11, '0');
        return cpf.replace(
            /(\d{3})(\d{3})(\d{3})(\d{2})/,
            "$1.$2.$3-$4"
        );
    },
    formatarData(data){
        if(!data)
            return "";
        data = data.toString();
        const partes = data.substring(0,10).split("-");
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
};
