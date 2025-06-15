import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = "ola";

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'master100',
    database: 'burguer'
});


const port = 8080;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


app.post('/cadastrar', async (req, res) => {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
        return res.status(400).json({ success: false, message: "Nome e senha são obrigatórios." });
    }

    try {
        db.query("SELECT * FROM usuarios WHERE nome = ?", [nome], async (err, results) => {
            if (err) {
                console.error("Erro ao verificar usuário:", err);
                return res.status(500).json({ success: false, message: "Erro interno do servidor." });
            }

            if (results.length > 0) {
                return res.status(409).json({ success: false, message: "Usuário já existe." });
            }

            const hashedPassword = await bcrypt.hash(senha, 10);

            db.query("INSERT INTO usuarios (nome, senha) VALUES (?, ?)", [nome, hashedPassword], (err, result) => {
                if (err) {
                    console.error("Erro ao cadastrar:", err);
                    return res.status(500).json({ success: false, message: "Erro ao cadastrar usuário." });
                }

                return res.status(201).json({ success: true, message: "Usuário cadastrado com sucesso!" });
            });
        });
    } catch (error) {
        console.error("Erro inesperado:", error);
        return res.status(500).json({ success: false, message: "Erro inesperado." });
    }
});

app.post('/cadastrarC', async (req, res) => {
    const { nome } = req.body;

    if (!nome ) {
        return res.status(400).json({ success: false, message: "Nome é obrigatório." });
    }

    try {
        db.query("SELECT * FROM tipo_produto WHERE nome = ?", [nome], async (err, results) => {
            if (err) {
                console.error("Erro ao verificar Categoria:", err);
                return res.status(500).json({ success: false, message: "Erro interno do servidor." });
            }

            if (results.length > 0) {
                return res.status(409).json({ success: false, message: "Categoria já existe." });
            }

            db.query("INSERT INTO tipo_produto (nome) VALUES (?)", [nome], (err, result) => {
                if (err) {
                    console.error("Erro ao cadastrar:", err);
                    return res.status(500).json({ success: false, message: "Erro ao cadastrar Categoria." });
                }

                return res.status(201).json({ success: true, message: "Categoria cadastrado com sucesso!" });
            });
        });
    } catch (error) {
        console.error("Erro inesperado:", error);
        return res.status(500).json({ success: false, message: "Erro inesperado." });
    }
});

app.post('/cadastrarP', async (req, res) => {
    const { nome, preco, protipo_id } = req.body;

    if (!nome || !preco || !protipo_id) {
        return res.status(400).json({ success: false, message: "Campos são obrigatórios." });
    }

    try {
        db.query("SELECT * FROM produtos WHERE nome = ?", [nome], async (err, results) => {
            if (err) {
                console.error("Erro ao verificar Produto:", err);
                return res.status(500).json({ success: false, message: "Erro interno do servidor." });
            }

            if (results.length > 0) {
                return res.status(409).json({ success: false, message: "Produto já existe." });
            }

            db.query("INSERT INTO produtos (nome, preco, protipo_id) VALUES (?, ?, ?)", [nome, preco, protipo_id], (err, result) => {
                if (err) {
                    console.error("Erro ao cadastrar:", err);
                    return res.status(500).json({ success: false, message: "Erro ao cadastrar Produto." });
                }

                return res.status(201).json({ success: true, message: "Produto cadastrado com sucesso!" });
            });
        });
    } catch (error) {
        console.error("Erro inesperado:", error);
        return res.status(500).json({ success: false, message: "Erro inesperado." });
    }
});

app.post('/login', (req, res) => {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
        return res.status(400).json({ success: false, message: "Nome e senha são obrigatórios." });
    }

    db.query("SELECT * FROM usuarios WHERE nome = ?", [nome], async (err, results) => {
        if (err) {
            console.error("Erro no banco:", err);
            return res.status(500).json({ success: false, message: "Erro no servidor." });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Usuário não encontrado." });
        }

        const usuario = results[0];

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ success: false, message: "Senha incorreta." });
        }

        const token = jwt.sign({ id: usuario.id, nome: usuario.nome }, JWT_SECRET, { expiresIn: '2h' });

        return res.status(200).json({
            success: true,
            message: "Login realizado com sucesso!",
            token,
            user: {
                id: usuario.id,
                nome: usuario.nome
            }
        });
    });
});


