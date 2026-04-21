const { Client, Options } = require('discord.js-selfbot-v13');
const http = require('http');

// =========================================================
// 🔒 ARSENAL SEGURO: TOKENS DESDE VARIABLES DE ENTORNO
// =========================================================
const tokens = [
    process.env.TOKEN_1, // 4y4nh_0kjmshqn7 (Líder NF)
    process.env.TOKEN_2, // nknl4_mjyamdk
    process.env.TOKEN_3, // cejotinamimami
    process.env.TOKEN_4, // 4ls4kjou
    process.env.TOKEN_5  // esleierleitoreietor
].filter(t => t); 

// =========================================================
// 🎯 OBJETIVO ÚNICO Y VIGILADOS
// =========================================================
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
    "https://files.catbox.moe/nlvkg4.mp4", "https://cdn.discordapp.com/attachments/1369181247896817685/1483287824055799870/descarga_6.mp4", "https://files.catbox.moe/d0wcx2.mp4"
];
const ESTADOS = ["Free Fire", "Spotify", "YouTube", "Call of Duty", "TikTok"];
const TIPOS = ['PLAYING', 'LISTENING', 'WATCHING'];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// =========================================================
// 🧠 ESTADO GLOBAL DEL ENJAMBRE Y FILA INDIA
// =========================================================
const clientesActivos = [];
let turnoActual = 0;
let cooldownAutoRespondedor = false;

function generarMensaje() {
    const salt = `[\`${Math.random().toString(36).substring(7).toUpperCase()}\`]`;
    return `${COMANDOS[Math.floor(Math.random() * COMANDOS.length)]}\n${IDS_UNIFICADAS}\n${TEXTOS_VARIANTES[Math.floor(Math.random() * TEXTOS_VARIANTES.length)]}\n${MULTIMEDIA[Math.floor(Math.random() * MULTIMEDIA.length)]}\n${salt}`;
}

function obtenerSiguienteTirador() {
    if (clientesActivos.length === 0) return null;
    const tirador = clientesActivos[turnoActual % clientesActivos.length];
    turnoActual++;
    return tirador;
}

async function ejecutarDisparo(client, esAutoRespuesta = false) {
    try {
        const canal = await client.channels.fetch(CANAL_OBJETIVO).catch(() => null);
        if (canal) {
            await canal.send(generarMensaje()).catch((err) => {
                if (err.code === 429) console.log(`⏰ [${client.user.username}] Rate limit detectado.`);
            });
            return true;
        }
    } catch (e) {}
    return false;
}

// =========================================================
// 🌍 COMANDO CENTRAL: RITMO ESTRICTO Y PAUSADO
// =========================================================
async function comandoCentral() {
    const VENTANA_SEGUNDOS = 110;
    
    while (true) {
        if (clientesActivos.length === 0) {
            await sleep(5000);
            continue;
        }

        const metaGlobal = Math.floor(Math.random() * (70 - 40 + 1)) + 40; 
        const delayBaseMs = Math.floor((VENTANA_SEGUNDOS * 1000) / metaGlobal);

        console.log(`\n🌍 [COMANDO CENTRAL] Objetivo Único: ${CANAL_OBJETIVO}`);
        console.log(`⏱️  Meta del Enjambre (NF): ${metaGlobal} mensajes en ${VENTANA_SEGUNDOS}s`);

        for (let i = 0; i < metaGlobal; i++) {
            const tirador = obtenerSiguienteTirador();
            
            if (tirador) {
                const exito = await ejecutarDisparo(tirador);
                if(exito) console.log(`💥 [${tirador.user.username}] Disparo certero (${i+1}/${metaGlobal})`);
            }

            const pausaAleatoria = Math.floor(Math.random() * 1000) - 500;
            const esperaFinal = delayBaseMs + pausaAleatoria;

            await sleep(Math.max(1500, esperaFinal)); 
        }
        
        await sleep(5000); 
    }
}

// =========================================================
// 🤖 INICIALIZACIÓN DE TROPAS (CONEXIÓN PC Y RECONEXIÓN 1-6H)
// =========================================================
async function launchBot(token, isLider) {
    const client = new Client({
        checkUpdate: false,
        makeCache: Options.cacheWithLimits({ MessageManager: 0, PresenceManager: 0, UserManager: 0, GuildMemberManager: 0 }),
        // 💻 CAMUFLAJE DE PC ACTIVADO
        ws: { properties: { $os: 'Windows', $browser: 'Discord Client', $device: 'desktop' } },
        http: { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
    });

    client.on('shardDisconnect', async () => { 
        const idx = clientesActivos.indexOf(client);
        if (idx > -1) clientesActivos.splice(idx, 1);
        await sleep(10000); 
        client.login(token).catch(() => {}); 
    });
    
    client.on('ready', async () => {
        if (!clientesActivos.includes(client)) clientesActivos.push(client);
        console.log(`🚀 [${isLider ? 'LÍDER' : 'SOLDADO'}] ${client.user.username} EN POSICIÓN (PC Spoof)`);
        client.user.setActivity(ESTADOS[Math.floor(Math.random() * ESTADOS.length)], { type: TIPOS[Math.floor(Math.random() * TIPOS.length)] });

        // 🔄 SISTEMA DE RECONEXIÓN (1 a 6 Horas)
        const tiempoReconexion = Math.floor(Math.random() * (21600000 - 3600000 + 1)) + 3600000;
        console.log(`⏳ [${client.user.username}] Programando reinicio de sesión en ${(tiempoReconexion / 3600000).toFixed(1)} horas.`);
        
        setTimeout(() => {
            console.log(`🔄 [${client.user.username}] Apagando "PC" temporalmente (Evasión Anti-Spam)...`);
            const idx = clientesActivos.indexOf(client);
            if (idx > -1) clientesActivos.splice(idx, 1);
            client.destroy();
            
            // Espera 15 segundos y vuelve a loguear
            setTimeout(() => { 
                console.log(`🔌 [${client.user.username}] Encendiendo "PC" de nuevo...`);
                launchBot(token, isLider); 
            }, 15000);
        }, tiempoReconexion);
    });

    if (isLider) {
        client.on('messageCreate', async (msg) => {
            if (msg.author.id !== client.user.id && VIGILADOS.has(msg.author.id)) {
                if (!cooldownAutoRespondedor && clientesActivos.length > 0) {
                    cooldownAutoRespondedor = true;
                    console.log(`🔊 [LÍDER] ¡Vigilado detectado! Disparo de respuesta...`);
                    
                    const tiradorDeRespuesta = obtenerSiguienteTirador();
                    if (tiradorDeRespuesta) {
                        await ejecutarDisparo(tiradorDeRespuesta, true);
                    }
                    
                    setTimeout(() => { cooldownAutoRespondedor = false; }, 10000);
                }
            }
        });
    }
    client.login(token).catch(() => {});
}

http.createServer((req, res) => res.end("NORTHFLANK-OK")).listen(process.env.PORT || 8080);
console.log(`🚀 Iniciando sistema NORTHFLANK (SEGURO): Cerrojo Estricto, Spoof PC y Reconexión 1-6h.`);

if (tokens.length > 0 && tokens[0]) setTimeout(() => launchBot(tokens[0], true), 5000);
for (let i = 1; i < tokens.length; i++) {
    if (tokens[i]) setTimeout(() => launchBot(tokens[i], false), i * 12000);
}

setTimeout(comandoCentral, 15000);
