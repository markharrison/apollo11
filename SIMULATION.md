# Apollo 11 AGC/DSKY Lunar Landing Simulation

A desktop-focused, interactive simulation of the Apollo 11 Lunar Module's AGC (Apollo Guidance Computer) and DSKY (Display and Keyboard) interface during the lunar landing sequence.

## Features

### Authentic DSKY Interface
- Realistic Apollo-style DSKY display with green phosphor-style text
- Status indicator lights (PROG, ALT, VEL) that activate based on flight conditions
- Full keyboard and mouse support for all controls
- Real-time display of:
  - **PROG 63**: Lunar Landing Braking Phase program
  - **VERB 16**: Monitor Decimal Display command
  - **NOUN 63**: Displays altitude, vertical velocity, and fuel remaining
  - **Registers R1-R3**: Live telemetry data

### AGC Landing Simulation
- Realistic P63 (Powered Descent) program simulation with three guidance phases:
  - **BRAKING PHASE** (50,000 - 7,500 ft): High thrust to reduce velocity
  - **APPROACH PHASE** (7,500 - 500 ft): Controlled descent rate
  - **FINAL DESCENT** (<500 ft): Gentle touchdown preparation
- Physics-based simulation including:
  - Lunar gravity (1/6 of Earth's)
  - Engine thrust and fuel consumption
  - Altitude and velocity calculations
- Landing success/failure detection based on touchdown velocity

### Real-time Visualization
- 2D graphical representation showing:
  - Lunar Module with descent and ascent stages
  - Animated thrust plume (proportional to engine throttle)
  - Lunar surface with craters
  - Landing target marker
  - Altitude reference lines
  - Starfield background
- Success message: "EAGLE HAS LANDED - Tranquility Base here"
- Failure message: "CRASH LANDING - Mission Failed"

### Interactive Controls
- **Time Multiplier Slider**: Control simulation speed from 1x to 20x
- **Pause/Resume Button**: Pause and resume the simulation
- **Reset Button**: Restart the landing sequence
- **Real-time Telemetry**: Live display of altitude, velocities, fuel, thrust, and mission time

## Getting Started

### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or dependencies required - just open the HTML file!

### Running the Simulation

1. Open `index.html` in your web browser
2. The simulation starts automatically with Program 63 running
3. Watch the DSKY display for real-time telemetry:
   - **R1**: Altitude in feet above lunar surface
   - **R2**: Vertical velocity in ft/s (negative = descending)
   - **R3**: Fuel remaining (percentage)

### Controls

#### DSKY Keyboard (Mouse)
Click any button on the DSKY keyboard to interact with the AGC:
- **VERB / NOUN**: Enter verb or noun codes
- **0-9**: Enter numeric values
- **+/-**: Enter positive or negative signs
- **ENTR**: Confirm entry
- **CLR**: Clear current entry
- **RSET**: Reset DSKY display
- **PRO**: Proceed/acknowledge

#### DSKY Keyboard (Keyboard Shortcuts)
- `V` = VERB
- `N` = NOUN
- `E` or `Enter` = ENTR
- `C` or `Esc` = CLR
- `R` = RSET
- `P` = PRO
- `0-9` = Number keys
- `+` / `-` = Plus/Minus

#### Simulation Controls
- **Time Slider**: Drag or use arrow keys to adjust speed (1x-20x)
- **Pause Button**: Pause/resume the simulation
- **Reset Button**: Restart from 50,000 feet

## Understanding the Display

### DSKY Registers (V16N63)
- **R1 (Altitude)**: Distance above lunar surface in feet
  - Starts at 50,000 ft
  - Landing occurs at 0-10 ft
- **R2 (Vertical Velocity)**: Rate of descent in feet per second
  - Negative values indicate descending
  - Safe landing requires velocity < 10 ft/s
- **R3 (Fuel Remaining)**: Percentage of fuel remaining
  - Starts at 100%
  - Running out of fuel will cause a crash

### Status Lights
- **PROG**: Program running indicator (lit during active descent)
- **ALT**: Altitude warning (lit when below 1,000 ft)
- **VEL**: Velocity warning (lit when descent rate > 100 ft/s)

### Telemetry Panel
Real-time data display showing:
- Altitude
- Vertical and horizontal velocities
- Fuel remaining
- Engine thrust percentage
- Mission elapsed time

## Tips for Successful Landing

1. **Start Slow**: Use 1x speed for your first few attempts
2. **Monitor R2**: Keep vertical velocity between -10 and -50 ft/s for safe descent
3. **Watch Fuel**: Don't run out! The simulation becomes uncontrollable without fuel
4. **Final Approach**: Below 500 ft, the AGC will automatically slow descent rate
5. **Touchdown**: Aim for vertical velocity less than 10 ft/s when altitude reaches 0

## Technical Details

### File Structure
- `index.html` - Main HTML page with DSKY and visualization layout
- `styles.css` - Styling for the Apollo-themed interface
- `agc-sim.js` - AGC simulation logic and physics engine
- `dsky.js` - DSKY interface controller
- `visualization.js` - Canvas-based visualization renderer
- `main.js` - Main application controller

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Performance Notes
- The simulation works best at 1x-2x speed
- Higher speeds (3x+) may result in landing failures due to the discrete-time physics simulation
- This simulates the real challenge of lunar landing - precision is critical!

## Historical Context

This simulation is inspired by the actual Apollo 11 lunar landing on July 20, 1969. The real Apollo Guidance Computer ran Program 63 (P63) during the braking phase of the descent, automatically controlling the Lunar Module's descent engine to reduce velocity from thousands of feet per second to a gentle touchdown on the lunar surface at Tranquility Base.

The DSKY (Display and Keyboard) was the astronauts' primary interface with the AGC, displaying critical information through numeric codes (Verbs and Nouns) and three data registers.

## Attribution

This simulation is based on the original Apollo 11 AGC source code available in the `Luminary099` directory of this repository. The source code for the Lunar Module's AGC has been digitized by the [Virtual AGC](http://www.ibiblio.org/apollo/) project and is in the public domain.

## License

This simulation code is released under the same public domain status as the original Apollo 11 source code.

## Acknowledgments

- NASA and the Apollo 11 mission team
- Virtual AGC project for digitizing the original source code
- MIT Museum for preserving the original documentation
- The amazing engineers and programmers of the Apollo program

---

**"That's one small step for man, one giant leap for mankind."** - Neil Armstrong, July 20, 1969
