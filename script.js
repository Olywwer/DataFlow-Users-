const STORAGE_KEY = 'dataflow_usuarios';
let usuarioEditandoId = null;
let usuariosFiltrados = [];
let paginaAtual = 1;
const ITENS_POR_PAGINA = 10;
let ordemAtual = {coluna: 'id', direcao: 'asc'};
let graficoIdades = null;
let graficoEstados = null;

function inicializarDados() {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (!dados) {
        const usuariosExemplo = [
            {
                id: 1, nome: 'Ana Carolina Silva', sobrenome: 'Silva', email: 'ana.silva@email.com',
                telefone: '(11) 99999-8888', idade: 28, cpf: '123.456.789-00', rg: '12.345.678-9',
                dataNascimento: '1995-05-15', endereco: 'Rua das Flores, 123 - Sao Paulo - SP',
                profissao: 'Desenvolvedora', empresa: 'Tech Solutions', observacoes: 'Especialista em React',
                dataCadastro: new Date().toISOString()
            },
            {
                id: 2, nome: 'Carlos Eduardo Santos', sobrenome: 'Santos', email: 'carlos.santos@email.com',
                telefone: '(21) 98888-7777', idade: 35, cpf: '987.654.321-00', rg: '98.765.432-1',
                dataNascimento: '1988-03-20', endereco: 'Av. Atlantica, 500 - Rio de Janeiro - RJ',
                profissao: 'Arquiteto', empresa: 'Sistema Corp', observacoes: 'Arquiteto de solucoes',
                dataCadastro: new Date().toISOString()
            },
            {
                id: 3, nome: 'Mariana Oliveira', sobrenome: 'Oliveira', email: 'mariana.oliveira@email.com',
                telefone: '(31) 97777-6666', idade: 26, cpf: '456.789.123-00', rg: '45.678.912-3',
                dataNascimento: '1997-08-10', endereco: 'Rua da Liberdade, 789 - Belo Horizonte - MG',
                profissao: 'UX Designer', empresa: 'Design Agency', observacoes: 'Especialista em UX',
                dataCadastro: new Date().toISOString()
            }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(usuariosExemplo));
    }
}

function getUsuarios() {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
}

function saveUsuarios(usuarios) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}

function gerarNovoId() {
    const usuarios = getUsuarios();
    return usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
}

