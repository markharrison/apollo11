# Apollo 11 Lunar Landing Simulation

An interactive web-based simulation of the Apollo 11 Lunar Module landing sequence, featuring a functional DSKY (Display and Keyboard) interface based on the original Apollo Guidance Computer (AGC) code.

## Overview

This project converts the Apollo AGC assembly code for the lunar lander into an HTML/CSS/JavaScript application, allowing users to experience the lunar landing guidance programs through an authentic DSKY interface.

## Features

### DSKY Interface
- **Authentic Display**: Seven-segment style displays for PROG, VERB, NOUN, and three data registers (R1, R2, R3)
- **Indicator Lights**: Status lights including PROG, KEY REL, COMP ACTY, VEL, ALT, and more
- **Functional Keyboard**: Full DSKY keyboard with VERB, NOUN, numeric entry, and control buttons
- **Keyboard Shortcuts**: Physical keyboard support for faster input (V=VERB, N=NOUN, P=PRO, etc.)

### Landing Programs
Based on the original AGC programs from Luminary099:

- **P63 - Braking Phase**: High-altitude braking burn (50,000 ft)
- **P64 - Approach Phase**: Intermediate approach (7,500 ft)
- **P65 - Automatic Vertical Descent**: Final powered descent (500 ft)
- **P66 - Manual Landing**: Manual control mode
- **P00 - Standby**: Idle state

### Lunar Module Visualization
- Real-time graphical representation of the LM descending to the lunar surface
- Schematic view showing:
  - Lunar Module with descent and ascent stages
  - Landing legs
  - Thrust plume (animated based on throttle)
  - Velocity vector indicator
  - Lunar surface with craters
  - Altitude reference markers
  - Landing zone target

### Telemetry Display
Real-time mission data including:
- Altitude (feet above lunar surface)
- Vertical and horizontal velocity
- Fuel remaining (percentage)
- Engine throttle setting
- Current landing phase
- Time to fall (TTF)
- Landing status

### Simulation Controls
- **Speed Control**: Adjustable simulation speed (1x to 20x)
- **Pause/Resume**: Pause the simulation at any time
- **Reset**: Return to initial conditions

## Getting Started

### Running Locally

1. Clone this repository
2. Open `index.html` in a modern web browser, or
3. Run a local web server:
   ```bash
   python3 -m http.server 8080
   ```
   Then navigate to `http://localhost:8080`

### Using the DSKY

#### Quick Start
Click any of the "Quick Start Programs" buttons to immediately begin a landing sequence:
- **P63** for full landing sequence from 50,000 ft
- **P64** for approach phase from 7,500 ft  
- **P65** for final descent from 500 ft

#### Manual Operation
1. Press **VERB** then enter a two-digit verb code
2. Press **NOUN** then enter a two-digit noun code
3. Press **ENTR** to execute
4. Press **PRO** to proceed with program execution
5. Press **CLR** to clear current entry
6. Press **RSET** to reset the simulation

#### Keyboard Shortcuts
- `V` - VERB
- `N` - NOUN
- `P` - PRO (Proceed)
- `R` - KEY REL (Key Release)
- `E` - ENTR (Enter)
- `C` - CLR (Clear)
- `S` - RSET (Reset)
- `0-9` - Numeric entry
- `+` / `-` - Sign entry

## Technical Details

### Architecture

The application is built with vanilla JavaScript and organized into modular components:

- **index.html**: Main application structure and layout
- **styles.css**: Styling for DSKY, visualization, and UI components
- **agc-core.js**: Apollo Guidance Computer simulator with landing guidance algorithms
- **dsky.js**: DSKY interface controller handling display updates and input
- **landing-sim.js**: Landing simulation controller managing telemetry and state
- **visualization.js**: Canvas-based lunar landing visualization
- **main.js**: Application initialization and animation loop

### AGC Guidance Implementation

The guidance algorithms are simplified implementations based on the original AGC code:

- **Braking Guidance (P63)**: Implements deceleration profile using proportional control to reduce velocity based on altitude
- **Approach Guidance (P64)**: Manages transition from braking to vertical descent with terrain avoidance
- **Vertical Descent (P65)**: Controls final descent rate for safe touchdown
- **Manual Mode (P66)**: Allows throttle override for manual landing control

### Physics Simulation

The simulation models:
- Lunar gravity (5.32 ft/s²)
- Variable thrust (1,050 - 9,870 lbf)
- Mass changes due to fuel consumption
- Horizontal and vertical velocity components
- Altitude above lunar surface

## Original AGC Code

This simulation is inspired by the original Apollo 11 AGC source code, specifically:
- **Luminary099**: Lunar Module guidance software
- Key programs: P63, P64, P65, P66
- Source files: `THE_LUNAR_LANDING.agc`, `LUNAR_LANDING_GUIDANCE_EQUATIONS.agc`, `PINBALL_GAME_BUTTONS_AND_LIGHTS.agc`

The original AGC code is available in the `Luminary099/` directory and represents one of humanity's greatest software achievements.

## Browser Compatibility

Tested and working in:
- Chrome/Edge (recommended)
- Firefox
- Safari

Requires JavaScript enabled and HTML5 Canvas support.

## Future Enhancements

Potential improvements:
- More accurate guidance algorithm tuning for consistent safe landings
- Additional AGC programs (P30, P40, etc.)
- Radar altitude simulation
- IMU (Inertial Measurement Unit) simulation
- Landing site selection
- Fuel depletion warnings and abort scenarios
- Sound effects
- Mobile/tablet support with touch controls

## Credits

- **Original AGC Code**: NASA, MIT Instrumentation Laboratory
- **Digitization**: Virtual AGC Project (www.ibiblio.org/apollo)
- **Historical Figures**: Margaret Hamilton, Hal Laning, and the entire Apollo software team

## License

The original AGC code is in the public domain. This web application implementation is also released under the same public domain dedication in honor of the original Apollo program.

##References

- [Virtual AGC Project](http://www.ibiblio.org/apollo/)
- [Apollo 11 Mission](https://www.nasa.gov/mission_pages/apollo/missions/apollo11.html)
- [Original Source Scans](http://www.ibiblio.org/apollo/ScansForConversion/Luminary099/)

---

*"That's one small step for man, one giant leap for mankind."* - Neil Armstrong, July 20, 1969
