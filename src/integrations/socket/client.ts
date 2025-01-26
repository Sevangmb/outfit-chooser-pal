import { io } from "socket.io-client";

// L'URL de votre serveur Socket.IO
export const socket = io("http://localhost:3000", {
  autoConnect: false,
  auth: {
    token: "", // Sera mis à jour avec le token Supabase
  },
});

// Mettre à jour le token d'authentification
export const updateSocketAuth = (token: string) => {
  socket.auth = { token };
};

// Gestionnaires d'événements de connexion
socket.on("connect", () => {
  console.log("Connecté au serveur Socket.IO");
});

socket.on("connect_error", (error) => {
  console.error("Erreur de connexion Socket.IO:", error);
});