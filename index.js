import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import P from 'pino'
import express from "express"

const NUMERO = '5491134403704' // ⚠️ poné tu número

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')

    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        auth: state,
    })

    let intervaloCodigo

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update

        if (connection === 'connecting') {
            console.log('🟡 Generando código cada 10 segundos...')

            clearInterval(intervaloCodigo)

            intervaloCodigo = setInterval(async () => {
                try {
                    const code = await sock.requestPairingCode(NUMERO)
                    console.log('📱 CODIGO:', code)
                } catch (e) {}
            }, 10000)
        }

        if (connection === 'open') {
            console.log('✅ BOT CONECTADO')
            clearInterval(intervaloCodigo)
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
    })

    sock.ev.on('creds.update', saveCreds)
}

startBot()

// 🌐 servidor para Render
const app = express()

app.get("/", (req, res) => {
    res.send("Bot activo")
})

const PORT = process.env.PORT || 10000
app.listen(PORT, () => console.log("Running on port " + PORT))
