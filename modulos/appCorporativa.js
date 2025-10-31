const appCorporativa = {
    // -----------------------------------------
    // FUNÇÃO: criarTabela()
    // -----------------------------------------
    async criarTabela(parametros) {
        const tabela = document.getElementById(parametros.idTabela);
        if (!tabela) {
            console.error("Tabela com o ID informado não foi encontrada:", parametros.idTabela);
            return;
        }

        tabela.innerHTML = "";

        const thead = document.createElement("thead");
        const linhaCabecalho = document.createElement("tr");

        parametros.colunas.forEach(coluna => {
            const th = document.createElement("th");
            th.textContent = coluna.titulo;
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
            const resposta = await fetch(parametros.url, {
                    method: "GET",
                    mode: 'cors',
                    headers: { "Content-Type": "application/json" }
                });
            if (!resposta.ok) throw new Error("Erro ao buscar dados da URL: " + parametros.url);
            const dados = await resposta.json();

            dados.forEach(item => {
                const linha = document.createElement("tr");

                parametros.colunas.forEach(coluna => {
                    const td = document.createElement("td");
                    const valor = coluna.dado.split('.').reduce((obj, chave) => obj && obj[chave], item);
                    td.textContent = valor ?? "";
                    linha.appendChild(td);
                });

                if (parametros.exibeEditar || parametros.exibeRemover) {
                    const tdAcoes = document.createElement("td");
                    const idItem = item[parametros.idEnvio || "id"];

                    if (parametros.exibeEditar) {
                        const btnEditar = document.createElement("button");
                        btnEditar.textContent = "Editar";
                        btnEditar.onclick = () => {
                            window.location.href = parametros.urlEditar + idItem;
                        };
                        tdAcoes.appendChild(btnEditar);
                    }

                    if (parametros.exibeRemover) {
                        const btnRemover = document.createElement("button");
                        btnRemover.textContent = "Remover";
                        btnRemover.onclick = async () => {
                            if (confirm("Deseja realmente remover este registro?")) {
                                const resp = await fetch(parametros.urlRemover + "/" + idItem, { method: "DELETE" });
                                if (resp.ok) {
                                    alert("Registro removido com sucesso!");
                                    appCorporativa.criarTabela(parametros);
                                } else {
                                    alert("Erro ao remover registro.");
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
        } catch (erro) {
            console.error("Erro ao carregar dados:", erro);
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

        // Cria campos
        for (const col of parametros.colunas) {
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

                const optGenerico = document.createElement("option");
                optGenerico.value = "";
                optGenerico.textContent = "Selecione...";
                input.appendChild(optGenerico);
                if (col.obrigatorio)
                    input.required = true;
                // Carrega opções da URL
                try {
                    const resp = await fetch(col.urlConsulta);
                    const dados = await resp.json();
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
            else if(col.tipo === "textarea" || col.tipo === "textoLongo"){
                input = document.createElement("textarea");
                input.name = col.dado;
                input.id = col.dado;
                if (col.obrigatorio)
                    input.required = true;
            }
            else {
                input = document.createElement("input");
                input.name = col.dado;
                input.id = col.dado;
                input.placeholder = col.titulo;
                if (col.obrigatorio)
                    input.required = true;

                switch (col.tipo) {
                    case "numero":
                        input.type = "number";
                        break;
                    case "textoCurto":
                        input.type = "text";
                        break;
                    case "oculto":
                        input.type = "hidden";
                        break;
                    case "ano":
                        input.type = "number";
                        input.min = "1900";
                        input.max = new Date().getFullYear();
                        break;
                    default:
                        input.type = "text";
                }
            }

            input.style.marginBottom = "10px";
            input.style.display = "block";

            
            divContainer.appendChild(input);
        }

        // Botão de enviar
        const divContainerBtn = document.createElement("div");
        const btnSalvar = document.createElement("button");
        btnSalvar.textContent = idEdicao ? "Atualizar" : "Cadastrar";
        btnSalvar.type = "submit";
        divContainerBtn.appendChild(btnSalvar);
        form.appendChild(divContainerBtn);

        // Se for edição, carrega dados
        if (idEdicao) {
            console.log("Edição"+ idEdicao);
            try {
                const resp = await fetch(parametros.urlCargaDados.replace("id=", "") + idEdicao);
                if (resp.ok) {
                    const dados = await resp.json();
                    console.log("Dados retornados", dados);
                    parametros.colunas.forEach(col => {
                        const campo = form.querySelector(`[name='${col.dado}']`);
                        if (campo) {
                            if(col.tipo === "relacionamento") {
                                const valorRel = JSON.stringify(dados[col.dado]);
                                console.log("Valor relacionamento:", valorRel);
                                campo.value = valorRel;
                                return;
                            } else {
                                const valor = col.dado.split('.').reduce((obj, chave) => obj && obj[chave], dados);
                                campo.value = valor ?? "";
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

            parametros.colunas.forEach(col => {
                const valor = form.querySelector(`[name='${col.dado}']`).value;
               if(col.tipo === "relacionamento") {
                   obj[col.dado] = JSON.parse(valor);
               } else {
                   obj[col.dado] = valor;
               }
            });

            const metodo = idEdicao ? "PUT" : "POST";
            const urlEnvio = idEdicao
                ? parametros.urlEditar + idEdicao
                : parametros.urlCadastrar;

            try {
                const resp = await fetch(urlEnvio, {
                    method: metodo,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(obj)
                });
                if (resp.ok) {
                    alert(idEdicao ? "Registro atualizado com sucesso!" : "Registro cadastrado com sucesso!");
                    //window.location.href = "index.html";
                    form.reset();
                } else {
                    alert("Erro ao salvar registro.");
                }
            } catch (err) {
                console.error("Erro ao enviar formulário:", err);
            }
        });
    }
};
