'use strict'
import * as fs from 'fs';
import bencode from 'bencode';
import * as tracker from "./tracker.js"

const coded_torrent = fs.readFileSync('big-buck-bunny.torrent');
console.log(coded_torrent)
const torrent = bencode.decode(coded_torrent,'utf8');
console.log(torrent)

// console.log(typeof tracker.default);

const getPeers = tracker.default;

getPeers(torrent, peers => {
  console.log('list of peers: ', peers);
});