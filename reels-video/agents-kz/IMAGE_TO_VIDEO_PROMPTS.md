# «Агенттер» — суреттерді қозғалысқа айналдыру (image-to-video)

Генератор: **Kling**, **Seedance**, **Veo**, **Hailuo** т.б. — режимі **Image to Video**, пропорция **9:16**.
Әр сахнаға өз суретін (`01.jpg` … `31.jpg`) жүктеп, төмендегі қозғалыс промптын қойыңыз.

## Әр промпттың басына қосыңыз

```
Keep the exact 16-bit pixel art style, colors, composition and characters of the image. Static camera (or very slow push-in), smooth looping motion, no new objects, no text, no morphing, faces stay the same.
```

## Сахналар

«Роликте» — бұл сахна монтажда қанша секунд тұрады. «Генерация» — клипті қанша секундтық етіп жасау керек (артығын өзім кесемін).

| № | Роликте | Генерация | Қозғалыс (ортақ бөліктен кейін қосыңыз) |
|---|---|---|---|
| 01 | 2.2 с | 5 с | Medet types slowly, the loading bar on the monitor fills up, the cube agents on the shelf and monitor sway their headphones, city lights twinkle. |
| 02 | 3.5 с | 5 с | Everyone walks forward in a continuous loop, legs stepping, the small cube agents waddle between the feet, neon signs flicker. |
| 03 | 3.8 с | 5 с | Medet types fast and excitedly, eyes wide, sparkles burst from the keyboard, the cube agents bounce happily on the desk. |
| 04 | 0.8 с | 5 с | Medet raises his index finger and wags it slightly, 'wait a moment' gesture, the cube behind the shelf peeks out and hides again. |
| 05 | 4.1 с | 5 с | Medet leans in to look at the glass case, the tiny man inside keeps typing, the cube on top of the case slides its legs, light beam flickers softly. |
| 06 | 3.2 с | 5 с | Dozens of cube agents pour out of the glowing monitor and fly around Medet's head in circles, he shakes his head holding it with both hands. |
| 07 | 0.9 с | 5 с | The cube agent runs across the desk carrying the envelope with tiny fast steps, Medet's eyes follow it in surprise. |
| 08 | 1.5 с | 5 с | The old phone rings and shakes, the cube agent with a headset picks up the receiver and nods while talking, Medet glances at it. |
| 09 | 4.1 с | 5 с | The cube agent with a bow tie taps the weather map with its pointer, the storm cloud on the map rains and flashes lightning. |
| 10 | 2.7 с | 5 с | The two cube agents box in the tiny ring, jumping and punching, a lightning spark between them, Medet watches amused. |
| 11 | 5.0 с | 5 с | The tiny cube agent types very fast on its tiny computer, the wall clock hands spin quickly, Medet keeps typing. |
| 12 | 4.0 с | 5 с | Medet walks down the corridor, the cube detective in a hat sneaks behind him and scribbles in its notepad. |
| 13 | 6.5 с | 10 с | The cube agent points at the graph with its stick, the red line wiggles and dips to the toilet icon, Medet strokes his chin thoughtfully. |
| 14 | 3.3 с | 5 с | All cube agents at the table nod together, the small cubes on their heads bounce up and down, Medet gestures explaining. |
| 15 | 3.7 с | 5 с | Medet shrugs with both hands open, shakes his head 'I don't know', the cubes on the desk look at each other. |
| 16 | 3.9 с | 5 с | The cube detective sweeps its magnifying glass left and right, the light beam moves over Medet's legs, Medet smiles. |
| 17 | 1.9 с | 5 с | Inside the magnifying glass the four cube agents sleep and swing in the hammock, 'zzz' bubbles rise, Medet frowns. |
| 18 | 1.4 с | 5 с | Medet shouts angrily, his whole body shakes, coffee splashes from the mug, the cube agents get blown back. |
| 19 | 5.5 с | 10 с | The big cube agent with sunglasses lounges on the sofa and slowly lowers its sunglasses, the small cubes wiggle, Medet turns to look. |
| 20 | 7.4 с | 10 с | The empty office chair spins slowly, steam rises from the mug, the cube agents walk around the empty office. |
| 21 | 2.8 с | 5 с | Medet sighs sadly with his cheek on his hand, slowly blinks, the cube agents on the papers and shelf sway gently. |
| 22 | 1.9 с | 5 с | The police cube agent raises its hand 'stop' and shakes its head, Medet turns and walks away down the corridor. |
| 23 | 3.4 с | 5 с | The cube agent shouts into the megaphone, the queue of cube agents shuffles forward one step, Medet watches from his chair. |
| 24 | 2.3 с | 5 с | The two cube agents on the big chair swing their tiny legs and look at each other, Medet looks at them confused. |
| 25 | 3.9 с | 5 с | Medet types on the keyboard, letters appear in the email window, the cube agents on the desk turn to watch him suspiciously. |
| 26 | 1.3 с | 5 с | Slow push-in toward the empty title frame, Medet looks at the camera, the cube agents around him blink and sway. |
| 27 | 2.3 с | 5 с | Medet raises both hands 'I'm not touching anything', backs away slightly, the cube agents walk over his papers and keyboard. |
| 28 | 3.1 с | 5 с | The cube agent jumps onto the keyboard and blocks Medet's hands, crossing its arms, Medet tries to type and stops. |
| 29 | 3.7 с | 5 с | Medet and the cube agent stare at each other in silence, Medet blinks slowly, the cube tilts its head. |
| 30 | 3.3 с | 5 с | The cube agent with the paper face mask talks to the camera, waving its tiny arm, the mask wobbles, the ring light glows, the camera's red REC dot blinks. |
| 31 | 4.2 с | 5 с | Medet swings gently in the hammock sipping his cocktail, palm leaves sway in the breeze, waves roll, the two cube agents sunbathe. |

## Кеңестер

- Клиптерді суреттің нөмірімен сақтаңыз: `01.mp4` … `31.mp4`.
- Барлығын бірден жасау қымбат болса, ең маңыздыларынан бастаңыз: **06, 10, 17, 18, 28, 30, 31**. Қалғандары қазіргідей сурет болып қала береді, онда мен «тірі» камера қозғалысын қосамын.
- Клиптің дыбысы болса, оны мен өшіремін, диктордың дауысы ғана қалады.
