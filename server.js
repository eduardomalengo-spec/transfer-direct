const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir arquivos estáticos da pasta atual (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Gerenciamento de conexões via WebSocket (Sinalização P2P)
io.on('connection', (socket) => {
    console.log(`[+] Novo cliente conectado: ${socket.id}`);

    // Cliente entra em uma sala específica de pareamento
    socket.on('join-room', (roomCode) => {
        socket.join(roomCode);
        console.log(`[Room] Cliente ${socket.id} entrou na sala: ${roomCode}`);
        
        // Avisar os outros na sala que alguém entrou
        socket.to(roomCode).emit('peer-joined', socket.id);
    });

    // Repassar oferta WebRTC
    socket.on('offer', ({ roomCode, offer }) => {
        socket.to(roomCode).emit('offer', offer);
    });

    // Repassar resposta WebRTC
    socket.on('answer', ({ roomCode, answer }) => {
        socket.to(roomCode).emit('answer', answer);
    });

    // Repassar ICE Candidates
    socket.on('ice-candidate', ({ roomCode, candidate }) => {
        socket.to(roomCode).emit('ice-candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log(`[-] Cliente desconectado: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando cirúrgico em: http://localhost:${PORT}`);
});