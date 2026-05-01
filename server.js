const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta atual
app.use(express.static(__dirname));

// Helper para ler o db.json
const readDB = () => {
  const data = fs.readFileSync(path.join(__dirname, "db.json"), "utf8");
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(path.join(__dirname, "db.json"), JSON.stringify(data, null, 2));
};

// GET - Listar todos os usuários
app.get("/usuarios", (req, res) => {
  const db = readDB();
  const { cpf } = req.query;
  
  if (cpf) {
    const usuario = db.pessoas.find(p => p.cpf === cpf);
    return res.json(usuario ? [usuario] : []);
  }
  
  res.json(db.pessoas);
});

// GET - Buscar usuário por ID
app.get("/usuarios/:id", (req, res) => {
  const db = readDB();
  const usuario = db.pessoas.find(p => p.id == req.params.id);
  
  if (!usuario) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }
  
  res.json(usuario);
});

// POST - Criar novo usuário
app.post("/usuarios", (req, res) => {
  const db = readDB();
  const { nome, sobrenome, email, idade, telefone, rua, bairro, cidade, estado, rg, cpf } = req.body;
  
  // Verificar se CPF já existe
  if (db.pessoas.some(p => p.cpf === cpf)) {
    return res.status(400).json({ error: "CPF já cadastrado" });
  }
  
  const novoUsuario = {
    id: db.pessoas.length > 0 ? Math.max(...db.pessoas.map(p => p.id)) + 1 : 1,
    nome,
    sobrenome: sobrenome || "",
    email: email || "",
    idade: idade || "",
    telefone: telefone || "",
    endereco: {
      rua: rua || "",
      bairro: bairro || "",
      cidade: cidade || "",
      estado: estado || ""
    },
    rg: rg || "",
    cpf
  };
  
  db.pessoas.push(novoUsuario);
  writeDB(db);
  
  res.status(201).json(novoUsuario);
});

// PUT - Atualizar usuário completo
app.put("/usuarios/:id", (req, res) => {
  const db = readDB();
  const index = db.pessoas.findIndex(p => p.id == req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }
  
  db.pessoas[index] = { ...db.pessoas[index], ...req.body, id: parseInt(req.params.id) };
  writeDB(db);
  
  res.json(db.pessoas[index]);
});

// PATCH - Atualização parcial
app.patch("/usuarios/:id", (req, res) => {
  const db = readDB();
  const index = db.pessoas.findIndex(p => p.id == req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }
  
  db.pessoas[index] = { ...db.pessoas[index], ...req.body };
  writeDB(db);
  
  res.json(db.pessoas[index]);
});

// DELETE - Remover usuário
app.delete("/usuarios/:id", (req, res) => {
  const db = readDB();
  const index = db.pessoas.findIndex(p => p.id == req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }
  
  db.pessoas.splice(index, 1);
  writeDB(db);
  
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 API de usuários disponível em http://localhost:${PORT}/usuarios`);
});