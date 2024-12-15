let counter = 0;
const image1 = document.getElementById("image1");
const image2 = document.getElementById("image2");
const counterDisplay = document.getElementById("counter");
const leaderboardList = document.getElementById("leaderboard-list");
const pumpSound = new Audio('/pump-sound.mp3');


function playPumpSound() {
    pumpSound.play();  // Play the sound
}

// Get the user's IP address
async function getUserIP() {
    const response = await fetch('https://your-backend-api-url.com/leaderboard');
    const data = await response.json();
    return data.ip;
}

// Update click count on the server
async function updateClickCount(ip, clicks) {
    await fetch("http://localhost:3000/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ip, clicks }),
    });
}

// Fetch and display the leaderboard
async function fetchLeaderboard() {
    const response = await fetch("http://localhost:3000/leaderboard");
    const leaderboard = await response.json();

    leaderboardList.innerHTML = "";
    leaderboard.forEach(entry => {
        const div = document.createElement("div");
        div.textContent = `${entry.country} (${entry.ip}): ${entry.clicks} pumps`;
        leaderboardList.appendChild(div);
    });
}

// Handle image click
image1.addEventListener("click", async () => {
    image1.style.display = "none";
    image2.style.display = "block";

    setTimeout(() => {
        image2.style.display = "none";
        image1.style.display = "block";
    }, 300);

    counter++;
    counterDisplay.textContent = `PUMPS: ${counter}`;

    playPumpSound();

    const ip = await getUserIP();
    await updateClickCount(ip, counter);
    fetchLeaderboard();
});

// Load leaderboard on page load
window.onload = fetchLeaderboard;
