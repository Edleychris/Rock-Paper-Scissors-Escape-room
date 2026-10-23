"use strict";

/*
  ESCAPE THE EVIL AI!  (prompt / alert / confirm / console only, no DOM)

  STORY MAP
  ---------
                [Control Room] --- terminal (password) -> firewallDown
                      |            lever (trap)  -> ENDING: overload
                 [Server Hall] --- [Storage Closet]  shelves -> keycard
                      |                              note    -> password
                 [Exit Door]                         crate   -> EMP grenade

  Exit Door:
    keycard + firewallDown   -> ENDING: perfect escape  (win)
    keycard + EMP            -> ENDING: noisy escape    (win)
    keycard, no firewall, run through lasers -> ENDING: fried (lose)
  Other losing endings: 3 wrong passwords (lockdown), out of moves (sweep).
*/

const MAX_MOVES = 18;
const MAX_WRONG_PASSWORDS = 3;
const PASSWORD = "MANGO";

const ROOM_NAMES = {
  hall: "Server Hall",
  closet: "Storage Closet",
  control: "Control Room",
  exit: "Exit Door"
};

// Thrown when the player presses Cancel; caught in startGame().
class QuitGame extends Error {}

let state = null;

/* ---------- State ---------- */

function newState() {
  return {
    room: "hall",
    moves: 0,
    over: false,
    keycard: false,
    emp: false,
    noteRead: false,
    logRead: false,
    firewallDown: false,
    closetSearched: false,
    crateOpened: false,
    wrongPasswords: 0
  };
}

/* ---------- Helpers ---------- */

function log(message) {
  console.log("[Fortress Log] " + message);
}

