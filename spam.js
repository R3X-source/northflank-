const { Client, Options } = require('discord.js-selfbot-v13');
const http = require('http');

// =========================================================
// 🛡️ PROTECCIÓN CONTRA CRASHES (El "Parche" Maestro)
// =========================================================
// Esto evita que Northflank reinicie el contenedor si la librería lanza un error
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ [ANT-CRASH] Rechazo no manejado:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('⚠️ [ANT-CRASH] Excepción no capturada:', err);
});

const tokens = [
    process.env.TOKEN_1,
    process.env.TOKEN_2,
    process.env.TOKEN_3,
    process.env.TOKEN_4,
    process.env.TOKEN_5
].filter(t => t && t.length > 10); 

const CANAL_OBJETIVO = "1481514534190448815"; 
const VIGILADOS = new Set(["1431785955559215184", "1457521662303015040", "1485179919523643454", "1003450010702205030", "1480289152397213907", "1467397075204309034", "1457175804290007197", "1429887342373765146", "1425209744603218020", "1492265983165862029", "1493834586755694672"]);

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

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const clientesActivos = [];
let turnoActual = 0;
let cooldownAutoRespondedor = false;

function generarMensaje() {
    const salt = `[\`${Math.random().toString(36).substring(7).toUpperCase()}\`]`;
    return `${COMANDOS[Math.floor(Math.random() * COMANDOS.length)]}\n${IDS_UNIFICADAS}\n${TEXTOS_VARIANTES[Math.floor(Math.random() * TEXTOS_VARIANTES.length)]}\n${MULTIMEDIA[Math.floor(Math.random() * MULTIMEDIA.length)]}\n${salt}`;
}

async function ejecutarDisparo(client) {
    try {
        const canal = client.channels.cache.get(CANAL_OBJETIVO) || await client.channels.fetch(CANAL_OBJETIVO).catch(() => null);
        if (canal) {
            await canal.send(generarMensaje()).catch((err) => {
                if (err.code === 429) console.log(`⏰ [${client.user.username}] Rate limit.`);
            });
            return true;
        }
    } catch (e) {}
    return false;
}

async function comandoCentral() {
    while (true) {
        if (clientesActivos.length === 0) { await sleep(5000); continue; }
        const metaGlobal = Math.floor(Math.random() * 31) + 40; 
        const delayBaseMs = Math.floor((110 * 1000) / metaGlobal);

        for (let i = 0; i < metaGlobal; i++) {
            const tirador = clientesActivos[turnoActual % clientesActivos.length];
            if (tirador) {
                await ejecutarDisparo(tirador);
                turnoActual++;
            }
            await sleep(Math.max(1500, delayBaseMs + (Math.random() * 1000 - 500))); 
        }
        await sleep(5000); 
    }
}

async function launchBot(token, isLider) {
    const client = new Client({
        checkUpdate: false,
        // 🚀 OPTIMIZACIÓN DE MEMORIA EXTREMA (Para 512MB)
        makeCache: Options.cacheWithLimits({
            MessageManager: 0, 
            PresenceManager: 0, 
            UserManager: 0, 
            GuildMemberManager: 0,
            ThreadManager: 0,
            StageInstanceManager: 0
        }),
        patchVoice: true, // Fix adicional para el error de 'null'
        ws: { properties: { $os: 'Windows', $browser: 'Discord Client', $device: 'desktop' } }
    });

    client.on('ready', () => {
        if (!clientesActivos.includes(client)) clientesActivos.push(client);
        console.log(`🚀 [${isLider ? 'LÍDER' : 'SOLDADO'}] ${client.user.username} EN POSICIÓN`);
    });

    client.on('messageCreate', async (msg) => {
        if (isLider && msg.author.id !== client.user.id && VIGILADOS.has(msg.author.id)) {
            if (!cooldownAutoRespondedor && clientesActivos.length > 0) {
                cooldownAutoRespondedor = true;
                const tirador = clientesActivos[Math.floor(Math.random() * clientesActivos.length)];
                if (tirador) await ejecutarDisparo(tirador);
                setTimeout(() => { cooldownAutoRespondedor = false; }, 10000);
            }
        }
    });

    // Reintento de login si falla
    client.login(token).catch(err => console.error(`❌ Error en token: ${token.substring(0,10)}...`));
}

// Servidor para mantener vivo el proceso
http.createServer((req, res) => res.end("OK")).listen(process.env.PORT || 8080);

// Lanzamiento escalonado para no saturar la CPU
tokens.forEach((t, i) => setTimeout(() => launchBot(t, i === 0), i * 15000));
setTimeout(comandoCentral, 30000);
