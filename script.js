const socket = io("https://tia-s-gift-registry.onrender.com"); // Automatically connects to the same host

// Render gift list
function renderGifts(gifts) {
    const giftList = document.getElementById("giftList");
    giftList.innerHTML = "";
    
    gifts.forEach((gift) => {
        const li = document.createElement("li");
        li.classList.add("gift-item");
        li.innerHTML = `
            <a href="${gift.link}" target="_blank" class="gift-name ${gift.purchased ? 'purchased' : ''}">
                ${gift.name}
            </a>
            ${gift.purchased 
                ? `<button onclick="undoPurchase(${gift.id})">Undo</button>` 
                : `<button onclick="purchaseGift(${gift.id})">Buy</button>`}
        `;
        giftList.appendChild(li);
    });
}

// Emit purchase event
function purchaseGift(id) {
    socket.emit("purchaseGift", id);
}

// Emit undo purchase event
function undoPurchase(id) {
    socket.emit("undoPurchase", id);
}

// Listen for updates
socket.on("updateGifts", (gifts) => {
    renderGifts(gifts);
});
