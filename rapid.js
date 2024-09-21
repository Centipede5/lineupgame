const fs = require('fs');

const filePath = 'westfield-RELAYS.L1/westfield-RELAYS.L1';
const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
const filteredLines = lines.filter(line => line.startsWith('time,'));

fs.writeFileSync(filePath, filteredLines.join('\n'));
