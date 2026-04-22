const { Client, Options } = require('discord.js-selfbot-v13');
const http = require('http');

// =========================================================
// 🛡️ PROTECCIÓN CONTRA CRASHES
// =========================================================
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ [ANTI-CRASH] Rechazo no manejado:', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
    console.error('⚠️ [ANTI-CRASH] Excepción no capturada:', err?.message || err);
});

// =========================================================
// 🔥 TOKENS (5 cuentas vía variables de entorno)
// =========================================================
const tokens = [
    process.env.TOKEN_1,
    process.env.TOKEN_2,
    process.env.TOKEN_3,
    process.env.TOKEN_4,
    process.env.TOKEN_5
].filter(t => t && t.length > 10);

// =========================================================
// 🎯 CONFIGURACIÓN
// =========================================================

const CANAL_SPAM_NORMAL = "1481514534190448815";
const SERVIDOR_RESTRINGIDO = "1239701315580592148";

const CANALES_AUTORESPUESTA_EN_RESTRINGIDO = new Set([
    "1270239207071420450",
    "1266542890767876229",
    "1240012616328544419",
    "1239719951435304960"
]);

const VIGILADOS = new Set([
    "1431785955559215184", "1457521662303015040", "1485179919523643454",
    "1003450010702205030", "1480289152397213907", "1467397075204309034",
    "1457175804290007197", "1429887342373765146", "1425209744603218020",
    "1492265983165862029", "1493834586755694672"
]);

const IDS_UNIFICADAS = "<@1490277865818689700> <@1494684335352316065> <@1442335922111910024> <@1346593401088249977> <@1429887342373765146> <@1493426752536711230> <@1493834586755694672> <@1425209744603218020> <@1492265983165862029> <@1427713721479987232> <@984956970014486528> <@1072352198836621385> <@1429177016703516764> <@1438314463970328578> <@1446586105553227807> <@957014429822750771> <@1423439348430405722> <@1455444386421674007> <@1394021604127936772> <@1452533908699611236> <@1459077041637953651> <@1468117706099396816> <@1467397075204309034> <@1466878653932634195> <@1458314974794616902> <@1470913175401533543> <@1464354934785839155> <@1394023020896714762> <@1399500980889976902> <@1462897561894649876> <@1386330375952793723> <@1353778890514108456> <@1480289152397213907> <@1457175804290007197> <@1490277865818689700> <@1492675664682287277> <@1487148931535212817> <@1457521662303015040>";

const MENSAJE_AUTORESPUESTA = "MAMITA QUERIDA QUE PUTITA Q ERES, NO SE QUIEN SERÁ TU CULITO PERO SI TU CULITO RECIBE ESTO ES PORQUE BÁSICAMENTE ME LA PELAS Y DESCONOZCO QUIEN SERÁS FEMINA PERO SIEMPRE VAS A ENTENDER Q A MI ME LA PELAS COMO CJOTIÑA JAKSJJAJSA Y POR ESO TE DEJO MIS BOLAS DRENADAS Y ENSALOBADAS POR LA MICHOACANA DE CJOTORRA CHE";

const TEXTOS_SPAM = [
    "PVTITA RETIRADA VÁMONOS A SPOM DE AÑOS POR NO DECIR TODA LA VDIA😂🤣🤣🤣🤣 MEJICHANGA MONCLOVEÑANGA COAHUILA PUTA JSJSJSJS",
    "JSJSJS MEJICHANGAS RETIRADAS AL SPAM ETERNO 🤣🤣🤣 PEDORRASO DE MAMITAS CHIE ACÁ SE VAN A QUEDAR HASTA Q YO ME MUERA JSJSJSJS😂",
    "PAR DE MEJICHANGAS YO HAGO ALIANZAS CON MI DIOSA CHILENA... AL FINAL SI ME DAN A ELEGIR EN PARTIRLE EI CULO A GAMAMITA O HACER PACES CON MI EX ALIADA CHILENA... PUES ME QUEDO CON LA CHILENA Y Q TIENE DE MALO😂🤣🤣🤣"
];

const MULTIMEDIA = [
    "https://files.catbox.moe/nlvkg4.mp4",
    "https://cdn.discordapp.com/attachments/1369181247896817685/1483287824055799870/descarga_6.mp4",
    "https://files.catbox.moe/d0wcx2.mp4"
];

const ESTADOS = ["Free Fire", "Spotify", "YouTube", "Call of Duty", "TikTok"];
const TIPOS = ['PLAYING', 'LISTENING', 'WATCHING'];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// =========================================================
// 🧠 ESTADO GLOBAL
// =========================================================
let botsActivos = [];
let turnoActual = 0;
let alertaAutoRespondedor = false;
let cachedChannel = null;

