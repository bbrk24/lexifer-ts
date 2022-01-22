#! /usr/bin/env node

const readdirSync = require('fs').readdirSync;

for (const filename of readdirSync('./tests/')) {
    if (filename[0] !== '.') {
        require(`./tests/${filename}`);
    }
}
