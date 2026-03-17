const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const express = require('express');
const app = express();
const path = require('path');

const client = new Client({ 
    intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds] 
});

const dbPath = './veriler.json';

// Veri okuma/yazma
const veriOku = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const veriKaydet = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

client.on('messageCreate', async (msg) => {
    if (msg.author.bot || !msg.content.startsWith('!')) return;
    const args = msg.content.slice(1).split(' ');
    const komut = args[0].toLowerCase();
    let data = veriOku();

    if (komut === 'macsonuc') {
        const ev = args[1], dep = args[2], skor = args[3];
        if (!ev || !dep || !skor) return msg.reply("Kullanım: !macsonuc Roma Como 2-1");
        const [s1, s2] = skor.split('-').map(Number);
        
        if (!data.takimlar[ev]) data.takimlar[ev] = { mac: 0, g: 0, b: 0, m: 0, ag: 0, yg: 0, puan: 0 };
        if (!data.takimlar[dep]) data.takimlar[dep] = { mac: 0, g: 0, b: 0, m: 0, ag: 0, yg: 0, puan: 0 };

        data.takimlar[ev].mac++; data.takimlar[dep].mac++;
        data.takimlar[ev].ag += s1; data.takimlar[ev].yg += s2;
        data.takimlar[dep].ag += s2; data.takimlar[dep].yg += s1;

        if (s1 > s2) { data.takimlar[ev].puan += 3; data.takimlar[ev].g++; data.takimlar[dep].m++; }
        else if (s1 === s2) { data.takimlar[ev].puan++; data.takimlar[dep].puan++; data.takimlar[ev].b++; data.takimlar[dep].b++; }
        else { data.takimlar[dep].puan += 3; data.takimlar[dep].g++; data.takimlar[ev].m++; }

        data.maclar.push({ ev, dep, skor, tarih: new Date().toLocaleString('tr-TR') });
        veriKaydet(data);
        msg.reply(`✅ Maç kaydedildi!`);
    }

    if (komut === 'golekle' || komut === 'asistekle') {
        const [isim, sayi, takim] = [args[1], parseInt(args[2]), args[3]];
        if (!isim || isNaN(sayi) || !takim) return msg.reply("Kullanım: !golekle Lukaku 10 Napoli");
        const hedef = komut === 'golekle' ? 'goller' : 'asistler';
        data[hedef].push({ isim, sayi, takim });
        veriKaydet(data);
        msg.reply(`✅ Veri listeye eklendi!`);
    }
});

app.use(express.static('public'));
app.get('/api/veriler', (req, res) => res.json(veriOku()));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Sistem Aktif!"));

client.login(process.env.DISCORD_TOKEN);

