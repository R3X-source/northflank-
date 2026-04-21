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
// 🔥 TOKENS (desde variables de entorno)
// =========================================================
const tokens = [
    process.env.TOKEN_1,
    process.env.TOKEN_2,
    process.env.TOKEN_3,
    process.env.TOKEN_4,
    process.env.TOKEN_5,
    process.env.TOKEN_6,
    process.env.TOKEN_7,
    process.env.TOKEN_8
].filter(t => t && t.length > 10);

// =========================================================
// 🎯 CONFIGURACIÓN
// =========================================================

// Canal para spam NORMAL (solo este)
const CANAL_SPAM_NORMAL = "1481514534190448815";

// Servidor con restricción para autorespondedor
const SERVIDOR_RESTRINGIDO = "1239701315580592148";

// Canales DONDE SÍ FUNCIONA el autorespondedor en ese servidor
const CANALES_AUTORESPUESTA_EN_RESTRINGIDO = new Set([
    "1270239207071420450",
    "1266542890767876229",
    "1240012616328544419",
    "1239719951435304960"
]);

// Usuarios vigilados (autorespondedor)
const VIGILADOS = new Set([
    "1431785955559215184", "1457521662303015040", "1485179919523643454",
    "1003450010702205030", "1480289152397213907", "1467397075204309034",
    "1457175804290007197", "1429887342373765146", "1425209744603218020",
    "1492265983165862029", "1493834586755694672"
]);

// IDS_UNIFICADAS (las menciones)
const IDS_UNIFICADAS = "<@1490277865818689700> <@1494684335352316065> <@1442335922111910024> <@1346593401088249977> <@1429887342373765146> <@1493426752536711230> <@1493834586755694672> <@1425209744603218020> <@1492265983165862029> <@1427713721479987232> <@984956970014486528> <@1072352198836621385> <@1429177016703516764> <@1438314463970328578> <@1446586105553227807> <@957014429822750771> <@1423439348430405722> <@1455444386421674007> <@1394021604127936772> <@1452533908699611236> <@1459077041637953651> <@1468117706099396816> <@1467397075204309034> <@1466878653932634195> <@1458314974794616902> <@1470913175401533543> <@1464354934785839155> <@1394023020896714762> <@1399500980889976902> <@1462897561894649876> <@1386330375952793723> <@1353778890514108456> <@1480289152397213907> <@1457175804290007197> <@1490277865818689700> <@1492675664682287277> <@1487148931535212817> <@1457521662303015040>";

// Mensaje fijo para autorespondedor
const MENSAJE_AUTORESPUESTA = "MAMITA QUERIDA QUE PUTITA Q ERES, NO SE QUIEN SERÁ TU CULITO PERO SI TU CULITO RECIBE ESTO ES PORQUE BÁSICAMENTE ME LA PELAS Y DESCONOZCO QUIEN SERÁS FEMINA PERO SIEMPRE VAS A ENTENDER Q A MI ME LA PELAS COMO CJOTIÑA JAKSJJAJSA Y POR ESO TE DEJO MIS BOLAS DRENADAS Y ENSALOBADAS POR LA MICHOACANA DE CJOTORRA CHE";

// Textos para spam normal (pueden variar)
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
let ultimoVigilado = null;

// Renovar alerta cada 2 segundos
setInterval(() => {
    alertaAutoRespondedor = false;
    ultimoVigilado = null;
}, 2000);

// =========================================================
// 📝 FUNCIONES
// =========================================================

// Mensaje para spam normal (con multimedia y texto variable)
function generarMensajeSpam() {
    const texto = TEXTOS_SPAM[Math.floor(Math.random() * TEXTOS_SPAM.length)];
    const media = MULTIMEDIA[Math.floor(Math.random() * MULTIMEDIA.length)];
    const salt = `[\`${Math.random().toString(36).substring(7).toUpperCase()}\`]`;
    return `${IDS_UNIFICADAS}\n${texto}\n${media}\n${salt}`;
}

// Mensaje para autorespondedor (FIJO + menciones)
function generarMensajeAutorespuesta() {
    const salt = `[\`${Math.random().toString(36).substring(7).toUpperCase()}\`]`;
    return `${IDS_UNIFICADAS}\n${MENSAJE_AUTORESPUESTA}\n${salt}`;
}

