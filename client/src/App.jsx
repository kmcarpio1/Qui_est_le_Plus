import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { io } from "socket.io-client";



import vote1 from "./assets/vote1.mp3";
import vote2 from "./assets/vote2.mp3";
import vote3 from "./assets/vote3.mp3";
import vote4 from "./assets/vote4.mp3";
import vote5 from "./assets/vote5.mp3";
import vote6 from "./assets/vote6.mp3";
import vote7 from "./assets/vote7.mp3";
import vote8 from "./assets/vote8.mp3";
import vote9 from "./assets/vote9.mp3";
import vote10 from "./assets/vote10.mp3";
import vote11 from "./assets/vote11.mp3";
import vote12 from "./assets/vote12.mp3";

import suspense from "./assets/suspense.mp3";
import result from "./assets/result.mp3";



const SOCKET_URL = import.meta.env.PROD
  ? "https://qui-est-le-plus.onrender.com" // Render
  : "http://localhost:3001";              // Local dev

const socket = io(SOCKET_URL);

// === AUDIO - VARIABLES GLOBALES ===
let voteAudio = null;
let suspenseAudio = null;
let resultAudio = null;

function stopAudio(audio) {
  if (audio) {
    try { audio.pause(); } catch(e) {}
    audio.currentTime = 0;
  }
}


