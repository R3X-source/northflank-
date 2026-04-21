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

// ✅ VALIDACIÓN SILENCIOSA DE TOKENS
if (tokens.length === 0) {
    console.error('❌ No hay tokens válidos. El script se detendrá pero no crasheará.');
    // No salimos con process.exit, solo esperamos
    setInterval(() => {}, 1000000); // Mantener vivo sin hacer nada
}

// =========================================================
// 🎯 CONFIGURACIÓN CON VALIDACIONES
// =========================================================
const SERVIDOR_RESTRINGIDO = process.env.SERVIDOR_RESTRINGIDO || "1239701315580592148";
const CANALES_PERMITIDOS = new Set(
    (process.env.CANALES_PERMITIDOS || "1270239207071420450,1266542890767876229,1240012616328544419,1239719951435304960").split(',')
);

// ✅ Si no hay canales permitidos, el spam no funcionará pero no crasheará
if (CANALES_PERMITIDOS.size === 0 || (CANALES_PERMITIDOS.size === 1 && [...CANALES_PERMITIDOS][0] === '')) {
    console.warn('⚠️ No hay canales permitidos configurados. El spam no se ejecutará.');
}

const VIGILADOS = new Set(
    (process.env.VIGILADOS || "1431785955559215184,1457521662303015040,1485179919523643454,1003450010702205030,1480289152397213907,1467397075204309034,1457175804290007197,1429887342373765146,1425209744603218020,1492265983165862029,1493834586755694672").split(',')
);

// ✅ Si no hay vigilados, el autorespondedor se desactiva automáticamente
if (VIGILADOS.size === 0 || (VIGILADOS.size === 1 && [...VIGILADOS][0] === '')) {
    console.warn('⚠️ No hay usuarios vigilados. El autorespondedor no se activará.');
}

const COMANDOS = [".t cejuda17", ".t cjurra", ".t penaldo"];
const IDS_UNIFICADAS = "<@1490277865818689700> <@1494684335352316065> <@1442335922111910024> <@1346593401088249977> <@1429887342373765146> <@1493426752536711230> <@1493834586755694672> <@1425209744603218020> <@1492265983165862029> <@1427713721479987232> <@984956970014486528> <@1072352198836621385> <@1429177016703516764> <@1438314463970328578> <@1446586105553227807> <@957014429822750771> <@1423439348430405722> <@1455444386421674007> <@1394021604127936772> <@1452533908699611236> <@1459077041637953651> <@1468117706099396816> <@1467397075204309034> <@1466878653932634195> <@1458314974794616902> <@1470913175401533543> <@1464354934785839155> <@1394023020896714762> <@1399500980889976902> <@1462897561894649876> <@1386330375952793723> <@1353778890514108456> <@1480289152397213907> <@1457175804290007197> <@1490277865818689700> <@1492675664682287277> <@1487148931535212817> <@1457521662303015040>";

const TEXTOS_VARIANTES = [
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
// 🧠 COMUNICACIÓN ENTRE BOTS
// =========================================================
let alertaAutoRespondedor = false;
let ultimoVigilado = null;

setInterval(() => {
    alertaAutoRespondedor = false;
    ultimoVigilado = null;
}, 2000);

function generarMensaje() {
    const comando = COMANDOS[Math.floor(Math.random() * COMANDOS.length)];
    const textoAzar = TEXTOS_VARIANTES[Math.floor(Math.random() * TEXTOS_VARIANTES.length)];
    const media = MULTIMEDIA[Math.floor(Math.random() * MULTIMEDIA.length)];
    const salt = `[\`${Math.random().toString(36).substring(7).toUpperCase()}\`]`;
    return `${comando}\n${IDS_UNIFICADAS}\n${textoAzar}\n${media}\n${salt}`;
}

function esCanalPermitido(guildId, channelId) {
    if (guildId === SERVIDOR_RESTRINGIDO) {
        return CANALES_PERMITIDOS.has(channelId);
    }
    return true;
}

// =========================================================
// 🤖 LÍDER (Vigila y activa alerta)
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
        console.log(`🎖️ [LÍDER] ${client.user.username} EN POSICIÓN`);
        const estado = ESTADOS[Math.floor(Math.random() * ESTADOS.length)];
        const tipo = TIPOS[Math.floor(Math.random() * TIPOS.length)];
        client.user.setActivity(estado, { type: tipo });
        
        spamLoop(client, "LÍDER");
        
        // ✅ RECONEXIÓN AUTOMÁTICA (1-6 horas)
        programarReconexion(client, "LÍDER", token);
    });

    client.on('messageCreate', async (msg) => {
        if (msg.author.id === client.user.id) return;
        if (!VIGILADOS.has(msg.author.id)) return;
        if (VIGILADOS.size === 0) return; // Si no hay vigilados, ignorar
        
        console.log(`🔊 [LÍDER] ¡${msg.author.username} habló! Activando alerta...`);
        alertaAutoRespondedor = true;
        ultimoVigilado = msg.author.id;
    });

    client.login(token).catch(err => console.log(`❌ [LÍDER] Login fallido: ${err.message}`));
}

