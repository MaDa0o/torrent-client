'use strict'
import * as fs from 'fs';
import bencode from 'bencode';
import * as tracker from "./tracker.js"
import * as torrentParser from "./torrent-parser.js"

const torrent = torrentParser.default.open("puppy.torrent");

// console.log(typeof tracker.default);

const getPeers = tracker.default;

getPeers(torrent, peers => {
  console.log('list of peers: ', peers);
});