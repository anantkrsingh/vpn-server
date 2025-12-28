const net = require("net");
const crypto = require("crypto");

const PSK = Buffer.from("12345678901234567890123456789012"); // 32 bytes

function decryptFrame(frame) {
  const nonce = frame.subarray(0, 12);
  const ciphertext = frame.subarray(12);

  const tag = ciphertext.slice(-16);
  const enc = ciphertext.slice(0, -16);

  const decipher = crypto.createDecipheriv("aes-256-gcm", PSK, nonce);
  decipher.setAuthTag(tag);

  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec;
}

const server = net.createServer(socket => {
  console.log("🌍 Client connected:", socket.remoteAddress);

  let pending = Buffer.alloc(0);

  socket.on("data", chunk => {
    pending = Buffer.concat([pending, chunk]);

    while (pending.length >= 4) {
      const len = pending.readUInt32BE(0);
      if (pending.length < 4 + len) break;

      const frame = pending.slice(4, 4 + len);
      pending = pending.slice(4 + len);

      try {
        const decrypted = decryptFrame(frame);
        console.log("🔓 Decrypted:", decrypted.length, "bytes");

        const lenBuf = Buffer.alloc(4);
        lenBuf.writeUInt32BE(decrypted.length);
        
        const framed = Buffer.concat([lenBuf, decrypted]);
        socket.write(framed);
        
        console.log("⬅️ Sent back to client:", decrypted.length, "bytes");
        

      } catch (e) {
        console.error("❌ Decrypt failed:", e.message);
      }
    }
  });

  socket.on("close", () => console.log("🚪 Client disconnected"));
  socket.on("error", err => console.log("🔥 Error:", err.message));
});

server.listen(9000, "0.0.0.0", () => {
  console.log("🚀 Encrypted VPN Server running on port 9000");
});

function sendToClient(socket, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  socket.write(Buffer.concat([len, data]));
}
