import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys'
import pino from 'pino'

const { state, saveCreds } = await useMultiFileAuthState('auth')

const sock = makeWASocket({
  auth: state,
  logger: pino({ level: 'silent' }),
})

sock.ev.on('creds.update', saveCreds)

if (!sock.authState.creds.registered) {
  const code = await sock.requestPairingCode('5491134403704')
  console.log('CODIGO:', code)
}

sock.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0]
  if (!msg.message) return

  const texto = msg.message.conversation || ''

  if (texto === '!ping') {
    await sock.sendMessage(msg.key.remoteJid, { text: 'pong 🏓' })
  }

  if (texto === '!menu') {
    await sock.sendMessage(msg.key.remoteJid, {
      text: '🤖 Bot activo\n\n!ping\n!menu'
    })
  }
})
