'use strict';

import * as fs from 'fs';
import bencode from 'bencode';
import * as crypto from 'crypto';
import * as bignum from 'bignum'


const open = (filepath) => {
  const coded_torrent = fs.readFileSync(filepath);
  console.log(coded_torrent)
  const torrent = bencode.decode(coded_torrent,'utf8');
  console.log(torrent)
  return torrent;
};

const size = torrent => {
  const size = torrent.info.files ?
    torrent.info.files.map(file => file.length).reduce((a, b) => a + b) :
    torrent.info.length;

  return bignum.toBuffer(size, {size: 8});
};

const infoHash = torrent => {
  const info = bencode.encode(torrent.info);
  return crypto.createHash('sha1').update(info).digest();
};

export default {open,size,infoHash};