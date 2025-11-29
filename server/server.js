const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const path = require("path");


const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://qui-est-le-plus.onrender.com", // tout le monde peut se connecter, utile pour test
    methods: ["GET", "POST"]
  }
});


// Servir le build React
app.use(express.static(path.join(__dirname, "../client/build")));

// Pour toutes les autres routes, renvoyer index.html (React gère le routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});



// Rooms en mémoire
const rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function chooseRandomPair(judged) {
  if (!judged || judged.length < 2) return [];
  const shuffled = [...judged].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
}

function getPublicRoomState(code, room) {
  return {
    code,
    hostId: room.hostId,
    judged: room.judged,
    currentQuestion: room.currentQuestion,
    votes: room.votes,
    playerCount: room.playerCount,
    gameMode: room.gameMode,
    phase: room.phase,
    pair: room.pair,
    votedUsersCount: room.votedUsers.size
  };
}

io.on("connection", (socket) => {
  console.log("Nouvelle connexion", socket.id);

  socket.on("createRoom", ({ userId, gameMode }, callback) => {
    const code = generateRoomCode();
    rooms[code] = {
      hostId: userId,
      judged: [],
      currentQuestion: 0,
      votes: {},
      playerCount: 1,
      gameMode: gameMode || "qui",
      phase: "lobby",
      pair: [],
      votedUsers: new Set()
    };

    socket.join(code);
    if (callback) callback({ code });

    io.to(code).emit("roomState", getPublicRoomState(code, rooms[code]));
  });

  socket.on("joinRoom", ({ code, userId }, callback) => {
    const room = rooms[code];
    if (!room) {
      if (callback) callback({ error: "Room introuvable" });
      return;
    }

    room.playerCount += 1;
    socket.join(code);
    if (callback) callback({ ok: true, gameMode: room.gameMode });

    io.to(code).emit("roomState", getPublicRoomState(code, room));
  });

  socket.on("addJudged", ({ code, judgedObj }) => {
    const room = rooms[code];
    if (!room) return;
    
    room.judged.push(judgedObj);
    io.to(code).emit("roomState", getPublicRoomState(code, room));
  });

  socket.on("startGame", ({ code }) => {
    const room = rooms[code];
    if (!room) return;

    room.currentQuestion = 0;
    room.votes = {};
    room.votedUsers = new Set();
    room.phase = "game";
    room.pair = room.gameMode === "aqui" ? chooseRandomPair(room.judged) : [];

    io.to(code).emit("roomState", getPublicRoomState(code, room));
  });

  socket.on("vote", ({ code, userId, selectedPlayer, concerned }) => {
    const room = rooms[code];
    if (!room) return;

    if (!concerned && selectedPlayer) {
      room.votes[selectedPlayer] = (room.votes[selectedPlayer] || 0) + 1;
    }
    room.votedUsers.add(userId);

    // Quand tout le monde a voté → passer en mode "result"
    if (room.votedUsers.size >= room.playerCount) {
      room.phase = "result";
    }

    io.to(code).emit("roomState", getPublicRoomState(code, room));
  });

  socket.on("nextQuestion", ({ code }) => {
    const room = rooms[code];
    if (!room) return;

    room.currentQuestion += 1;
    room.votes = {};
    room.votedUsers = new Set();
    room.phase = "game";
    room.pair = room.gameMode === "aqui" ? chooseRandomPair(room.judged) : [];

    io.to(code).emit("roomState", getPublicRoomState(code, room));
  });

  socket.on("disconnect", () => {
    console.log("Déconnexion", socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log("Serveur Socket.io sur port", PORT);
});