// Verificar si el canal permite autorespuesta (regla del servidor restringido)
function puedeResponderAutorespuesta(guildId, channelId) {
    // Si no es el servidor restringido, se puede en cualquier canal
    if (guildId !== SERVIDOR_RESTRINGIDO) {
        return true;
    }
    // Si es el servidor restringido, solo en los 4 canales permitidos
    return CANALES_AUTORESPUESTA_EN_RESTRINGIDO.has(channelId);
}

// =========================================================
// 🤖 LÍDER (El único que escucha)
// =========================================================
async function launchLider(token) {
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

    client.on('ready', async () => {
        botsActivos.push(client);
        console.log(`🎖️ [LÍDER] ${client.user.username} EN POSICIÓN (vigilando a ${VIGILADOS.size} usuarios)`);
        
        const estado = ESTADOS[Math.floor(Math.random() * ESTADOS.length)];
        const tipo = TIPOS[Math.floor(Math.random() * TIPOS.length)];
        client.user.setActivity(estado, { type: tipo });
    });

    // El LÍDER escucha a los vigilados
    client.on('messageCreate', async (msg) => {
        if (msg.author.id === client.user.id) return;
        if (!VIGILADOS.has(msg.author.id)) return;
        
        // Verificar si el canal permite autorespuesta
        if (!puedeResponderAutorespuesta(msg.guild?.id, msg.channel.id)) return;
        
        console.log(`🔊 [LÍDER] ¡${msg.author.username} habló en ${msg.channel.id}! Activando alerta...`);
        alertaAutoRespondedor = true;
        ultimoVigilado = msg.author.id;
    });

    client.login(token).catch(err => console.log(`❌ [LÍDER] Login fallido: ${err.message}`));
    
    // Reconexión cada 1-6 horas
    const reconTime = Math.random() * 18000000 + 3600000;
    setTimeout(() => {
        console.log(`🔄 [LÍDER] Reconectando...`);
        client.destroy();
        setTimeout(() => launchLider(token), 5000);
    }, reconTime);
}

// =========================================================
// 🪖 SOLDADO (Ciego, solo copia órdenes)
// =========================================================
async function launchSoldado(token, id) {
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

    client.on('ready', async () => {
        botsActivos.push(client);
        console.log(`🪖 [SOLDADO ${id}] ${client.user.username} EN POSICIÓN`);
        
        const estado = ESTADOS[Math.floor(Math.random() * ESTADOS.length)];
        const tipo = TIPOS[Math.floor(Math.random() * TIPOS.length)];
        client.user.setActivity(estado, { type: tipo });
    });

    client.login(token).catch(err => console.log(`❌ [SOLDADO ${id}] Login fallido: ${err.message}`));
    
    // Reconexión cada 1-6 horas
    const reconTime = Math.random() * 18000000 + 3600000;
    setTimeout(() => {
        console.log(`🔄 [SOLDADO ${id}] Reconectando...`);
        client.destroy();
        setTimeout(() => launchSoldado(token, id), 5000);
    }, reconTime);
}

