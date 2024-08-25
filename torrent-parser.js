'use strict';

import * as fs from 'fs';
import bencode from 'bencode';

const open = (filepath) => {
  const coded_torrent = fs.readFileSync('puppy.torrent');
console.log(coded_torrent)
const torrent = bencode.decode(coded_torrent,'utf8');
console.log(torrent)
  return torrent;
};

const size = torrent => {
  // ...
};

const infoHash = torrent => {
  // ...
};

export default {open,size,infoHash};