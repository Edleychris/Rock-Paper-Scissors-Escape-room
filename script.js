// BONUS ASSIGNMENT: Escape the Evil AI
// Work in progress - basic JavaScript practice

function startGame() {
    let currentRoom = "entrance";
    let hasKey = false;
    let playing = true;

    alert("You are trapped inside the Evil AI's digital fortress!");
    alert("Open the browser console with F12, then select Console to see game messages.");

    console.log("Welcome to Escape the Evil AI!");

    while (playing) {
        let choice;

        if (currentRoom === "entrance") {
            choice = prompt("ENTRANCE ROOM\nType 'lab' to enter the laboratory or 'exit' to try the exit.");

            if (choice === null) {
                playing = false;
            } else {
                choice = choice.trim().toLowerCase();

                if (choice === "lab") {
                    currentRoom = "laboratory";
                } else if (choice === "exit") {
                    currentRoom = "exit";
                } else {
                    alert("Invalid choice. Try again.");
                }
            }
        } else if (currentRoom === "laboratory") {
            choice = prompt("LABORATORY\nYou see a key on a table. Type 'take' to collect it or 'back' to return.");

            if (choice === null) {
                playing = false;
            } else {
                choice = choice.trim().toLowerCase();

                if (choice === "take") {
                    hasKey = true;
                    alert("You picked up the key!");
                    console.log("Inventory: key collected");
                } else if (choice === "back") {
                    currentRoom = "entrance";
                } else {
                    alert("Invalid choice. Try again.");
                }
            }
        } else if (currentRoom === "exit") {
            if (hasKey) {
                alert("The key fits, but the security system is still active!");
                console.log("TODO: Add the security challenge and successful escape ending.");
            } else {
                alert("The exit is locked. You need to find a key!");
            }

            currentRoom = "entrance";
        }
    }

    console.log("Game stopped.");
    // TODO: Add confirm() to ask if the player wants to play again.
}

startGame();

// TODO: Add an unsuccessful ending based on the player's decisions.
// TODO: Add a final security challenge.
// TODO: Reset progress when restarting the game.
// TODO: Test every possible path.
