DROP DATABASE IF EXISTS burguer;
CREATE DATABASE burguer;
USE burguer;

CREATE TABLE usuarios (
	id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255),
    senha VARCHAR(255),
    funcao VARCHAR(255) DEFAULT 'user'
);

CREATE TABLE tipo_produto (
	id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255)
);

CREATE TABLE produtos(
	id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255),
    preco FLOAT,
    protipo_id INT,
    FOREIGN KEY (protipo_id) REFERENCES tipo_produto(id) ON DELETE CASCADE
);

-- Corrigido:
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE pedido_itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

-- Dados iniciais:
INSERT INTO tipo_produto (nome) VALUES ('hamburger');
INSERT INTO produtos (nome, preco, protipo_id) VALUES ('teste', 100, 1);
INSERT INTO usuarios (nome, senha, funcao) VALUES ('admin', '$2b$10$aquw0nNwIdTXKLAoKYSuYujwm.0becym1OSXfWbWo15OqWkGkqLuG', 'admin');

SELECT * FROM pedidos;
SELECT * FROM pedido_itens;
SELECT * FROM usuarios;

