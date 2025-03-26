const express = require("express");
const http = require("http");
const fs = require("fs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const GIFT_FILE = "gifts.json";

app.use(express.static("public"));  


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

app.get("/socket.io/socket.io.js", (req, res) => {
    res.sendFile(require.resolve("socket.io/client-dist/socket.io.js"));
});


const PORT = process.env.PORT || 3000; // Use environment port on Render
server.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});

