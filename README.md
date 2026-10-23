# Rock-Paper-Scissors-Escape-room
Built using JavaScript only, without any styling or design.

I built the game as two files, `index.html` and `game.js`. I haven't run it in a browser, so play through every ending once before submitting. Keep both files in the same folder and open `index.html`.

**How it meets the brief**
- **Setup:** `index.html` is static text plus one button, and `game.js` does everything else with `prompt()`, `alert()`, `confirm()` and `console.log`. There is no DOM manipulation. The button uses an inline `onclick` in the markup.
- **Console instructions:** The page explains how to open the console on Windows, Linux and Mac before play starts. The opening alert repeats the tip, and the game is fully playable without the console, which only carries the map and a running log.
- **Rooms:** There are four locations (Server Hall, Storage Closet, Control Room, Exit Door), and you can move back and forth between them freely.
- **Memory:** The game tracks the keycard, the EMP grenade, whether you've read the password note, and whether the firewall is down. Rewards can only be collected once, so revisiting a room never duplicates them or resets anything.
- **Input handling:** `ask()` trims whitespace, ignores capitals, and accepts either a number or a keyword. Invalid or empty answers re-prompt and cost no move, and Cancel safely ends the game.
- **Replay:** `confirm()` offers another game at the end, and `newState()` resets everything.

**Paths through the story**

| Ending | How you get it |
|---|---|
| Perfect escape (win) | Get the keycard from the closet and the password from the note, enter it at the terminal, then swipe the card at the exit. |
| Noisy escape (win) | Get the keycard and the EMP grenade from the crate, then throw the grenade at the exit. |
| Fried (lose) | Swipe the card with the lasers still on, then agree to run through. |
| Lockdown (lose) | Enter three wrong passwords. |
| Overload (lose) | Pull the red lever and confirm. |
| Out of time (lose) | Use all 18 moves. Free actions like checking status and invalid input don't count. |

The password is `MANGO` (constant at the top of `game.js`), and `MAX_MOVES` is there too if you want to tune the difficulty.

Before handing it in, ask someone who hasn't seen the code to play without your help, as the assignment suggests, and test every ending once.