export default function App() {
  const voteMusicList = [
    vote1, vote2, vote3, vote4, vote5, vote6,
    vote7, vote8, vote9, vote10, vote11, vote12
  ];

  const SUSPENSE_MUSIC = suspense;
  const RESULT_MUSIC = result;
  const MAX_VOLUME = 0.2;
  const [lastMusicKey, setLastMusicKey] = useState(null);


  const [mode, setMode] = useState("home");
  const [gameMode, setGameMode] = useState("qui"); // 'qui' ou 'aqui'
  const [roomCode, setRoomCode] = useState("");
  const [userId] = useState(uuidv4());
  const [isHost, setIsHost] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [hasVotedThisQuestion, setHasVotedThisQuestion] = useState(false);
  const [players, setPlayers] = useState([]); // pas vraiment utilisé mais on le garde
  const [judged, setJudged] = useState([]);
  const [questions, setQuestions] = useState([
    "Qui est le plus radin ?",
    "Qui est le plus drôle ?",
    "Qui est le plus en retard ?",
    "Qui est le plus paresseux ?",
    "Qui est le plus beau ?",
    "Qui est le plus prétentieux ?",
    "Qui est le plus maladroit ?",
    "Qui est le plus bavard ?",
    "Qui est le plus sale ?",
    "Qui est le plus jaloux ?",
    "Qui est le plus gourmand ?",
    "Qui est le plus sportif ?",
    "Qui est le plus parano ?",
    "Qui est le plus romantique ?",
    "Qui est le plus coupe parole ?",
    "Qui est le plus sarcastique ?",
    "Qui est le plus sincère ?",
    "Qui est le plus peureux ?",
    "Qui est le plus vieux (mental) ?",
    "Qui est le plus auto-derision ?",
    "Qui est le plus tétu ?",
    "Qui est le plus ponctuel ?",
    "Qui est le plus influençable ?",
    "Qui est le plus sympa ?",
    "Qui est le plus susceptible de mourir en premier ?",
    "Qui est le plus patient ?",
    "Qui est le plus blanc ?",
    "Qui est le plus de gauche ?",
    "Qui est le plus nerveux ?",
    "Qui est le plus généreux ?",
    "Qui est le plus adict aux réseaux ?",
    "Qui est le plus intelligent ?",
    "Qui est le plus 'petit prince' ?",
    "Qui est le plus gooner ?",
    "Qui est le plus fort aux jeux vidéo ?",
    "Qui est le plus créatif ?",
    "Qui est le plus susceptible de tuer quelqu'un ?",
    "Qui est le plus tête en l'air ?",
    "Qui est le plus matrixé ?",
    "Qui est le plus organisé ?",
    "Qui est le plus naïf ?",
    "Qui est le plus traître ?",
    "Qui est le plus fou ?",
    "Qui est le plus vulgaire ?",
    "Qui est le plus susceptible ?",
    "Qui est le plus drôle en soirée ?",
    "Qui est le plus nul en cuisine ?",
    "Qui est le plus discret sur les secrets ?",
    "Qui est le plus de droite ?",
    "Qui est le plus sexy ?",
    "Qui est le plus paresseux ?",
    "Qui est le plus colérique ?",
    "Qui est le plus bruyant ?",
    "Qui est le plus naïf ?",
    "Qui est le plus cultivé ?",
    "Qui est le plus inculte ?",
    "Qui est le plus travailleur ?",
    "Qui est le plus nul aux jeux vidéo ?",
    "Qui est le plus lent ?",
    "Qui est le plus stressé ?",
    "Qui est le plus susceptible de provoquer une bagarre ?",
    "Qui est le plus délu ?",
    "Qui est le plus susceptible de se perdre en voyage ?",
    "Qui est le plus froid ?",
    "Qui est le plus méchant ?",
    "Qui est le plus rancunié ?",
    "Qui est le plus mauvais perdant ?",
    "Qui est le plus malhonnête ?",
    "Qui est le plus influent ?",
    "Qui est le plus délu en amour ?",
    "Qui est le plus égoïste ?",
    "Qui est le plus loyal ?",
    "Qui est le plus courageux ?",
    "Qui est le plus idiot ?",
    "Qui est le plus dépensier ?",
    "Qui est le plus économes ?",
    "Qui est le plus susceptible de commetre un crime ?",
    "Qui est le plus geek ?",
    "Qui est le plus grognon ?",
    "Qui est le plus mal habillé ?",
    "Qui est le plus otakuuuu ?",
    "Qui est le plus raciste ?",
    "Qui est le plus peureux ?",
    "Qui est le plus woke ?",
    "Qui est le plus chanceux ?",
    "Qui est le plus crédule ?",
    "Qui est le plus charmant ?",
    "Qui est le plus malchanceux ?",
    "Qui est le plus menteur ?",
    "Qui est le plus attention whore ?",
    "Qui est le plus vilain ?",
    "Qui est le plus harceleur ?",
    "Qui est le plus susceptible de mentir pour s'en sortir ?",
    "Qui est le plus empathique ?",
    "Qui est le plus boudeur ?",
    "Qui est le plus manipulateur ?",
    "Qui est le plus brouillon ?"
    "Qui est le plus dormeur ?",
    "Qui est le plus ... ?"
  ]);
  const [aQuiQuestions, setAQuiQuestions] = useState([
    "Qui est le plus susceptible de te prêter de l'argent ?",
    "À qui confierais-tu tes enfants pour l'après-midi ?",
    "Qui est le plus loyal ?",
    "À qui demanderais-tu un conseil en amour ?",
    "Qui est le plus susceptible de te couvrir (ex : au travail) ?",
    "Qui est le plus susceptible de te faire rire dans une soirée ?",
    "Qui est le plus susceptible de t'inviter à manger ?",
    "Qui est le plus susceptible de te défendre ?",
    "À qui confierais-tu un secret embarrassant ?",
    "Qui est le plus susceptible de t'oublier un anniversaire ?",
    "Qui est le plus susceptible de mentir pour s'en sortir ?",
    "Qui est le plus susceptible de t'aider à déménager ?",
    "À qui demanderais-tu un coup de main pour un projet ?",
    "Qui est le plus susceptible de tromper quelqu'un ?",
    "À qui demanderais-tu de l'aide si t'as perdu tes clefs au milieu de la nuit ?",
    "Qui est le plus susceptible de te donner un conseil utile ?",
    "À qui confierais-tu ton animal de compagnie ?",
    "Tue en un.",
    "Qui est le plus susceptible de tomber amoureux d'une mauvaise personne ?",
    "Qui est le plus susceptible de t'acheter un cadeau inattendu ?",
    "Qui est le plus susceptible de te tenir compagnie dans un voyage ?",
    "QUi est le plus susceptinle de mourir en premier",
    "Qui est le plus susceptible de se faire virer pour faute grave ?",
    "Qui est le plus susceptible d'avoir son permis en 1er ?",
    "Qui est le plus susceptible de t'emmener dans une aventure imprévue ?",
    "Qui est le plus susceptible de te faire une surprise ?",
    "À qui confierais-tu ton mot de passe en toute confiance ?",
    "Qui est le plus susceptible de te prêter des livres ou des affaires ?",
    "Qui est le plus susceptible de t'abandonner au pire moment ?",
    "Qui est le plus susceptible de t'aider à organiser une fête ?",
    "Qui est le plus susceptible de provoquer une bagarre ?",
    "Qui est le plus susceptible de te rappeler tes rendez-vous ?",
    "Qui est le plus susceptible de t'emmener au cinéma sans prévenir ?",
    "Qui est le plus susceptible de devenir célèbre pour un scandale ?",
    "À qui demanderais-tu de l'aide pour cacher un cadavre (cadavre : surement tibo) ?",
    "Qui est le plus susceptible de t'encourager dans une décision risquée ?",
    "Qui est le plus susceptible de t'emmener à un concert ?",
    "À qui confierais-tu ton smartphone en toute sécurité ?",
    "Qui est le plus susceptible de te prêter une voiture ?",
    "Qui est le plus susceptible de t'aider à réparer quelque chose ?",
    "À qui confierais-tu ton repas préféré à cuisiner ?",
    "Qui est le plus susceptible d'avoir des dettes énormes ?",
    "Qui est le plus susceptible de t'accompagner dans une expérience folle ?",
    "À qui confierais-tu un cadeau pour quelqu'un d'autre ?",
    "Qui est le plus susceptible de t'aider à monter un meuble ?",
    "Qui est le plus susceptible de te raconter une anecdote drôle ?",
    "À qui confierais-tu ton mot de passe bancaire pour un test ?",
    "Qui est le plus susceptible de t'encourager à essayer un sport extrême ?",
    "Qui est le plus susceptible de t'accompagner dans un jeu ou défi ?",
    "À qui confierais-tu la garde de ton sac pendant un voyage ?",
    "Qui est le plus susceptible de t'inviter à un événement inattendu ?",
    "Qui est le plus susceptible de t'aider à apprendre quelque chose de nouveau ?",
    "À qui confierais-tu un objet précieux temporairement ?",
    "Qui est le plus susceptible de t'aider à te préparer pour un rendez-vous ?",
    "Qui est le plus susceptible de te faire une blague inoubliable ?",
    "À qui confierais-tu tes affaires lors d'une activité sportive ?",
    "Qui est le plus susceptible de t'apporter un café au lit ?",
    "Qui est le plus susceptible de t'aider à organiser un pique-nique ?",
    "À qui confierais-tu un secret embarrassant ?"
  ]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [votes, setVotes] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [newName, setNewName] = useState("");
  const [newPhoto, setNewPhoto] = useState("");
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [newClickSoundFile, setNewClickSoundFile] = useState(null);

  const [pair, setPair] = useState([]); // Pour le mode 'aqui'
  const [concerned, setConcerned] = useState(false);

  const [playerCount, setPlayerCount] = useState(0);

  const musicRef = useRef(null);
  const voteMusicRef = useRef(null);
  const resultMusicRef = useRef(null);
  const clickSoundRef = useRef(null);
  const selectSoundRef = useRef(null);

  // --- Réception des états de room du serveur ---
  useEffect(() => {
    socket.on("roomState", (room) => {
      setPlayerCount(room.playerCount || 0);
      setJudged(room.judged || []);
      setVotes(room.votes || {});
      setCurrentQuestion(room.currentQuestion || 0);
      setGameMode(room.gameMode || "qui");
      setPair(room.pair || []);

      // Gestion du mode (ne pas changer si on est en config)
      if (room.phase && mode !== "config") {
        setMode(room.phase);
      }

      // Reset uniquement en phase 'game'
      if (room.phase === "game") {
        setHasVotedThisQuestion(false);
      }
      // Reset vote local
      setHasVotedThisQuestion(false);

      // ---- GESTION MUSIQUE ----
      const phase = room.phase;
      const qIndex = room.currentQuestion || 0;

      // Si on vient de changer de phase, on met à jour la musique
      if (phase === "game") {
        // Musique de vote
        const key = `vote-${qIndex}`;
        if (key !== lastMusicKey) {
          setLastMusicKey(key);
          playVoteMusic(qIndex);
        }
      }
      else if (phase === "result") {
        // Suspense puis résultat
        const key = `result-${qIndex}`;
        if (key !== lastMusicKey) {
          setLastMusicKey(key);
          playSuspenseThenResult();
        }
      }
    });

    return () => {
      socket.off("roomState");
    };
  }, [mode, lastMusicKey]);


  function unlockAudio() {
    const a = new Audio(); 
    a.play().catch(() => {});
  }

  
  // Musique de vote (loop) en fonction de l'index de la question
  function playVoteMusic(questionIndex) {
    stopAudio(voteAudio);
    stopAudio(suspenseAudio);
    stopAudio(resultAudio);

    if (!voteMusicList.length) return;

    const index = questionIndex % voteMusicList.length;
    const src = voteMusicList[index];

    voteAudio = new Audio(src);
    voteAudio.volume = MAX_VOLUME;
    voteAudio.loop = true;
    voteAudio.play().catch(() => {});
  }

  // Suspense puis résultat
  function playSuspenseThenResult() {
    stopAudio(voteAudio);
    stopAudio(suspenseAudio);

    //suspenseAudio = new Audio(SUSPENSE_MUSIC);
    //suspenseAudio.volume = MAX_VOLUME;
    //suspenseAudio.play().catch(() => {});
//
    //suspenseAudio.onended = () => {
      resultAudio = new Audio(RESULT_MUSIC);
      resultAudio.volume = MAX_VOLUME;
      resultAudio.loop = true;
      resultAudio.play().catch(() => {});
    };
  
  // --- Fonctions réseau ---

  function createRoom() {
    socket.emit("createRoom", { userId, gameMode }, (res) => {
      if (res?.code) {
        setRoomCode(res.code);
        setIsHost(true);
        // le serveur va passer la phase à "lobby" et envoyer roomState
      }
    });
  }

  function joinRoom() {
    if (!roomCode.trim()) {
      alert("Entre un code de room.");
      return;
    }
    socket.emit("joinRoom", { code: roomCode.trim().toUpperCase(), userId }, (res) => {
      if (res?.error) {
        alert(res.error);
      } else {
        setIsHost(false);
      }
    });
  }

function addJudged() {
  if (!roomCode) return;
  if (!newName.trim()) return;
  if (judged.length >= 20) return alert("Nombre maximum de jugés atteint (20)");

  const judgedObj = { name: newName.trim() };

  const pushToServer = (obj) => {
    socket.emit("addJudged", { code: roomCode, judgedObj: obj });

    // Reset des champs
    setNewName("");
    setNewPhoto("");
    setNewPhotoFile(null);
    setNewClickSoundFile(null);

    // Force le reset de l'input file pour pouvoir re-sélectionner le même fichier
    setFileInputKey((k) => k + 1);
  };

  if (newPhotoFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      judgedObj.photo = e.target?.result;
      if (newClickSoundFile) {
        const soundReader = new FileReader();
        soundReader.onload = (ev) => {
          judgedObj.clickSound = ev.target?.result;
          pushToServer(judgedObj);
        };
        soundReader.readAsDataURL(newClickSoundFile);
      } else {
        pushToServer(judgedObj);
      }
    };
    reader.readAsDataURL(newPhotoFile);
  } else if (newPhoto.trim()) {
    judgedObj.photo = newPhoto.trim();
    pushToServer(judgedObj);
  } else {
    // Jugé sans photo (autorisé si tu veux)
    pushToServer(judgedObj);
  }
}

  function confirmVote() {
    if (hasVotedThisQuestion) return;
    if (!selectedPlayer && !concerned) return;
    if (!roomCode) return;


    socket.emit("vote", {
      code: roomCode,
      userId,
      selectedPlayer: concerned ? null : selectedPlayer,
      concerned,
    });

    setHasVotedThisQuestion(true);
    setSelectedPlayer(null);
    setConcerned(false);
  }

  function startGame() {
    if (!isHost || !roomCode) return;
    if (!judged.length) {
      alert("Ajoute au moins un jugé avant de lancer la partie.");
      return;
    }

    // Reset de l'état local pour cette nouvelle manche
    setSelectedPlayer(null);
    setConcerned(false);
    setHasVotedThisQuestion(false);

    socket.emit("startGame", { code: roomCode });
  }

  function nextQuestion() {
  
    if (!isHost || !roomCode) return;

    // On reset l'état de vote local pour la question suivante
    setSelectedPlayer(null);
    setConcerned(false);
    setHasVotedThisQuestion(false);

    socket.emit("nextQuestion", { code: roomCode });
  }


  // --- Classes CSS ---
  const containerClass =
    "p-6 max-w-4xl mx-auto text-center flex flex-col items-center bg-gradient-to-b from-purple-200 to-pink-300 rounded-3xl shadow-2xl mt-6";
  const buttonClass =
    "p-4 text-white rounded-3xl shadow-lg transform hover:scale-105 transition-all duration-200 font-bold text-xl disabled:opacity-60 disabled:cursor-not-allowed";
  const inputClass = "border-4 border-yellow-300 p-3 w-full rounded-3xl";
  const judgedCardClass =
    "p-2 border-4 border-green-200 rounded-3xl flex flex-col items-center bg-yellow-50 shadow-inner w-36";
  const gameCardClass =
    "p-2 border-4 border-purple-400 rounded-3xl flex flex-col items-center bg-pink-100 shadow-inner transform transition-all duration-200 cursor-pointer w-36";

  return (
    <div className={containerClass}>
      {/* --- HOME --- */}
      {mode === "home" && (
        <div className="space-y-4 w-full">
          <h1
            className="text-5xl font-extrabold text-yellow-400 drop-shadow-lg"
            style={{ fontFamily: "Comic Sans MS, sans-serif" }}
          >
            Qui est le + ? / À qui ?
          </h1>
          <div className="flex space-x-4 justify-center">
            <button
              className={`${buttonClass} ${
                gameMode === "qui"
                  ? "bg-blue-700 hover:bg-blue-600"
                  : "bg-blue-500 hover:bg-blue-400"
              }`}
              onClick={() => setGameMode("qui")}
            >
              Qui est le + ?
            </button>
            <button
              className={`${buttonClass} ${
                gameMode === "aqui"
                  ? "bg-purple-700 hover:bg-purple-600"
                  : "bg-purple-500 hover:bg-purple-400"
              }`}
              onClick={() => setGameMode("aqui")}
            >
              À qui ?
            </button>
          </div>
          <button
            className={`${buttonClass} bg-green-500 hover:bg-green-400 w-full mt-4`}
            onClick={() => {
              unlockAudio();   // 👈 important pour l'autoplay
              createRoom();
            }}
          >
            Créer une room
          </button>
          
          <div className="space-y-2">
            <input
              className={inputClass}
              placeholder="Code de la room"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />
            <button
              className={`${buttonClass} bg-green-500 hover:bg-green-400 w-full`}
              onClick={() => {
                unlockAudio();
                joinRoom();
              }}
            >
              Rejoindre
            </button>
          </div>
        </div>
      )}

      {/* --- GAME --- */}
      {mode === "game" && (
        <div className="space-y-4 w-full">
          {gameMode === "qui" && (
            <>
              <h2 className="text-4xl font-bold text-purple-700 mb-4">
                {questions[currentQuestion]}
              </h2>
              <div className="flex flex-wrap justify-center gap-6">
                {judged.map((p, i) => (
                  <button
                    key={i}
                    className={`${gameCardClass} ${
                      selectedPlayer === p.name
                        ? "scale-110 border-yellow-500"
                        : "hover:scale-105"
                    }`}
                    onClick={() => setSelectedPlayer(p.name)}
                  >
                    {p.photo && (
                      <img
                        src={p.photo}
                        className="w-32 h-32 object-cover rounded-3xl"
                      />
                    )}
                    <p className="font-bold mt-2 text-purple-700 text-xl">
                      {p.name}
                    </p>
                  </button>
                ))}
              </div>
              <button
                className={`${buttonClass} bg-purple-500 hover:bg-purple-400 w-full`}
                onClick={confirmVote}
                disabled={hasVotedThisQuestion || !selectedPlayer}
              >
                Confirmer
              </button>

            </>
          )}

          {gameMode === "aqui" && pair.length === 2 && (
            <>
              <h2 className="text-4xl font-bold text-purple-700 mb-4">
                {aQuiQuestions[currentQuestion]}
              </h2>
              <p className="text-lg mb-2">Choisis qui correspond le mieux :</p>
              <div className="flex justify-center gap-6">
                {pair.map((p, i) => (
                  <button
                    key={i}
                    className={`${gameCardClass} ${
                      selectedPlayer === p.name
                        ? "scale-110 border-yellow-500"
                        : "hover:scale-105"
                    }`}
                    onClick={() => setSelectedPlayer(p.name)}
                  >
                    {p.photo && (
                      <img
                        src={p.photo}
                        className="w-32 h-32 object-cover rounded-3xl"
                      />
                    )}
                    <p className="font-bold mt-2 text-purple-700 text-xl">
                      {p.name}
                    </p>
                  </button>
                ))}
              </div>
              <label className="mt-2 flex items-center justify-center gap-2 text-purple-700 font-bold">
                <input
                  type="checkbox"
                  checked={concerned}
                  onChange={(e) => setConcerned(e.target.checked)}
                />{" "}
                Je suis concerné (ne pas voter)
              </label>
              <button
                className={`${buttonClass} bg-purple-500 hover:bg-purple-400 w-full`}
                onClick={confirmVote}
                disabled={hasVotedThisQuestion || (!selectedPlayer && !concerned)}
              >
                Confirmer
              </button>

            </>
          )}
        </div>
      )}

      {/* --- LOBBY --- */}
      {mode === "lobby" && (
        <div className="space-y-4 w-full flex flex-col items-center">
          <h2
            className="text-4xl font-bold text-orange-400 drop-shadow-lg"
            style={{ fontFamily: "Comic Sans MS, sans-serif" }}
          >
            Room {roomCode}
          </h2>
          <div className="p-3 border-4 border-blue-200 rounded-3xl mb-4 font-bold text-purple-700">
            Nombre de joueurs connectés: {playerCount}
          </div>
          <p className="text-lg font-semibold text-purple-700">
            En attente que l'host configure la partie…
          </p>
          <div className="flex w-full justify-between mt-4">
            <div className="space-y-3">
              {judged.map((p, i) => (
                <div key={i} className={judgedCardClass}>
                  {p.photo && (
                    <img
                      src={p.photo}
                      className="w-20 h-20 object-cover rounded-3xl"
                    />
                  )}
                  <p className="text-sm mt-2 font-bold text-pink-600">
                    {p.name}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {judged.map((p, i) => (
                <div key={i} className={judgedCardClass}>
                  {p.photo && (
                    <img
                      src={p.photo}
                      className="w-20 h-20 object-cover rounded-3xl"
                    />
                  )}
                  <p className="text-sm mt-2 font-bold text-pink-600">
                    {p.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {isHost && (
            <div className="mt-4 flex space-x-4">
              <button
                className={`${buttonClass} bg-purple-500 hover:bg-purple-400`}
                onClick={() => setMode("config")}
              >
                Configurer les jugés
              </button>
              <button
                className={`${buttonClass} bg-blue-600 hover:bg-blue-500`}
                onClick={startGame}
              >
                Lancer la partie
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- CONFIG --- */}
      {mode === "config" && isHost && (
        <div className="space-y-4 w-full">
          <button
            className={`${buttonClass} bg-gray-400 hover:bg-gray-300 mb-4`}
            onClick={() => setMode("lobby")}
          >
            Retour au lobby
          </button>
          <h2 className="text-3xl font-bold text-purple-600 mb-2">
            Ajouter des jugés
          </h2>
          <div className="grid grid-cols-3 gap-4 items-start">
            <div className="col-span-1 space-y-2">
              <h3 className="text-lg font-semibold text-pink-500">Jugés</h3>
              {judged.length === 0 && (
                <p className="text-sm text-gray-500">Aucun jugé ajouté</p>
              )}
              {judged.map((p, i) => (
                <div key={i} className={judgedCardClass}>
                  {p.photo && (
                    <img
                      src={p.photo}
                      className="w-20 h-20 object-cover rounded-3xl"
                    />
                  )}
                  <p className="text-sm mt-2 font-bold text-pink-600">
                    {p.name}
                  </p>
                </div>
              ))}
            </div>
            <div className="col-span-2 space-y-3">
              <input
                className={inputClass}
                placeholder="Nom"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <input
                key={fileInputKey}
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => setNewPhotoFile(e.target.files?.[0] || null)}
              />
              <input
                className={inputClass}
                placeholder="URL Photo"
                value={newPhoto}
                onChange={(e) => setNewPhoto(e.target.value)}
              />
              <input
                type="file"
                accept="audio/mpeg"
                onChange={(e) => setNewClickSoundFile(e.target.files[0])}
              />
              <button
                className={`${buttonClass} bg-blue-500 hover:bg-blue-400 w-full`}
                onClick={addJudged}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- RESULT --- */}
      {mode === "result" && (
        <ResultScreen
          judged={judged}
          votes={votes}
          nextQuestion={nextQuestion}
          currentQuestion={currentQuestion}
          questions={questions}
          aQuiQuestions={aQuiQuestions}
          buttonClass={buttonClass}
          judgedCardClass={judgedCardClass}
          gameMode={gameMode}
          pair={pair}
          isHost={isHost}
        />
      )}
    </div>
  );
}
function ResultScreen({
  judged,
  votes,
  nextQuestion,
  currentQuestion,
  questions,
  aQuiQuestions,
  buttonClass,
  judgedCardClass,
  gameMode,
  pair,
  isHost
}) {
  const [showWinner, setShowWinner] = React.useState(false);
  const [showVotes, setShowVotes] = React.useState(false);

  const isQuiMode = gameMode === "qui";
  const displayQuestion = isQuiMode
    ? questions[currentQuestion]
    : aQuiQuestions[currentQuestion];
  const cleanedQuestion = displayQuestion
    .replace(/^Qui est le plus /i, "")
    .replace(/\?$/, "");

  // --- Gestion des gagnants (y compris égalité) ---
  const entries = Object.entries(votes);
  const maxVotes = entries.length ? Math.max(...entries.map(([_, v]) => v)) : 0;

  // Noms de tous les gagnants (ceux qui ont maxVotes)
  const winners = maxVotes > 0
    ? entries.filter(([_, v]) => v === maxVotes).map(([name]) => name)
    : [];

  // Objets complets des gagnants (nom + photo, etc.)
  const winnersData = judged.filter((p) => winners.includes(p.name));

  React.useEffect(() => {
    const suspense = setTimeout(() => setShowWinner(true), 2000);
    const votesDelay = setTimeout(() => setShowVotes(true), 3000);
    return () => {
      clearTimeout(suspense);
      clearTimeout(votesDelay);
    };
  }, []);

  // Opposants = tous ceux qui ne sont pas gagnants
  const baseList =
    !isQuiMode && pair.length === 2
      ? pair
      : judged;

  const opponents = baseList.filter((p) => !winners.includes(p.name));

  const totalQuestions = isQuiMode ? questions.length : aQuiQuestions.length;
  const isLastQuestion = currentQuestion + 1 >= totalQuestions;

  return (
    <div className="space-y-4 w-full">
      <h2 className="text-4xl font-bold text-orange-500 mb-4">Résultats</h2>

      {!showWinner && (
        <div className="animate-pulse text-2xl font-bold text-purple-700">
          Révélation en cours...
        </div>
      )}

      {showWinner && winnersData.length > 0 && (
        <div className="space-y-4">
          {winnersData.map((winnerData) => (
            <div
              key={winnerData.name}
              className="p-4 border-4 border-purple-400 rounded-3xl text-center bg-pink-100 shadow-lg"
            >
              {winnerData.photo && (
                <img
                  src={winnerData.photo}
                  className="w-48 h-48 object-cover rounded-3xl mx-auto"
                />
              )}
              <h1 className="text-4xl font-extrabold mt-2 text-purple-700">
                {isQuiMode
                  ? `${winnerData.name} est le plus ${cleanedQuestion} (${maxVotes} vote${maxVotes > 1 ? "s" : ""})`
                  : `${winnerData.name} a été choisi 🎉 (${maxVotes} vote${maxVotes > 1 ? "s" : ""})`}
              </h1>
            </div>
          ))}
        </div>
      )}

      {showVotes && (
        <div className="relative w-full h-64">
          {opponents.map((p, i) => {
            const top = 20 + (i % 3) * 90;
            const left = 20 + (i % 4) * 140;
            const rotate = (Math.random() - 0.5) * 10;
            return (
              <div
                key={p.name}
                className={`${judgedCardClass} absolute`}
                style={{
                  top: `${top}px`,
                  left: `${left}px`,
                  transform: `rotate(${rotate}deg)`
                }}
              >
                {p.photo && (
                  <img
                    src={p.photo}
                    className="w-20 h-20 object-cover rounded-3xl mx-auto"
                  />
                )}
                <p className="font-bold text-purple-700 text-center">
                  {p.name}: {votes[p.name] || 0} vote(s)
                </p>
              </div>
            );
          })}
        </div>
      )}

      {!isLastQuestion ? (
        <button
          className={`${buttonClass} bg-blue-600 hover:bg-blue-500 w-full`}
          onClick={nextQuestion}
          disabled={!isHost}
        >
          {isHost ? "Question suivante" : "En attente de l'host..."}
        </button>
      ) : (
        <button
          className={`${buttonClass} bg-green-600 hover:bg-green-500 w-full`}
          onClick={() => window.location.reload()}
        >
          Retour au menu
        </button>
      )}
    </div>
  );
}
