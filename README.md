# Smart Lume

Build a fully functional, interactive hackathon prototype called:



"SMARTLUME – Speed-Adaptive Smart Street Lighting"



PROJECT IDEA:

Create an intelligent street-lighting system that detects an approaching vehicle, considers its speed, and automatically illuminates an appropriate section of the road ahead. The objective is to improve night-time visibility and save electricity by avoiding unnecessary illumination of the entire road.



IMPORTANT:

This is a DIGITAL SIMULATION of the concept. Do not claim that the browser is actually detecting vehicles 1 km away. Clearly label the detection as "SIMULATED LONG-RANGE DETECTION".



==================================================

1. MAIN SIMULATION

==================================================



Create a realistic-looking dark night-time road representing a 1 km road.



Divide the road into ten 100-metre lighting zones:



Zone 1 → 0–100 m

Zone 2 → 100–200 m

Zone 3 → 200–300 m

Zone 4 → 300–400 m

Zone 5 → 400–500 m

Zone 6 → 500–600 m

Zone 7 → 600–700 m

Zone 8 → 700–800 m

Zone 9 → 800–900 m

Zone 10 → 900–1000 m



Place street lights along both sides of the road.



Create a vehicle that moves smoothly along the road.



The user must be able to control the vehicle speed and position.



==================================================

2. SPEED-BASED LIGHTING LOGIC

==================================================



Implement the following rules:



LOW SPEED:

0–40 km/h

→ Illuminate approximately 200 m ahead of the vehicle.



MEDIUM SPEED:

41–80 km/h

→ Illuminate approximately 400 m ahead.



HIGH SPEED:

81–120 km/h

→ Illuminate AT LEAST 500 m ahead.



The lighting zone must dynamically move with the vehicle.



Example:



Vehicle position = 300 m

Speed = 100 km/h



Then illuminate:



300 m → 400 m → 500 m → 600 m → 700 m → 800 m



This represents at least 500 m of illuminated road ahead.



If the vehicle moves forward, the illuminated zone should move forward with it.



Lights behind the vehicle should gradually dim and turn OFF.



==================================================

3. VEHICLE SPEED CONTROL

==================================================



Create a large interactive speed slider:



0 km/h ─────────────── 120 km/h



Display the current speed prominently.



Use these visual states:



0–40 km/h:

"LOW-SPEED MODE"



41–80 km/h:

"NORMAL-SPEED MODE"



81–120 km/h:

"HIGH-SPEED SAFETY MODE"



When speed exceeds 80 km/h, automatically activate HIGH-SPEED SAFETY MODE.



==================================================

4. DETECTION SIMULATION

==================================================



Create a simulated detection system.



Add:



"SIMULATED LONG-RANGE SENSOR"



Allow the user to toggle:



Vehicle Detected

Vehicle Not Detected



When no vehicle is detected:

→ Turn road lights OFF or keep them at very low standby brightness.



When a vehicle is detected:

→ Activate the appropriate lighting range according to speed.



Display:



Detection Status:

✓ VEHICLE DETECTED



or



○ NO VEHICLE DETECTED



Also display:



Detection Range:

"Simulated: up to 1 km"



==================================================

5. DAY/NIGHT CONTROL

==================================================



Add a Day/Night toggle.



DAY:

→ Street lights OFF

→ System displays "DAYLIGHT MODE"



NIGHT:

→ Enable adaptive lighting

→ System responds to vehicle detection and speed.



Default state should be NIGHT.



==================================================

6. VEHICLE POSITION

==================================================



Add a vehicle-position slider:



0 m ─────────────── 1000 m



Display:



Vehicle Position: XXX m



As the position changes, the vehicle should visibly move along the road.



The illuminated lighting zones must move together with the vehicle.



==================================================

7. QUICK DEMO BUTTONS

==================================================



Create four large buttons:



[LOW SPEED DEMO]



Set:

Speed = 30 km/h

Lighting = 200 m



[MEDIUM SPEED DEMO]



Set:

Speed = 60 km/h

Lighting = 400 m



[HIGH SPEED DEMO]



Set:

Speed = 100 km/h

Lighting = at least 500 m

Activate HIGH-SPEED SAFETY MODE



[FULL AUTOMATIC DEMO]



Automatically run the complete demonstration:



Stage 1:

No vehicle detected

All lights OFF.



Stage 2:

Vehicle enters the road.

Vehicle detected.



Stage 3:

Vehicle travels at 30 km/h.

200 m ahead illuminates.



Stage 4:

Vehicle accelerates to 60 km/h.

400 m ahead illuminates.



Stage 5:

Vehicle accelerates to 100 km/h.

At least 500 m ahead illuminates.



Stage 6:

Vehicle passes.

Lights behind the vehicle gradually turn OFF.



Stage 7:

Return to standby mode.



Make the automatic demonstration smooth and visually impressive.



==================================================

8. ENERGY SAVING CALCULATION

==================================================



Assume:



Each street light = 100 W



There are 10 lighting zones.



Conventional system:

All 10 zones remain ON.



