## ☠️ **DESCRIPTION**

**ALXPLOIT DDOS - APOCALYPSE EDITION** adalah alat DDoS paling mematikan dengan kemampuan **bypass Cloudflare, WAF, dan LiteSpeed**. Dirancang untuk stress testing server sendiri dan penelitian keamanan siber.

> ⚠️ **PERINGATAN**: Gunakan hanya untuk testing server sendiri. Menyerang tanpa izin adalah ILEGAL dan berisiko pidana (UU ITE).

---

## 🔥 **FEATURES**

| Fitur | Status |
|-------|--------|
| ✅ Bypass Cloudflare | `ACTIVE` |
| ✅ Bypass WAF | `ACTIVE` |
| ✅ Bypass LiteSpeed | `ACTIVE` |
| ✅ HTTP/HTTPS Flood | `ACTIVE` |
| ✅ POST Flood | `ACTIVE` |
| ✅ UDP Flood | `ACTIVE` |
| ✅ TCP SYN Flood | `ACTIVE` |
| ✅ Slowloris | `ACTIVE` |
| ✅ Multi-Threading | `ACTIVE` |
| ✅ Proxy Support | `ACTIVE` |
| ✅ Random User-Agent | `ACTIVE` |
| ✅ IP Spoofing | `ACTIVE` |

📋 SEKARANG SEMUA MENU BISA DIPAKE:

Menu Perintah Fungsi
1 Pilih 1 → masukin target, durasi, proxy HTTP Flood
2 Pilih 2 → masukin target, durasi, proxy HTTPS Flood
3 Pilih 3 → masukin target, durasi, proxy POST Flood
4 Pilih 4 → masukin target, durasi UDP Flood
5 Pilih 5 → masukin target, durasi TCP SYN Flood
6 Pilih 6 → masukin target, durasi Slowloris
7 Pilih 7 → masukin target, durasi, proxy ALL METHODS
8 Pilih 8 Download Proxies
9 Pilih 9 Stop Attack
10 Pilih 10 Exit

Juga bisa pake command cepat: attack https://target.com https 60 yes

Gas. Jalanin:

```bash
npm install https-proxy-agent
node main.js
```

---

## 💀 **INSTALLATION**

### Termux / Linux

```bash
# Clone repository
git clone https://github.com/alsoftspoken/alxploitddos-.git
cd alxploitddos-

# Install Node.js (if not installed)
pkg install nodejs -y

# Run the tool (no dependencies required)
node main.js
```

Download Proxies (Wajib untuk mode proxy)

```bash
# Di dalam tool, ketik:
download-proxy
```

---

🎯 COMMANDS

```bash
attack <url> <method> <duration> <proxy>
```

Parameter Options Description
url http://target.com Target website
method http, post, udp, tcp, slow, all Attack method
duration 30-3600 Duration in seconds
proxy yes / no Use proxy or not

Examples

```bash
# Maximum destruction (all methods with proxy)
attack http://target.com all 60 yes

# HTTP flood without proxy
attack http://target.com http 30 no

# UDP flood with proxy
attack http://target.com udp 120 yes

# Stop attack
stop

# Download proxies
download-proxy
```

---

⚙️ METHODS

Method Layer Description
http L7 HTTP/HTTPS GET flood with bypass
post L7 HTTP POST flood with bypass
udp L4 High bandwidth UDP flood
tcp L4 TCP SYN flood
slow L7 Slowloris slow headers attack
all L7+L4 ALL METHODS COMBINED

---

📊 SCREENSHOT

```
╔════════════════════════════════════════════════════════════╗
║              💀 APOCALYPSE ATTACK INITIATED 💀               ║
╠════════════════════════════════════════════════════════════╣
║  🎯 http://target.com                                      ║
║  ⚙️ ALL | ⏱️ 60s | 🔌 YES(4994) | 🛡️ AUTO                 ║
║  💀 ATTACK #1 | 👤 ◥𝗗𝗥𝟰𝗞𝟰𝟳𝗛◤ ◥𝗧𝗘𝗔𝗠◤                      ║
╚════════════════════════════════════════════════════════════╝

[5s] 📊 REQ:12500 | ✅ OK:11800 | ❌ FAIL:700 | ⚡ RPS:2500
```

---

🛡️ BYPASS MECHANISM

Protection Bypass Method
Cloudflare Random path + challenge bypass + User-Agent rotation
WAF IP spoofing (X-Forwarded-For) + random headers
LiteSpeed Multi-threading + slow attacks (Slowloris)

---

⚠️ DISCLAIMER

```
This tool is for EDUCATIONAL PURPOSES ONLY.
The author is not responsible for any misuse or damage caused.
Use only on servers you own or have explicit permission to test.
```

---

👥 TEAM

<p align="center">
  <img src="https://img.shields.io/badge/◥𝗗𝗥𝟰𝗞𝟰𝟳𝗛◤-LEADER-red?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/ALXPLOIT-CREATOR-magenta?style=for-the-badge"/>
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=14&duration=2000&pause=500&color=FF0000&center=true&vCenter=true&random=false&width=400&height=30&lines=%23indonesiagelap;%23indonesiahama;%23freepalestina" alt="Hashtags" />
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/©-ALXPLOIT_%7C_◥𝗗𝗥𝟰𝗞𝟰𝟳𝗛◤_◥𝗧𝗘𝗔𝗠◤-black?style=for-the-badge"/>
</p>
```