// =========================================================
// 🪖 SOLDADO
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
        console.log(`🪖 [SOLDADO ${id}] ${client.user.username} LISTO`);
        const estado = ESTADOS[Math.floor(Math.random() * ESTADOS.length)];
        const tipo = TIPOS[Math.floor(Math.random() * TIPOS.length)];
        client.user.setActivity(estado, { type: tipo });
        
        spamLoop(client, `SOLDADO ${id}`);
        autoResponderLoop(client, `SOLDADO ${id}`);
        
        // ✅ RECONEXIÓN AUTOMÁTICA (1-6 horas)
        programarReconexion(client, `SOLDADO ${id}`, token);
    });

    client.login(token).catch(err => console.log(`❌ [SOLDADO ${id}] Login fallido: ${err.message}`));
}

// =========================================================
// 🔄 RECONEXIÓN AUTOMÁTICA (1-6 horas)
// =========================================================
function programarReconexion(client, nombre, token) {
    const tiempoReconexion = Math.floor(Math.random() * (21600000 - 3600000 + 1)) + 3600000; // 1-6 horas en ms
    console.log(`⏰ [${nombre}] Reconexión programada en ${(tiempoReconexion / 3600000).toFixed(1)} horas`);
    
    setTimeout(async () => {
        console.log(`🔄 [${nombre}] Ejecutando reconexión programada...`);
        try {
            await client.destroy();
            console.log(`✅ [${nombre}] Sesión destruida. Recreando en 5 segundos...`);
            await sleep(5000);
            
            if (nombre === "LÍDER") {
                launchLider(token);
            } else {
                const id = parseInt(nombre.split(' ')[1]) || 0;
                launchSoldado(token, id);
            }
        } catch (err) {
            console.error(`❌ [${nombre}] Error en reconexión: ${err.message}`);
            // Reintentar en 10 minutos si falla
            setTimeout(() => {
                if (nombre === "LÍDER") launchLider(token);
                else launchSoldado(token, 0);
            }, 600000);
        }
    }, tiempoReconexion);
}

// =========================================================
// 📢 SPAM LOOP
// =========================================================
async function spamLoop(client, nombre) {
    let cachedChannel = null;
    
    while (true) {
        try {
            // Si no hay canales permitidos, salir silenciosamente
            if (CANALES_PERMITIDOS.size === 0) {
                await sleep(60000);
                continue;
            }
            
            if (!cachedChannel) {
                for (const canalId of CANALES_PERMITIDOS) {
                    cachedChannel = await client.channels.fetch(canalId).catch(() => null);
                    if (cachedChannel && esCanalPermitido(cachedChannel.guild?.id, cachedChannel.id)) break;
                }
            }
            
            if (!cachedChannel) {
                await sleep(30000);
                continue;
            }
            
            const mensajesACrear = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < mensajesACrear; i++) {
                await cachedChannel.send(generarMensaje()).catch(async (err) => {
                    if (err.code === 429) {
                        const wait = err.retry_after * 1000;
                        console.log(`⏰ [${nombre}] Rate limit, esperando ${wait/1000}s`);
                        await sleep(wait);
                    } else {
                        cachedChannel = null;
                    }
                });
                console.log(`💥 [${nombre}] Spam enviado (${i+1}/${mensajesACrear})`);
                await sleep(Math.random() * 5000 + 5000);
            }
            
            const descanso = Math.random() * 30000 + 30000;
            console.log(`💤 [${nombre}] Descanso de ${(descanso/1000).toFixed(0)}s`);
            await sleep(descanso);
            
        } catch (err) {
            console.log(`⚠️ [${nombre}] Error: ${err.message}`);
            await sleep(30000);
        }
    }
}

// =========================================================
// ⚡ AUTORESPONDEDOR LOOP
// =========================================================
async function autoResponderLoop(client, nombre) {
    let ultimaRespuesta = 0;
    let cachedCanal = null;
    
    // Si no hay vigilados, este loop no hace nada
    if (VIGILADOS.size === 0) {
        return;
    }
    
    while (true) {
        if (alertaAutoRespondedor) {
            const ahora = Date.now();
            if (ahora - ultimaRespuesta >= 3000) {
                console.log(`⚡ [${nombre}] Alerta! Enviando autorespuesta...`);
                
                if (!cachedCanal) {
                    for (const canalId of CANALES_PERMITIDOS) {
                        cachedCanal = await client.channels.fetch(canalId).catch(() => null);
                        if (cachedCanal) break;
                    }
                }
                
                if (cachedCanal) {
                    await cachedCanal.send(generarMensaje()).catch(async (err) => {
                        if (err.code === 429) {
                            const wait = err.retry_after * 1000;
                            await sleep(wait);
                        } else {
                            cachedCanal = null;
                        }
                    });
                    console.log(`✅ [${nombre}] Autorespuesta enviada`);
                    ultimaRespuesta = ahora;
                }
                
                await sleep(1000);
            }
        }
        await sleep(2000);
    }
}

// =========================================================
// 🚀 INICIO
// =========================================================
http.createServer((req, res) => res.end("OK")).listen(process.env.PORT || 8080);

console.log(`🚀 Iniciando enjambre para Northflank con ${tokens.length} bots`);
if (tokens.length > 0) {
    console.log(`📡 Líder: Token 1 | Soldados: ${tokens.length - 1} bots`);
} else {
    console.log(`❌ No hay tokens válidos. El script está en espera.`);
}

// Lanzamiento escalonado (12 seg entre bots)
tokens.forEach((token, i) => {
    setTimeout(() => {
        if (i === 0) {
            launchLider(token);
        } else {
            launchSoldado(token, i);
        }
    }, i * 12000);
});
