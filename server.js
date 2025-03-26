const express = require("express");
const http = require("http");
const fs = require("fs");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (or specify your frontend URL)
        methods: ["GET", "POST"]
    }
});

const GIFT_FILE = "gifts.json";

app.use(cors());
app.use(express.static("public"));  

// Default route for testing
app.get("/", (req, res) => {
    res.send("Tia's Gift Registry Backend is Running!");
});

// Load gifts from JSON
function loadGifts() {
    try {
        return JSON.parse(fs.readFileSync(GIFT_FILE, "utf8"));
    } catch (err) {
        console.error("Error loading gifts:", err);
        return [];
    }
}

// Save gifts to JSON
function saveGifts(gifts) {
    fs.writeFileSync(GIFT_FILE, JSON.stringify(gifts, null, 2), "utf8");
}

io.on("connection", (socket) => {
    console.log("A user connected");

    // Send initial gift list
    socket.emit("updateGifts", loadGifts());

    // Handle purchase
    socket.on("purchaseGift", (giftId) => {
        let gifts = loadGifts();
        let gift = gifts.find((g) => g.id === giftId);

        if (gift && !gift.purchased) {
            gift.purchased = true;
            saveGifts(gifts);
            io.emit("updateGifts", gifts);
        }
    });

    // Handle undo purchase
    socket.on("undoPurchase", (giftId) => {
        let gifts = loadGifts();
        let gift = gifts.find((g) => g.id === giftId);

        if (gift && gift.purchased) {
            gift.purchased = false;
            saveGifts(gifts);
            io.emit("updateGifts", gifts);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// **Use Render's PORT (important!)**
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
