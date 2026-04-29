import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys"
import P from "pino"
import express from "express"

const NUMERO = "5491134403704"

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")

  const sock = makeWASocket({
    logger: P({ level: "silent" }),
    auth: state
  })

  sock.ev.on("connection.update", async (update) => {
    const { connection } = update

    if (connection === "open") {
      console.log("✅ BOT CONECTADO")
    }

    if (connection === "close") {
      console.log("❌ DESCONECTADO")
    }
  })

  // 👉 GENERA SOLO UN CÓDIGO
  const code = await sock.requestPairingCode(NUMERO)
  console.log("📱 CODIGO:", code)

  sock.ev.on("creds.update", saveCreds)
}

startBot()

const app = express()

app.get("/", (req, res) => {
  res.send("Bot activo")
})

const PORT = process.env.PORT || 10000
app.listen(PORT, () => console.log("Running on port " + PORT))
