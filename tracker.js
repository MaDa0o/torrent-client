'use strict';

import * as dgram from 'node:dgram'
import * as Buff from 'buffer'
import * as URL from 'url'
import * as crypto from 'crypto'
import * as util from './util.js'

const genId = util.default;
const urlParse = URL.parse;
const Buffer = Buff.Buffer;

const getPeers = (torrent, callback) => {
  console.log("creating socket");
  const socket = dgram.createSocket('udp4');
  console.log("socket created");

  console.log(torrent);
  const url = torrent.announce.toString('utf8');

  // 1. send connect request
  console.log("sending udp request")
  const message = buildConnReq();
  udpSend(socket, message, url);
  console.log("step 1");
  socket.on('message', response => {
    if (respType(response) === 'connect') {
      // 2. receive and parse connect response
      console.log("connect response received")
      const connResp = parseConnResp(response);
      console.log("step 2");

      // 3. send announce request
      const announceReq = buildAnnounceReq(connResp.connectionId,torrent);
      udpSend(socket, announceReq, url);
      console.log("step 3");

    } else if (respType(response) === 'announce') {
      // 4. parse announce response
      const announceResp = parseAnnounceResp(response);
      console.log("step 4");

      // 5. pass peers to callback
      callback(announceResp.peers);
      console.log("step 5");

    }
    else{
      console.log("no response")
    }
  });
};

function udpSend(socket, message, rawUrl, callback=()=>{}) {
  const url = urlParse(rawUrl);
  console.log(rawUrl)
  console.log(url);
  socket.send(message, 0, message.length, url.port, url.host, callback);
}

function respType(resp) {
  // ..
}

function buildConnReq() {
  console.log("building connection request")
  const buf = Buffer.alloc(16); // 2

  // connection id
  buf.writeUInt32BE(0x417, 0); // 3
  buf.writeUInt32BE(0x27101980, 4);
  // action
  buf.writeUInt32BE(0, 8); // 4
  // transaction id
  crypto.randomBytes(4).copy(buf, 12); // 5

  // console.log(buf);

  return buf;
}

function parseConnResp(resp) {
  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    connectionId: resp.slice(8)
  }
}

function buildAnnounceReq(connId, torrent, port=6881) {
  const buf = Buffer.allocUnsafe(98);

  // connection id
  connId.copy(buf, 0);
  // action
  buf.writeUInt32BE(1, 8);
  // transaction id
  crypto.randomBytes(4).copy(buf, 12);
  // info hash
  torrentParser.infoHash(torrent).copy(buf, 16);
  // peerId
  genId().copy(buf, 36);
  // downloaded
  Buffer.alloc(8).copy(buf, 56);
  // left
  torrentParser.size(torrent).copy(buf, 64);
  // uploaded
  Buffer.alloc(8).copy(buf, 72);
  // event
  buf.writeUInt32BE(0, 80);
  // ip address
  buf.writeUInt32BE(0, 80);
  // key
  crypto.randomBytes(4).copy(buf, 88);
  // num want
  buf.writeInt32BE(-1, 92);
  // port
  buf.writeUInt16BE(port, 96);

  return buf;
}

function parseAnnounceResp(resp) {
  function group(iterable, groupSize) {
    let groups = [];
    for (let i = 0; i < iterable.length; i += groupSize) {
      groups.push(iterable.slice(i, i + groupSize));
    }
    return groups;
  }

  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    leechers: resp.readUInt32BE(8),
    seeders: resp.readUInt32BE(12),
    peers: group(resp.slice(20), 6).map(address => {
      return {
        ip: address.slice(0, 4).join('.'),
        port: address.readUInt16BE(4)
      }
    })
  }
}

export default getPeers