// Cada 2 segundos se limpia la alerta para no responder múltiples veces al mismo mensaje
setInterval(() => {
    alertaAutoRespondedor = false;
}, 2000);

// =========================================================
// 📝 FUNCIONES
// =========================================================

function generarMensajeSpam() {
    const texto = TEXTOS_SPAM[Math.floor(Math.random() * TEXTOS_SPAM.length)];
    const media = MULTIMEDIA[Math.floor(Math.random() * MULTIMEDIA.length)];
    const salt = `[\`${Math.random().toString(36).substring(7).toUpperCase()}\`]`;
    return `${IDS_UNIFICADAS}\n${texto}\n${media}\n${salt}`;
}

function generarMensajeAutorespuesta() {
    const media = MULTIMEDIA[Math.floor(Math.random() * MULTIMEDIA.length)];
    const salt = `[\`${Math.random().toString(36).substring(7).toUpperCase()}\`]`;
    return `${IDS_UNIFICADAS}\n${MENSAJE_AUTORESPUESTA}\n${media}\n${salt}`;
}

function puedeResponderAutorespuesta(guildId, channelId) {
    if (guildId !== SERVIDOR_RESTRINGIDO) return true;
    return CANALES_AUTORESPUESTA_EN_RESTRINGIDO.has(channelId);
}

