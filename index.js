const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");
const P = require("pino");
const express = require("express");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    logger: P({ level: "silent" }),
    auth: state,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection } = update;

    if (connection === "open") {
      console.log("✅ BOT CONECTADO");
    }

    if (connection === "close") {
      console.log("❌ DESCONECTADO");
    }
  });

  try {
    const code = await sock.requestPairingCode("5491134403704");
    console.log("🔑 CODIGO:", code);
  } catch (err) {
    console.log("⚠️ Error generando código:", err.message);
  }

  sock.ev.on("creds.update", saveCreds);
}

startBot();

// servidor web obligatorio para Render
const app = express();

app.get("/", (req, res) => {
  res.send("Bot activo");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🌐 Servidor corriendo en puerto " + PORT);
});