app.get('/produtos', (req, res) => {
    const query = `
        SELECT 
            p.id, 
            p.nome, 
            p.preco,
            p.protipo_id AS tipo_id,
            tp.nome AS tipo 
        FROM produtos p 
        JOIN tipo_produto tp ON p.protipo_id = tp.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Erro ao buscar produtos:", err);
            return res.status(500).json({ success: false, message: "Erro ao buscar produtos" });
        }

        return res.status(200).json({ success: true, data: results });
    });
});

app.get('/usuarios', (req, res) => {
  db.query("SELECT id, nome FROM usuarios", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao buscar usuários" });
    return res.json({ success: true, data: results });
  });
});

app.get('/categorias', (req, res) => {
  db.query("SELECT id, nome FROM tipo_produto", (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Erro ao buscar categorias" });
    }
    return res.json({ success: true, data: results });
  });
});

// Excluir produto
app.delete('/produtos/:id', (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM produtos WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao excluir produto" });
    return res.json({ success: true, message: "Produto excluído com sucesso" });
  });
});

// Excluir usuário
app.delete('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM usuarios WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao excluir usuário" });
    return res.json({ success: true, message: "Usuário excluído com sucesso" });
  });
});

// Excluir categoria
app.delete('/categorias/:id', (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM tipo_produto WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao excluir categoria" });
    return res.json({ success: true, message: "Categoria excluída com sucesso" });
  });
});


app.put('/usuarios/:id', (req, res) => {
  const { nome } = req.body;
  const { id } = req.params;
  db.query("UPDATE usuarios SET nome = ? WHERE id = ?", [nome, id], (err, result) => {
    if (err) return res.status(500).json({ success: false });
    return res.json({ success: true });
  });
});

app.put('/produtos/:id', (req, res) => {
  const { nome, preco, protipo_id } = req.body;
  const { id } = req.params;
  db.query("UPDATE produtos SET nome = ?, preco = ?, protipo_id = ? WHERE id = ?", [nome, preco, protipo_id, id], (err, result) => {
    if (err) return res.status(500).json({ success: false });
    return res.json({ success: true });
  });
});

app.get('/getUserData', (req, res) => { 

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Token de autorização não fornecido ou inválido." });
    }

    const token = authHeader.split(' ')[1];

    console.log("Token recebido (Backend):", token);

    try {

        const decodedToken = jwt.verify(token, JWT_SECRET);
        console.log("Token decodificado (Backend):", decodedToken);

        db.query(`SELECT id, nome FROM usuarios WHERE nome = ?`, [decodedToken.nome], (err, rows) => {
            if (err) {
                console.error("Erro no banco de dados durante getUserData:", err);
                return res.status(500).json({ success: false, message: "Erro interno do servidor ao buscar dados do usuário." });
            }

            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: "Usuário não encontrado" });
            }
            
            const user = rows[0];
            return res.status(200).json({ success: true, user: { nome: user.nome, id: user.id } });
        });

    } catch (error) {
        console.error("Erro no backend durante getUserData (verificação de token):", error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token expirado. Faça login novamente." });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: "Token inválido. Faça login novamente." });
        } else {
            return res.status(500).json({ success: false, message: "Erro interno do servidor ao buscar dados do usuário." });
        }
    }
});

app.post('/pedidos', (req, res) => {
    console.log('Dados recebidos no backend:', req.body); 
    const { usuario_id, itens } = req.body;
    if (!usuario_id || !Array.isArray(itens)) {
        return res.status(400).json({ success: false, message: "Dados inválidos" });
    }

    db.query("INSERT INTO pedidos (usuario_id, data) VALUES (?, NOW())", [usuario_id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Erro ao salvar pedido" });

        const pedidoId = result.insertId;
        const values = itens.map(item => [pedidoId, item.produto_id, item.quantidade]);

        db.query("INSERT INTO pedido_itens (pedido_id, produto_id, quantidade) VALUES ?", [values], (err) => {
            if (err){ 
                console.error("Erro ao inserir itens:", err);
                return res.status(500).json({ success: false, message: "Erro ao salvar itens" });
        }
            return res.json({ success: true, pedidoId });
        });
    });
});
