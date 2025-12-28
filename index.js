const net = require("net");

const server = net.createServer((client) => {
  console.log("Client connected");

  client.on("data", (data) => {
    console.log("Received:", data.length);
    client.write(data); 
  });

  client.on("end", () => console.log("Client disconnected"));
});

server.listen(9000, "0.0.0.0", () => {
  console.log("VPN server running on port 9000");
});
