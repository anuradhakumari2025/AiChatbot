require("dotenv").config();
const app = require("./src/app");
const { Server } = require("socket.io");
const { createServer } = require("http");
const generateText = require("./src/service/ai.service");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});
let chatHistory = [];
io.on("connection", (socket) => {
  // ...
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
  socket.on("message", (msg) => {
    console.log("Message received: " + msg);
  });
  socket.on("ai-message", async (data) => {
    chatHistory.push({ role: "user", parts: [{ text: String(data) }] });

    const response = await generateText(chatHistory);

    chatHistory.push({ role: "model", parts: [{ text: response }] });

    socket.emit("ai-message-response", response);
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});