function mostrarToast(mensagem, tipo) {
    const toastDiv = document.getElementById('toastNotification');
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = mensagem;
    toastDiv.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function mostrarSecao(secao) {
    document.querySelectorAll('.secao').forEach(s => s.classList.remove('active'));
    if (secao === 'dashboard') {
        document.getElementById('secaoDashboard').classList.add('active');
        atualizarDashboard();
    } else if (secao === 'cadastro') {
        document.getElementById('secaoCadastro').classList.add('active');
    } else if (secao === 'lista') {
        document.getElementById('secaoLista').classList.add('active');
        carregarLista();
    } else if (secao === 'busca') {
        document.getElementById('secaoBusca').classList.add('active');
    }
}

function alternarTema() {
    const atual = document.body.getAttribute('data-theme');
    const novoTema = atual === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', novoTema);
    localStorage.setItem('tema', novoTema);
}

function validarEmailTempoReal(input) {
    const email = input.value;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (regex.test(email)) {
        input.style.borderColor = '#00b894';
    } else if (email.length > 0) {
        input.style.borderColor = '#ff4757';
    } else {
        input.style.borderColor = '#e0e0e0';
    }
}

function cadastrarUsuario(evento) {
    evento.preventDefault();
    const usuario = {
        id: gerarNovoId(), nome: document.getElementById('nome').value, sobrenome: document.getElementById('sobrenome').value,
        email: document.getElementById('email').value, telefone: document.getElementById('telefone').value,
        idade: parseInt(document.getElementById('idade').value) || 0, cpf: document.getElementById('cpf').value,
        rg: document.getElementById('rg').value, dataNascimento: document.getElementById('dataNascimento').value,
        endereco: document.getElementById('endereco').value, profissao: document.getElementById('profissao').value,
        empresa: document.getElementById('empresa').value, observacoes: document.getElementById('observacoes').value,
        dataCadastro: new Date().toISOString()
    };
    if (!usuario.nome || !usuario.email || !usuario.cpf) {
        mostrarToast('Preencha Nome, Email e CPF!', 'error');
        return;
    }
    const usuarios = getUsuarios();
    if (usuarios.some(u => u.cpf === usuario.cpf)) {
        mostrarToast('Este CPF ja esta cadastrado!', 'error');
        return;
    }
    usuarios.push(usuario);
    saveUsuarios(usuarios);
    document.getElementById('formCadastro').reset();
    mostrarToast('Usuario cadastrado com sucesso!', 'success');
    atualizarDashboard();
}

function carregarLista() {
    let usuarios = getUsuarios();
    usuarios.sort((a, b) => {
        let valorA = a[ordemAtual.coluna];
        let valorB = b[ordemAtual.coluna];
        if (typeof valorA === 'string') {
            valorA = valorA.toLowerCase();
            valorB = valorB.toLowerCase();
        }
        if (ordemAtual.direcao === 'asc') {
            return valorA > valorB ? 1 : -1;
        } else {
            return valorA < valorB ? 1 : -1;
        }
    });
    usuariosFiltrados = [...usuarios];
    const nomeFiltro = document.getElementById('filtroNome')?.value.toLowerCase() || '';
    const estadoFiltro = document.getElementById('filtroEstado')?.value || '';
    const idadeFiltro = document.getElementById('filtroIdade')?.value || '';
    if (nomeFiltro) {
        usuariosFiltrados = usuariosFiltrados.filter(u => u.nome.toLowerCase().includes(nomeFiltro));
    }
    if (estadoFiltro) {
        usuariosFiltrados = usuariosFiltrados.filter(u => u.endereco && u.endereco.includes(estadoFiltro));
    }
    if (idadeFiltro) {
        usuariosFiltrados = usuariosFiltrados.filter(u => {
            if (idadeFiltro === '18-25') return u.idade >= 18 && u.idade <= 25;
            if (idadeFiltro === '26-35') return u.idade >= 26 && u.idade <= 35;
            if (idadeFiltro === '36-50') return u.idade >= 36 && u.idade <= 50;
            if (idadeFiltro === '50+') return u.idade > 50;
            return true;
        });
    }
    const totalUsuariosSpan = document.getElementById('totalUsuarios');
    if (totalUsuariosSpan) totalUsuariosSpan.textContent = usuariosFiltrados.length;
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    const usuariosPagina = usuariosFiltrados.slice(inicio, fim);
    const tbody = document.getElementById('listaUsuarios');
    if (usuariosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum usuario encontrado</td></tr>';
        return;
    }
    tbody.innerHTML = usuariosPagina.map(usuario => `
        <tr>
            <td>${usuario.id}</td>
            <td><strong>${usuario.nome} ${usuario.sobrenome || ''}</strong></td>
            <td>${usuario.email}</td>
            <td>${usuario.cpf}</td>
            <td>${usuario.telefone || '-'}</td>
            <td>${usuario.idade || '-'}</td>
            <td>
                <button class="btn btn-small btn-warning" onclick="abrirModalEditar(${usuario.id})">Editar</button>
                <button class="btn btn-small btn-danger" onclick="deletarUsuario(${usuario.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
    document.getElementById('paginaAtual').textContent = paginaAtual;
}

function paginaAnterior() {
    if (paginaAtual > 1) {
        paginaAtual--;
        carregarLista();
    }
}

function proximaPagina() {
    const totalPaginas = Math.ceil(usuariosFiltrados.length / ITENS_POR_PAGINA);
    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        carregarLista();
    }
}

function ordenarTabela(coluna) {
    if (ordemAtual.coluna === coluna) {
        ordemAtual.direcao = ordemAtual.direcao === 'asc' ? 'desc' : 'asc';
    } else {
        ordemAtual.coluna = coluna;
        ordemAtual.direcao = 'asc';
    }
    paginaAtual = 1;
    carregarLista();
}

function filtrarUsuarios() {
    paginaAtual = 1;
    carregarLista();
}

function limparFiltros() {
    const filtroNome = document.getElementById('filtroNome');
    const filtroEstado = document.getElementById('filtroEstado');
    const filtroIdade = document.getElementById('filtroIdade');
    if (filtroNome) filtroNome.value = '';
    if (filtroEstado) filtroEstado.value = '';
    if (filtroIdade) filtroIdade.value = '';
    carregarLista();
}

function deletarUsuario(id) {
    if (!confirm('Tem certeza que deseja excluir este usuario?')) return;
    const usuarios = getUsuarios();
    const novosUsuarios = usuarios.filter(u => u.id !== id);
    saveUsuarios(novosUsuarios);
    mostrarToast('Usuario excluido com sucesso!', 'success');
    carregarLista();
    atualizarDashboard();
}

function buscarPorCpf() {
    const cpfBusca = document.getElementById('cpfBusca').value.trim();
    const resultadoDiv = document.getElementById('resultadoBusca');
    if (!cpfBusca) {
        resultadoDiv.innerHTML = '<div class="alert alert-error">Digite um CPF para buscar</div>';
        return;
    }
    const usuarios = getUsuarios();
    const usuario = usuarios.find(u => u.cpf === cpfBusca);
    if (usuario) {
        resultadoDiv.innerHTML = `
            <div class="alert alert-success">
                <h3>Usuario Encontrado</h3>
                <p><strong>Nome:</strong> ${usuario.nome} ${usuario.sobrenome || ''}</p>
                <p><strong>Email:</strong> ${usuario.email}</p>
                <p><strong>Telefone:</strong> ${usuario.telefone || 'Nao informado'}</p>
                <p><strong>Idade:</strong> ${usuario.idade || 'Nao informado'}</p>
                <p><strong>CPF:</strong> ${usuario.cpf}</p>
                <p><strong>RG:</strong> ${usuario.rg || 'Nao informado'}</p>
                <p><strong>Endereco:</strong> ${usuario.endereco || 'Nao informado'}</p>
                <p><strong>Profissao:</strong> ${usuario.profissao || 'Nao informado'}</p>
                <p><strong>Empresa:</strong> ${usuario.empresa || 'Nao informado'}</p>
                ${usuario.observacoes ? `<p><strong>Observacoes:</strong> ${usuario.observacoes}</p>` : ''}
            </div>
        `;
    } else {
        resultadoDiv.innerHTML = `<div class="alert alert-error">Nenhum usuario encontrado com o CPF: ${cpfBusca}</div>`;
    }
}

function abrirModalEditar(id) {
    const usuarios = getUsuarios();
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;
    usuarioEditandoId = id;
    document.getElementById('editarNome').value = usuario.nome;
    document.getElementById('editarEmail').value = usuario.email;
    document.getElementById('editarTelefone').value = usuario.telefone || '';
    document.getElementById('editarIdade').value = usuario.idade || '';
    document.getElementById('modalEdicao').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modalEdicao').style.display = 'none';
    usuarioEditandoId = null;
}

function salvarEdicao() {
    if (!usuarioEditandoId) return;
    const usuarios = getUsuarios();
    const index = usuarios.findIndex(u => u.id === usuarioEditandoId);
    if (index !== -1) {
        usuarios[index] = {
            ...usuarios[index],
            nome: document.getElementById('editarNome').value,
            email: document.getElementById('editarEmail').value,
            telefone: document.getElementById('editarTelefone').value,
            idade: parseInt(document.getElementById('editarIdade').value) || usuarios[index].idade
        };
        saveUsuarios(usuarios);
        mostrarToast('Usuario atualizado com sucesso!', 'success');
        fecharModal();
        carregarLista();
        atualizarDashboard();
    }
}

function limparTodosDados() {
    if (confirm('ATENCAO! Isso apagara TODOS os usuarios cadastrados. Tem certeza?')) {
        localStorage.removeItem(STORAGE_KEY);
        inicializarDados();
        mostrarToast('Todos os dados foram removidos!', 'success');
        carregarLista();
        document.getElementById('resultadoBusca').innerHTML = '';
        document.getElementById('formCadastro').reset();
        atualizarDashboard();
    }
}

function exportarDados() {
    const dados = localStorage.getItem(STORAGE_KEY);
    const blob = new Blob([dados], {type: 'application/json'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    mostrarToast('Backup exportado com sucesso!', 'success');
}

function importarDados(evento) {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
            mostrarToast('Dados importados com sucesso!', 'success');
            location.reload();
        } catch (error) {
            mostrarToast('Erro ao importar arquivo!', 'error');
        }
    };
    reader.readAsText(arquivo);
}

function gerarRelatorio() {
    const element = document.getElementById('secaoLista');
    const opt = {
        margin: 1, filename: `relatorio_${new Date().toISOString().split('T')[0]}.pdf`,
        image: {type: 'jpeg', quality: 0.98}, html2canvas: {scale: 2},
        jsPDF: {unit: 'in', format: 'a4', orientation: 'portrait'}
    };
    html2pdf().set(opt).from(element).save();
    mostrarToast('PDF gerado com sucesso!', 'success');
}

function atualizarDashboard() {
    const usuarios = getUsuarios();
    const total = usuarios.length;
    const idades = usuarios.map(u => u.idade).filter(i => i > 0);
    const media = idades.length ? Math.round(idades.reduce((a,b) => a + b, 0) / idades.length) : 0;
    const maior = idades.length ? Math.max(...idades) : 0;
    const menor = idades.length ? Math.min(...idades) : 0;
    document.getElementById('totalUsuariosDash').textContent = total;
    document.getElementById('mediaIdade').textContent = media;
    document.getElementById('maiorIdade').textContent = maior;
    document.getElementById('menorIdade').textContent = menor;
    
    const faixasEtarias = { '18-25': 0, '26-35': 0, '36-50': 0, '50+': 0 };
    usuarios.forEach(u => {
        if (u.idade >= 18 && u.idade <= 25) faixasEtarias['18-25']++;
        else if (u.idade >= 26 && u.idade <= 35) faixasEtarias['26-35']++;
        else if (u.idade >= 36 && u.idade <= 50) faixasEtarias['36-50']++;
        else if (u.idade > 50) faixasEtarias['50+']++;
    });
    
    const estados = {};
    usuarios.forEach(u => {
        if (u.endereco) {
            const partes = u.endereco.split('-');
            const estado = partes.length > 1 ? partes[partes.length - 1].trim() : 'Outros';
            estados[estado] = (estados[estado] || 0) + 1;
        }
    });
    
    if (graficoIdades) graficoIdades.destroy();
    if (graficoEstados) graficoEstados.destroy();
    
    const ctxIdades = document.getElementById('graficoIdades').getContext('2d');
    graficoIdades = new Chart(ctxIdades, {
        type: 'bar', data: { labels: Object.keys(faixasEtarias), datasets: [{ label: 'Usuarios', data: Object.values(faixasEtarias), backgroundColor: '#00d4ff' }] },
        options: { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Distribuicao por Faixa Etaria' } } }
    });
    
    const ctxEstados = document.getElementById('graficoEstados').getContext('2d');
    graficoEstados = new Chart(ctxEstados, {
        type: 'pie', data: { labels: Object.keys(estados), datasets: [{ data: Object.values(estados), backgroundColor: ['#00d4ff', '#7b2cbf', '#ff006e', '#00b894', '#ffa502'] }] },
        options: { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Usuarios por Estado' } } }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo) document.body.setAttribute('data-theme', temaSalvo);
    inicializarDados();
    const form = document.getElementById('formCadastro');
    if (form) form.addEventListener('submit', cadastrarUsuario);
    mostrarSecao('dashboard');
});

window.mostrarSecao = mostrarSecao;
window.carregarLista = carregarLista;
window.deletarUsuario = deletarUsuario;
window.buscarPorCpf = buscarPorCpf;
window.abrirModalEditar = abrirModalEditar;
window.fecharModal = fecharModal;
window.salvarEdicao = salvarEdicao;
window.limparTodosDados = limparTodosDados;
window.exportarDados = exportarDados;
window.importarDados = importarDados;
window.gerarRelatorio = gerarRelatorio;
window.alternarTema = alternarTema;
window.filtrarUsuarios = filtrarUsuarios;
window.limparFiltros = limparFiltros;
window.paginaAnterior = paginaAnterior;
window.proximaPagina = proximaPagina;
window.ordenarTabela = ordenarTabela;
window.validarEmailTempoReal = validarEmailTempoReal;