// =========================================================
// 📢 SPAM NORMAL (45-70 mensajes cada 110 segundos entre todos)
// =========================================================
async function spamNormalLoop() {
    let cachedChannel = null;
    
    while (true) {
        if (botsActivos.length === 0) {
            await sleep(5000);
            continue;
        }
        
        // Meta: 45-70 mensajes entre TODOS los bots
        const metaGlobal = Math.floor(Math.random() * (70 - 45 + 1)) + 45;
        const ventanaMs = 110 * 1000; // 110 segundos
        const delayBaseMs = ventanaMs / metaGlobal;
        
        console.log(`📊 [SPAM] ${metaGlobal} mensajes en ${ventanaMs/1000}s | ${botsActivos.length} bots | delay ~${Math.round(delayBaseMs)}ms`);
        
        // Obtener canal de spam normal
        if (!cachedChannel) {
            cachedChannel = await botsActivos[0]?.channels.fetch(CANAL_SPAM_NORMAL).catch(() => null);
        }
        
        if (!cachedChannel) {
            console.log(`⚠️ [SPAM] No se pudo obtener el canal ${CANAL_SPAM_NORMAL}`);
            await sleep(30000);
            continue;
        }
        
        // Distribuir mensajes entre bots (turnos rotativos)
        for (let i = 0; i < metaGlobal; i++) {
            const bot = botsActivos[turnoActual % botsActivos.length];
            if (bot && cachedChannel) {
                await cachedChannel.send(generarMensajeSpam()).catch(err => {
                    if (err.code === 429) {
                        console.log(`⏰ [SPAM] Rate limit, esperando...`);
                    } else {
                        cachedChannel = null;
                    }
                });
                turnoActual++;
                if (turnoActual > 1000000) turnoActual = 0;
            }
            
            // Delay con jitter
            const jitter = (Math.random() * 500) - 250;
            await sleep(Math.max(1000, delayBaseMs + jitter));
        }
        
        // Descanso entre ventanas
        const descanso = Math.random() * 5000 + 3000; // 3-8 segundos
        console.log(`💤 [SPAM] Descanso de ${(descanso/1000).toFixed(0)}s`);
        await sleep(descanso);
    }
}

// =========================================================
// ⚡ AUTORESPONDEDOR (Todos los bots responden a la alerta del líder)
// =========================================================
async function autoResponderLoop() {
    let ultimaRespuesta = 0;
    
    while (true) {
        if (alertaAutoRespondedor && botsActivos.length > 0) {
            const ahora = Date.now();
            if (ahora - ultimaRespuesta >= 2000) { // Mínimo 2 seg entre respuestas
                console.log(`⚡ [AUTORESPUESTA] Alerta activa! Respondiendo...`);
                
                // Todos los bots responden (pero en el mismo canal donde se activó)
                // Para simplificar, tomamos el primer bot activo y respondemos
                const bot = botsActivos[0];
                if (bot) {
                    // Buscar un canal válido para responder
                    let canalRespuesta = null;
                    
                    // Intentar en el canal restringido primero
                    for (const canalId of CANALES_AUTORESPUESTA_EN_RESTRINGIDO) {
                        canalRespuesta = await bot.channels.fetch(canalId).catch(() => null);
                        if (canalRespuesta) break;
                    }
                    
                    // Si no, buscar cualquier canal donde pueda escribir
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
                        await canalRespuesta.send(generarMensajeAutorespuesta()).catch(err => {
                            console.log(`❌ [AUTORESPUESTA] Error: ${err.code}`);
                        });
                        console.log(`✅ [AUTORESPUESTA] Respuesta enviada a ${canalRespuesta.id}`);
                        ultimaRespuesta = ahora;
                    } else {
                        console.log(`⚠️ [AUTORESPUESTA] No se encontró canal para responder`);
                    }
                }
                await sleep(1000);
            }
        }
        await sleep(1500);
    }
}

// =========================================================
// 🚀 INICIO
// =========================================================
http.createServer((req, res) => res.end("OK")).listen(process.env.PORT || 8080);

console.log(`🚀 Iniciando enjambre Northflank con ${tokens.length} bots`);
console.log(`📡 Spam normal → canal ${CANAL_SPAM_NORMAL}`);
console.log(`📡 Autorespondedor → líder escucha, todos responden`);
console.log(`📡 Servidor restringido: ${SERVIDOR_RESTRINGIDO} → solo ${CANALES_AUTORESPUESTA_EN_RESTRINGIDO.size} canales`);

// Lanzar líder (token 1)
if (tokens[0]) {
    setTimeout(() => launchLider(tokens[0]), 5000);
}

// Lanzar soldados (tokens 2 al 8)
for (let i = 1; i < tokens.length; i++) {
    if (tokens[i]) {
        setTimeout(() => launchSoldado(tokens[i], i), i * 12000);
    }
}

// Iniciar loops después de que los bots tengan chance de conectarse
setTimeout(() => {
    console.log("🎯 Activando loops de spam y autorespuesta...");
    spamNormalLoop();
    autoResponderLoop();
}, 60000);
