import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import P from 'pino'

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')

    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        auth: state,
    })

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update

        if (connection === 'open') {
            console.log('✅ BOT CONECTADO')
        }

        if (connection === 'close') {
            console.log('❌ DESCONECTADO')

            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

            if (shouldReconnect) {
                console.log('🔄 Reconectando...')
                startBot()
            }
        }

        // 👇 SOLO pedir código cuando NO esté registrado
        if (connection === 'connecting') {
            try {
                const code = await sock.requestPairingCode('5491134403704')
                console.log('📱 CODIGO:', code)
            } catch (e) {}
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

startBot()

// 🌐 servidor para Render (IMPORTANTE)
import express from "express"
const app = express()

app.get("/", (req, res) => {
    res.send("Bot activo")
})

const PORT = process.env.PORT || 10000
app.listen(PORT, () => console.log("Running on port " + PORT))