Conventional power:

1000 W



Adaptive system:

Power = number of active zones × 100 W



Calculate and display:



Current Power Consumption

Conventional Power Consumption

Estimated Power Saved

Estimated Energy Saving Percentage



Example:



Conventional:

1000 W



Adaptive:

400 W



Energy Saved:

600 W



Energy Saving:

60%



Update these values dynamically whenever the active lighting zones change.



==================================================

9. DASHBOARD

==================================================



Create a professional dashboard beside or below the road.



Display:



VEHICLE SPEED

XX km/h



VEHICLE POSITION

XXX m



DETECTION STATUS

DETECTED / NOT DETECTED



ILLUMINATION RANGE

XXX m



ACTIVE LIGHT ZONES

X / 10



CURRENT POWER

XXX W



CONVENTIONAL POWER

1000 W



ENERGY SAVED

XX %



SYSTEM MODE

DAYLIGHT MODE

STANDBY MODE

LOW-SPEED MODE

NORMAL-SPEED MODE

HIGH-SPEED SAFETY MODE



==================================================

10. VISUAL DESIGN

==================================================



Make the interface look like a futuristic smart-city control system.



Use:



Dark night background

Road with lane markings

Glowing street lights

Animated vehicle

Smooth light transitions

Professional dashboard cards

Modern typography

Subtle animations

Clear icons

Responsive design



Use a professional blue/cyan smart-city visual theme.



Do NOT make it look like a basic school project.



The road simulation should be the main visual element.



==================================================

11. HIGH-SPEED SAFETY VISUALIZATION

==================================================



When speed > 80 km/h:



Show a prominent notification:



"HIGH-SPEED SAFETY MODE ACTIVE"



Show:



"500 m+ ROAD ILLUMINATED AHEAD"



Highlight the illuminated section of the road.



Display a visual arrow:



VEHICLE → → → 500 m+ ILLUMINATED ROAD



The purpose is to communicate that higher vehicle speed requires a longer illuminated distance for safe visibility and reaction time.



==================================================

12. ENERGY SAVING VISUALIZATION

==================================================



Add a circular or horizontal energy-saving indicator.



Example:



ENERGY SAVED

████████████░░░░

60%



Also show a comparison:



CONVENTIONAL SYSTEM

████████████████

1000 W



SMART SYSTEM

██████░░░░░░░░░░

400 W



Make the comparison update dynamically.



==================================================

13. SYSTEM ARCHITECTURE SECTION

==================================================



Below the simulation, add a section called:



"HOW THE SYSTEM WORKS"



Show this flow:



Vehicle Detection

↓

Speed Estimation

↓

ESP32 / Edge Controller

↓

Lighting Distance Calculation

↓

Adaptive Street Lights

↓

Energy Saving + Improved Visibility



Add a note:



"Real-world implementation can use long-range radar, LiDAR, computer vision or other suitable sensing technologies. The current prototype uses simulated detection."



==================================================

14. REAL-WORLD IMPLEMENTATION

==================================================



Add another section:



"REAL-WORLD DEPLOYMENT"



Show:



Roadside Detection Sensors

↓

Edge Controller

↓

Wireless Communication

↓

Smart LED Street Lights

↓

Central Monitoring Dashboard



Mention possible applications:



Highways

Expressways

Rural roads

Industrial roads

Low-traffic urban roads

Campus roads



==================================================

15. DEMO SCENARIO

==================================================



Add a "Hackathon Demo" panel explaining:



Scenario:

A vehicle approaches a dark road.



At low speed:

Only a shorter section of road is illuminated.



As speed increases:

The illuminated area automatically increases.



At high speed:

At least 500 m of road ahead is illuminated.



After the vehicle passes:

The lights gradually switch off.



Result:

Improved visibility + reduced unnecessary electricity consumption.



==================================================

16. FUNCTIONAL REQUIREMENTS

==================================================



The prototype must actually work.



Do NOT create static buttons.



All sliders, toggles and buttons must update the simulation.



The vehicle must move.



The lights must change according to speed.



The illumination distance must change.



The dashboard values must update.



The energy calculation must update.



The Full Automatic Demo must run automatically.



Add Start, Pause and Reset functionality.



Make sure there are no broken buttons or placeholder elements.



==================================================

17. PRESENTATION QUALITY

==================================================



Make this suitable for a NATIONAL-LEVEL HACKATHON.



The first screen should immediately communicate:



PROBLEM:

Street lights consume electricity even when roads are empty.



SOLUTION:

Illuminate only the required road section based on approaching traffic and speed.



INNOVATION:

Higher speed → longer illuminated distance.



KEY FEATURE:

High-speed vehicle → minimum 500 m illumination ahead.



BENEFITS:

Energy saving

Improved visibility

Adaptive lighting

Smart-city integration

Scalable deployment



Do not overcomplicate the interface.



A judge should understand the concept within 20–30 seconds.



Create the complete working prototype now.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://smart-lume-flow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/14ea079c-da88-463f-8df6-9ee6e3c07fcb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
