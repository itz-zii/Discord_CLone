import { io } from "socket.io-client";
const socket = io("http://localhost:4000");
socket.on("connect", () => {
    console.log("Connected:", socket.id);
    socket.emit("join-channel", "a71e3d90-73b8-4d5c-961e-4864921332ec");
});
socket.on("message:new", (message) => {
    console.log("New message:", message);
});
//# sourceMappingURL=test-socket.js.map