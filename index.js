'use strict'
import * as fs from 'fs';
import bencode from 'bencode';
import * as tracker from "./tracker.js"

const torrent = bencode.decode(fs.readFileSync('puppy.torrent'));

console.log(typeof tracker.default);

const getPeers = tracker.default;

getPeers(torrent, peers => {
  console.log('list of peers: ', peers);
});