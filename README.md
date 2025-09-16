# Pokémon Catch Rate Calculator

A comprehensive Angular application that calculates the probability of successfully catching Pokémon across all generations. This tool helps trainers optimize their catching strategies by considering various factors like Pokéball type, Pokémon status conditions, HP levels, and generation-specific mechanics.

## Features

- **Multi-Generation Support**: Accurate calculations for Generations I through IX
- **Comprehensive Pokéball Database**: Support for 26+ different Pokéball types with unique modifiers
- **Real-time Calculations**: Dynamic updates as you adjust parameters
- **Pokémon Search**: Autocomplete search powered by PokéAPI
- **Visual Feedback**: Animated progress indicators and color-coded probability displays
- **Advanced Modifiers**:
  - Status conditions (Sleep, Paralysis, Burn, etc.)
  - HP percentage sliders
  - Generation-specific features (Max Raids, Static Encounters)
  - Pokéball-specific conditions (Timer Ball turns, Love Ball gender matching)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Angular CLI

### Installation

```bash
npm install
```

### Development Server

```bash
ng serve
```

Navigate to `http://localhost:4200/` to use the calculator.

### Build for Production

```bash
ng build
```

Build artifacts will be stored in the `dist/` directory.

## How to Use

1. **Select a Pokémon**: Start typing a Pokémon name in the search field
2. **Choose Generation**: Select the game generation you're playing
3. **Pick Your Pokéball**: Choose from the extensive list of available Pokéballs
4. **Set Conditions**: Adjust HP, status conditions, and other modifiers
5. **View Results**: See real-time catch rate calculations with visual indicators

## Technical Stack

- **Framework**: Angular 14
- **UI Components**: Angular Material
- **Animations**: Angular Animations API
- **Data Source**: PokéAPI
- **Styling**: SCSS with custom animations

## Testing

```bash
ng test
```

## Contributing

Feel free to submit issues and enhancement requests!