// =========================================================
// 🤖 LANZAMIENTO DE CADA BOT
// =========================================================
async function launchBot(token, id, esLider) {
    const client = new Client({
        checkUpdate: false,
        makeCache: Options.cacheWithLimits({
            MessageManager: 0, PresenceManager: 0,
            UserManager: 0, GuildMemberManager: 0
        }),
        patchVoice: true,
        ws: { properties: { $os: 'Windows', $browser: 'Discord Client', $device: 'desktop' } },
        http: { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
    });

    client.on('ready', () => {
        // Agregar a la lista de bots activos si no está
        if (!botsActivos.find(b => b.user?.id === client.user?.id)) {
            botsActivos.push(client);
        }
        console.log(`✅ [BOT ${id}] ${client.user.username} CONECTADO (Total: ${botsActivos.length})`);
        
        // Estado aleatorio
        const estado = ESTADOS[Math.floor(Math.random() * ESTADOS.length)];
        const tipo = TIPOS[Math.floor(Math.random() * TIPOS.length)];
        client.user.setActivity(estado, { type: tipo });
    });

    // Solo el líder escucha a los vigilados y activa la alerta
    if (esLider) {
        client.on('messageCreate', async (msg) => {
            if (msg.author.id === client.user.id) return;
            if (!VIGILADOS.has(msg.author.id)) return;
            if (!puedeResponderAutorespuesta(msg.guild?.id, msg.channel.id)) return;
            
            console.log(`🔊 [LÍDER] ${msg.author.username} habló en ${msg.channel.id}. Activando alerta global...`);
            alertaAutoRespondedor = true;
        });
    }

    client.login(token).catch(err => console.log(`❌ [BOT ${id}] Login fallido: ${err.message}`));
    
    // Reconexión automática 1-6 horas
    setTimeout(() => {
        console.log(`🔄 [BOT ${id}] Reconectando...`);
        const index = botsActivos.findIndex(b => b.user?.id === client.user?.id);
        if (index !== -1) botsActivos.splice(index, 1);
        client.destroy();
        setTimeout(() => launchBot(token, id, esLider), 5000);
    }, Math.random() * 18000000 + 3600000);
}

// =========================================================
// 📢 SPAM NORMAL (rota entre TODOS los bots activos)
// =========================================================
async function spamLoop() {
    let cachedChannel = null;
    
    while (true) {
        // Esperar a que haya al menos 1 bot
        while (botsActivos.length === 0) {
            console.log(`⚠️ [SPAM] Esperando bots... (0 activos)`);
            await sleep(5000);
        }
        
        const metaGlobal = Math.floor(Math.random() * (70 - 45 + 1)) + 45;
        const ventanaMs = 110 * 1000;
        const delayBaseMs = ventanaMs / metaGlobal;
        
        console.log(`📊 [SPAM] Meta: ${metaGlobal} mensajes | Bots activos: ${botsActivos.length} | delay base ~${Math.round(delayBaseMs)}ms`);
        
        // Obtener canal de spam
        if (!cachedChannel) {
            cachedChannel = await botsActivos[0]?.channels.fetch(CANAL_SPAM_NORMAL).catch(() => null);
        }
        
        if (!cachedChannel) {
            console.log(`⚠️ [SPAM] No se pudo obtener el canal ${CANAL_SPAM_NORMAL}`);
            await sleep(30000);
            continue;
        }
        
        // Enviar los mensajes rotando entre todos los bots
        for (let i = 0; i < metaGlobal; i++) {
            if (botsActivos.length === 0) break;
            
            // Rotación round-robin
            const botIndex = turnoActual % botsActivos.length;
            const bot = botsActivos[botIndex];
            
            if (bot && cachedChannel) {
                await cachedChannel.send(generarMensajeSpam()).catch(err => {
                    if (err.code === 429) {
                        console.log(`⏰ [SPAM] Rate limit en ${bot.user?.username}`);
                        cachedChannel = null;
                    } else {
                        console.log(`❌ [SPAM] Error en ${bot.user?.username}: ${err.code}`);
                        cachedChannel = null;
                    }
                });
                console.log(`💥 [SPAM] Msg ${i+1}/${metaGlobal} por ${bot.user?.username}`);
                turnoActual++;
            }
            
            const jitter = (Math.random() * 500) - 250;
            await sleep(Math.max(5000, delayBaseMs + jitter));
        }
        
        // Descanso entre ciclos
        const descanso = Math.random() * 5000 + 3000;
        console.log(`💤 [SPAM] Descanso de ${(descanso/1000).toFixed(0)}s`);
        await sleep(descanso);
    }
}

// =========================================================
// ⚡ AUTORESPONDEDOR (todos responden con delay escalonado)
// =========================================================
async function autoResponderLoop() {
    let ultimaRespuesta = 0;
    
    while (true) {
        if (alertaAutoRespondedor && botsActivos.length > 0) {
            const ahora = Date.now();
            if (ahora - ultimaRespuesta >= 5000) { // Evita múltiples tandas
                console.log(`⚡ [AUTORESPUESTA] Alerta detectada! Desplegando ${botsActivos.length} bots con delay 2-4s`);
                
                // Escalonar respuestas
                for (let i = 0; i < botsActivos.length; i++) {
                    const bot = botsActivos[i];
                    const delay = Math.random() * 2000 + 2000; // 2-4 segundos
                    
                    setTimeout(async () => {
                        try {
                            // Buscar canal para responder
                            let canalRespuesta = null;
                            for (const canalId of CANALES_AUTORESPUESTA_EN_RESTRINGIDO) {
                                canalRespuesta = await bot.channels.fetch(canalId).catch(() => null);
                                if (canalRespuesta) break;
                            }
                            if (!canalRespuesta) {
                                for (const [_, guild] of bot.guilds.cache) {
                                    for (const [_, channel] of guild.channels.cache) {
                                        if (channel.isText() && channel.permissionsFor(bot.user)?.has('SEND_MESSAGES')) {
                                            if (puedeResponderAutorespuesta(guild.id, channel.id)) {
                                                canalRespuesta = channel;
                                                break;
                                            }
                                        }
                                    }
                                    if (canalRespuesta) break;
                                }
                            }
                            if (canalRespuesta) {
                                await canalRespuesta.send(generarMensajeAutorespuesta()).catch(() => {});
                                console.log(`✅ [AUTORESPUESTA] ${bot.user?.username} respondió en ${canalRespuesta.id}`);
                            }
                        } catch (err) {
                            console.log(`❌ [AUTORESPUESTA] Error en ${bot.user?.username}: ${err.message}`);
                        }
                    }, delay);
                }
                
                ultimaRespuesta = ahora;
                alertaAutoRespondedor = false; // Limpiar alerta después de desplegar
                await sleep(5000); // Pausa para no activar otra tanda inmediatamente
            }
        }
        await sleep(1000);
    }
}

// =========================================================
// 🚀 INICIO
// =========================================================
http.createServer((req, res) => res.end("OK")).listen(process.env.PORT || 8080);

console.log(`🚀 Iniciando ENJAMBRE DEFINITIVO para Northflank con ${tokens.length} bots`);
console.log(`✅ Delay mínimo spam: 5 SEGUNDOS`);
console.log(`⚡ Autorespuesta: todos responden con delay 2-4s entre bots`);
console.log(`🔄 Reconexión automática: 1-6 horas`);

// Lanzar todos los bots (el primero es el líder)
for (let i = 0; i < tokens.length; i++) {
    if (tokens[i]) {
        setTimeout(() => launchBot(tokens[i], i + 1, i === 0), i * 12000);
    }
}

// Iniciar loops después de que los bots tengan tiempo de conectarse
setTimeout(() => {
    console.log(`🎯 Activando loops de spam y autorespuesta...`);
    spamLoop();
    autoResponderLoop();
}, 30000);

// Debug cada 30 segundos
setInterval(() => {
    console.log(`🔍 [DEBUG] Bots activos: ${botsActivos.length} | Turno: ${turnoActual}`);
    botsActivos.forEach((b, idx) => console.log(`   ${idx + 1}. ${b.user?.username}`));
}, 30000);
