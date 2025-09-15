export interface Pokemon {
  id: number;
  name: string;
  captureRate: number;
  types: string[];
  isUltraBeast: boolean;
  weight: number; // em hectogramas (API padrão)
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
}

export interface PokemonSpecies {
  capture_rate: number;
}

export interface CalculatorInputs {
  pokemon: Pokemon | null;
  generation: number;
  ballType: string;
  statusCondition: string;
  currentHp: number;
  maxHp: number;
  pokemonLevel: number;
  isCriticalCapture: boolean;
  isFirstTurn: boolean;
  isDarkGrass: boolean;
  badgeCount: number;
  // Campos condicionais para pokéballs específicas
  hasBeenCaughtBefore?: boolean; // Para Repeat Ball
  targetGender?: 'male' | 'female' | 'genderless'; // Para Love Ball
  playerGender?: 'male' | 'female'; // Para Love Ball
  isUnderwater?: boolean; // Para Dive Ball
  isFishing?: boolean; // Para Lure Ball
  playerLevel?: number; // Para Level Ball
  turnsPassed?: number; // Para Timer Ball
}

export interface CatchRateResult {
  catchRate: number;
  probability: number;
  shakeChecks: number[];
  formula: string;
}
