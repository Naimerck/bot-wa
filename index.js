import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys'
import P from 'pino'

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    auth: state
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection } = update

    if (connection === 'open') {
      console.log('✅ BOT CONECTADO')
    }

    if (connection === 'close') {
      console.log('❌ DESCONECTADO')
    }
  })

  const code = await sock.requestPairingCode('5491134403704')
  console.log('📲 CODIGO:', code)

  sock.ev.on('creds.update', saveCreds)
}

startBot()