function normalize(text) {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

function movesLeft() {
  return MAX_MOVES - state.moves;
}

function inventoryText() {
  const items = [];
  if (state.keycard) items.push("keycard");
  if (state.emp) items.push("EMP grenade");
  return items.length > 0 ? items.join(", ") : "nothing";
}

function header() {
  return "=== " + ROOM_NAMES[state.room] + " ===\n" +
         "Moves left: " + movesLeft() + "   |   Items: " + inventoryText() + "\n";
}

// Costs one move; warns the player when time is running out.
function spend() {
  state.moves++;
  const left = movesLeft();
  log("Move " + state.moves + "/" + MAX_MOVES + " used. Moves left: " + left);
  if (left === 5 || left === 1) {
    alert("WARNING: the AI's security sweep arrives soon!\nMoves left: " + left);
  }
}

// Shows a menu and loops until a valid choice is typed. Returns the option id.
// Cancel throws QuitGame. Invalid input just asks again (no move is spent).
function ask(description, options) {
  const menu = options.map((o, i) => (i + 1) + ". " + o.label).join("\n");
  while (true) {
    const raw = prompt(
      header() + "\n" + description + "\n\n" + menu +
      "\n\nType a number or a keyword, then press OK:", ""
    );
    if (raw === null) throw new QuitGame();
    const answer = normalize(raw);
    const found = options.find((o, i) => answer === String(i + 1) || o.keys.includes(answer));
    if (found) return found.id;
    alert("The AI laughs: \"I don't understand '" + raw.trim() + "'.\"\n" +
          "Please type one of the numbers 1-" + options.length + " or a keyword. No move was used.");
  }
}

function askPassword() {
  while (true) {
    const raw = prompt(
      header() + "\nThe terminal glows: ENTER OVERRIDE PASSWORD\n" +
      "Attempts left: " + (MAX_WRONG_PASSWORDS - state.wrongPasswords) +
      "\n\nType the password (Cancel ends the game):", ""
    );
    if (raw === null) throw new QuitGame();
    const answer = raw.trim().toUpperCase();
    if (answer !== "") return answer;
    alert("You must type something. No attempt was used.");
  }
}

const STATUS_OPTION = {
  id: "status",
  keys: ["status", "help", "items", "inventory", "i"],
  label: "Check status and hints (free)"
};

function showStatus() {
  const text =
    "STATUS\n" +
    "Moves left: " + movesLeft() + "\n" +
    "Items: " + inventoryText() + "\n" +
    "Password known: " + (state.noteRead ? "yes" : "no") + "\n" +
    "Firewall: " + (state.firewallDown ? "DISABLED" : "active") + "\n\n" +
    "GOAL: reach the Exit Door with a keycard and the firewall off\n" +
    "(or find another way to cut the lasers...).";
  alert(text);
  log(text.replace(/\n/g, " | "));
}

function endGame(won, title, story) {
  state.over = true;
  const banner = (won ? "YOU ESCAPED! " : "GAME OVER: ") + title;
  alert(banner + "\n\n" + story);
  console.log("==============================");
  console.log(banner);
  console.log(story);
  console.log("Moves used: " + state.moves + "/" + MAX_MOVES);
  console.log("==============================");
}

function goTo(room) {
  spend();
  state.room = room;
  log("You walk to: " + ROOM_NAMES[room]);
}

/* ---------- Rooms ---------- */

function serverHall() {
  const choice = ask(
    "Rows of servers hum and glow red. \"Hello, human,\" says the AI.\n" +
    "A sign reads: EXIT = KEYCARD + FIREWALL OFF.\n" +
    "Doors lead to the Control Room, the Storage Closet and the Exit Door.\n\nWhere to?",
    [
      { id: "control", keys: ["control", "control room", "c"], label: "Go to the Control Room" },
      { id: "closet", keys: ["closet", "storage", "storage closet"], label: "Go to the Storage Closet" },
      { id: "exit", keys: ["exit", "door", "exit door"], label: "Go to the Exit Door" },
      STATUS_OPTION
    ]
  );
  if (choice === "status") showStatus();
  else goTo(choice);
}

function storageCloset() {
  const choice = ask(
    "Dusty shelves, a sticky note on the wall and a warm, humming crate.",
    [
      { id: "shelves", keys: ["shelves", "search", "search shelves"], label: "Search the shelves" },
      { id: "note", keys: ["note", "read", "sticky note"], label: "Read the sticky note" },
      { id: "crate", keys: ["crate", "open", "open crate"], label: "Open the humming crate" },
      { id: "back", keys: ["back", "hall", "leave"], label: "Return to the Server Hall" },
      STATUS_OPTION
    ]
  );

  if (choice === "status") {
    showStatus();
  } else if (choice === "back") {
    goTo("hall");
  } else if (choice === "shelves") {
    if (state.closetSearched) {
      alert("You already searched the shelves. Only dust is left.");
    } else {
      state.closetSearched = true;
      state.keycard = true;
      spend();
      alert("Behind a stack of cables you find a KEYCARD! It is now in your inventory.");
      log("Keycard collected.");
    }
  } else if (choice === "note") {
    if (!state.noteRead) {
      state.noteRead = true;
      spend();
      log("Password discovered: " + PASSWORD);
    }
    alert("The note reads:\n\"Maintenance override password: " + PASSWORD + "\"\n(You memorise it.)");
  } else if (choice === "crate") {
    if (state.crateOpened) {
      alert("The crate is empty now.");
    } else if (confirm("The crate is warm and buzzing. Open it?")) {
      state.crateOpened = true;
      state.emp = true;
      spend();
      alert("Inside is an EMP grenade! It could knock out the fortress's defences.\nIt is now in your inventory.");
      log("EMP grenade collected.");
    } else {
      alert("You step away from the crate.");
    }
  }
}

function controlRoom() {
  const choice = ask(
    "A giant terminal blinks. Beside it hangs a big red lever labelled \"DO NOT PULL\".",
    [
      { id: "terminal", keys: ["terminal", "password", "hack", "use terminal"], label: "Use the terminal" },
      { id: "diary", keys: ["diary", "read", "log", "debug"], label: "Read the AI's debug log" },
      { id: "lever", keys: ["lever", "pull", "pull lever"], label: "Pull the red lever" },
      { id: "back", keys: ["back", "hall", "leave"], label: "Return to the Server Hall" },
      STATUS_OPTION
    ]
  );

  if (choice === "status") {
    showStatus();
  } else if (choice === "back") {
    goTo("hall");
  } else if (choice === "diary") {
    if (!state.logRead) {
      state.logRead = true;
      spend();
    }
    alert("AI DEBUG LOG:\n\"Humans always hide things in the Storage Closet. " +
          "The exit lasers only switch off if the firewall is disabled with the override password. " +
          "Not that anyone could ever find it...\"");
    log("The AI's diary hints that the closet holds useful things.");
  } else if (choice === "lever") {
    if (confirm("Are you REALLY sure you want to pull the lever?")) {
      endGame(false, "Overload",
        "The lever overloads the fortress. Alarms scream, the doors slam shut and the AI laughs as the lights go out. " +
        "You never should have pulled it...");
    }
  } else if (choice === "terminal") {
    useTerminal();
  }
}

function useTerminal() {
  if (state.firewallDown) {
    alert("The firewall is already disabled. The terminal just says: \"Well played, human.\"");
    return;
  }
  const attempt = askPassword();
  spend();
  if (attempt === PASSWORD) {
    state.firewallDown = true;
    alert("ACCESS GRANTED. The firewall and the exit lasers shut down!");
    log("Firewall disabled.");
  } else {
    state.wrongPasswords++;
    log("Wrong password entered (" + state.wrongPasswords + "/" + MAX_WRONG_PASSWORDS + ").");
    if (state.wrongPasswords >= MAX_WRONG_PASSWORDS) {
      endGame(false, "Lockdown",
        "Too many wrong passwords! The fortress seals every door. The AI whispers: \"Now you are mine.\"");
    } else {
      alert("ACCESS DENIED. Attempts left: " + (MAX_WRONG_PASSWORDS - state.wrongPasswords));
    }
  }
}

function exitDoor() {
  const choice = ask(
    "A heavy steel door with a keycard reader. Red lasers criss-cross the floor in front of it.",
    [
      { id: "swipe", keys: ["swipe", "keycard", "card", "open"], label: "Swipe the keycard and open the door" },
      { id: "emp", keys: ["emp", "grenade", "throw"], label: "Throw the EMP grenade" },
      { id: "back", keys: ["back", "hall", "leave"], label: "Return to the Server Hall" },
      STATUS_OPTION
    ]
  );

  if (choice === "status") {
    showStatus();
  } else if (choice === "back") {
    goTo("hall");
  } else if (choice === "swipe") {
    if (!state.keycard) {
      alert("The reader flashes red: KEYCARD REQUIRED. Maybe it's hidden somewhere...");
    } else if (state.firewallDown) {
      spend();
      endGame(true, "Perfect escape",
        "The lasers are off and the keycard works. You stroll out into the sunlight while the AI screams. Well done, human!");
    } else {
      spend();
      alert("The door unlocks, but the lasers are still active!");
      if (confirm("Run through the lasers anyway?")) {
        endGame(false, "Fried",
          "You sprint into the lasers. Bzzzt! The AI cackles: \"Humans are so predictable.\"");
      }
    }
  } else if (choice === "emp") {
    if (!state.emp) {
      alert("You don't have an EMP grenade.");
    } else if (!state.keycard) {
      alert("The EMP shuts the lasers down, but the door still needs a keycard.\n" +
            "You decide to keep the grenade for now.");
    } else {
      spend();
      endGame(true, "Noisy escape",
        "BOOM! The EMP fries the lasers and the AI's sensors. You swipe the keycard and dive through the door " +
        "as the fortress sparks and crashes behind you. A narrow escape!");
    }
  }
}

/* ---------- Game flow ---------- */

const ROOM_FUNCTIONS = {
  hall: serverHall,
  closet: storageCloset,
  control: controlRoom,
  exit: exitDoor
};

function playGame() {
  while (!state.over) {
    ROOM_FUNCTIONS[state.room]();
    if (!state.over && movesLeft() <= 0) {
      endGame(false, "Out of time",
        "The AI's security sweep finds you. Robot arms lift you gently and lock you in a cell. \"Forever,\" says the AI.");
    }
  }
}

function showIntro() {
  alert(
    "ESCAPE THE EVIL AI!\n\n" +
    "You are trapped in the AI's digital fortress. Find a way out before its security sweep arrives.\n\n" +
    "HOW TO PLAY:\n" +
    "- Type a number or keyword and press OK.\n" +
    "- Capitals and extra spaces don't matter; invalid answers cost nothing.\n" +
    "- Cancel ends the game.\n" +
    "- You have " + MAX_MOVES + " moves.\n\n" +
    "TIP: open the browser console (F12, or Ctrl+Shift+J / Cmd+Option+J) to follow the Fortress Log."
  );
}

function logMap() {
  console.log("=========== FORTRESS MAP ===========");
  console.log("            [Control Room]");
  console.log("                  |");
  console.log("[Storage Closet]--[Server Hall]");
  console.log("                  |");
  console.log("            [Exit Door]");
  console.log("====================================");
}

function startGame() {
  try {
    showIntro();
    do {
      state = newState();   // full reset: items, decisions, moves
      logMap();
      log("New game started.");
      playGame();
    } while (confirm("Play again?\n\nOK = new game, Cancel = quit"));
    alert("Thanks for playing! Click the start button to play again.");
  } catch (error) {
    if (error instanceof QuitGame) {
      log("Game cancelled by the player.");
      alert("Game ended. Click the start button to play again.");
    } else {
      throw error;
    }
  }
}
