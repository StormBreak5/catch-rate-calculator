import { Injectable } from '@angular/core';
import { CalculatorInputs, CatchRateResult } from '../models/pokemon.model';

@Injectable({
  providedIn: 'root',
})
export class CatchRateCalculatorService {
  private ballModifiers: { [key: string]: number } = {
    pokeball: 1,
    greatball: 1.5,
    ultraball: 2,
    masterball: 255,
    safariball: 1.5,
    netball: 3, // vs Bug/Water types
    diveball: 3.5, // underwater
    nestball: 1, // varies by level
    repeatball: 3, // if caught before
    timerball: 1, // varies by turn
    luxuryball: 1,
    premierball: 1,
    duskball: 3, // at night/caves
    healball: 1,
    quickball: 5, // first turn only
    cherishball: 1,
    fastball: 4, // vs fast Pokemon
    levelball: 1, // varies by level difference
    lureball: 3, // vs fishing
    heavyball: 1, // varies by weight
    loveball: 8, // vs opposite gender
    friendball: 1,
    moonball: 4, // vs Moon Stone evolution
    sportball: 1.5,
    dreamball: 1,
    beastball: 5, // vs Ultra Beasts
  };

  private statusModifiers: { [key: string]: number } = {
    none: 1,
    sleep: 2.5,
    freeze: 2.5,
    paralysis: 1.5,
    burn: 1.5,
    poison: 1.5,
  };

  calculateCatchRate(inputs: CalculatorInputs): CatchRateResult {
    if (!inputs.pokemon) {
      return { catchRate: 0, probability: 0, shakeChecks: [], formula: '' };
    }

    switch (Number(inputs.generation)) {
      case 1:
        return this.calculateGen1(inputs);
      case 2:
        return this.calculateGen2(inputs);
      case 3:
      case 4:
        return this.calculateGen3And4(inputs);
      case 5:
      case 6:
      case 7:
        return this.calculateGen5To7(inputs);
      case 8:
        return this.calculateGen8(inputs);
      case 9:
        return this.calculateGen9(inputs);
      default:
        return this.calculateGen9(inputs);
    }
  }

  private calculateGen1(inputs: CalculatorInputs): CatchRateResult {
    const { pokemon, ballType, statusCondition, currentHp, maxHp } = inputs;

    if (!pokemon) {
      return { catchRate: 0, probability: 0, shakeChecks: [], formula: '' };
    }

    const ballBonus = this.getBallModifier(ballType, inputs);
    const statusBonus =
      statusCondition === 'sleep' || statusCondition === 'freeze'
        ? 25
        : statusCondition !== 'none'
        ? 12
        : 0;

    const hpFactor = Math.max(
      1,
      Math.floor((maxHp * 255 * 4) / (currentHp * 12))
    );
    const catchRate = Math.min(
      255,
      Math.floor((pokemon.captureRate + statusBonus) * ballBonus)
    );

    const f = Math.max(1, Math.floor(hpFactor / 256));
    const probability =
      Math.min(1, (catchRate + 1) / 256) * Math.pow(f / 256, 3);

    return {
      catchRate,
      probability: probability * 100,
      shakeChecks: [],
      formula: `Generation I: ((Catch Rate + Status Bonus) × Ball Modifier) × HP Factor`,
    };
  }

  private calculateGen2(inputs: CalculatorInputs): CatchRateResult {
    const {
      pokemon,
      ballType,
      statusCondition,
      currentHp,
      maxHp,
      pokemonLevel,
    } = inputs;

    if (!pokemon) {
      return { catchRate: 0, probability: 0, shakeChecks: [], formula: '' };
    }

    let ballBonus = this.getBallModifier(ballType, inputs);

    // Special ball calculations for Gen 2
    if (ballType === 'levelball') {
      const levelDiff = inputs.pokemonLevel - pokemonLevel;
      ballBonus =
        levelDiff >= 20 ? 8 : levelDiff >= 10 ? 4 : levelDiff >= 0 ? 2 : 1;
    }

    const statusBonus = this.statusModifiers[statusCondition] || 1;
    const hpFactor = Math.floor(
      ((3 * maxHp - 2 * currentHp) * pokemon.captureRate * ballBonus) /
        (3 * maxHp)
    );

    const a = Math.max(1, Math.floor(hpFactor * statusBonus));
    const probability = a >= 255 ? 100 : Math.pow(a / 255, 4) * 100;

    return {
      catchRate: a,
      probability,
      shakeChecks: [],
      formula: `Generation II: (((3×MaxHP - 2×CurrentHP) × Catch Rate × Ball) / (3×MaxHP)) × Status`,
    };
  }

  private calculateGen3And4(inputs: CalculatorInputs): CatchRateResult {
    const { pokemon, ballType, statusCondition, currentHp, maxHp } = inputs;

    if (!pokemon) {
      return { catchRate: 0, probability: 0, shakeChecks: [], formula: '' };
    }

    const ballBonus = this.getBallModifier(ballType, inputs);
    const statusBonus = this.statusModifiers[statusCondition] || 1;

    const a = Math.floor(
      ((3 * maxHp - 2 * currentHp) *
        pokemon.captureRate *
        ballBonus *
        statusBonus) /
        (3 * maxHp)
    );
    const b = Math.floor(1048560 / Math.sqrt(Math.sqrt(16711680 / a)));

    const shakeChecks = Array(4)
      .fill(0)
      .map(() => Math.floor(Math.random() * 65536));
    const shakeProbability = shakeChecks.filter((check) => check < b).length;

    const probability = a >= 255 ? 100 : Math.pow(b / 65536, 4) * 100;

    return {
      catchRate: a,
      probability,
      shakeChecks,
      formula: `Generation III-IV: (((3×MaxHP - 2×CurrentHP) × Catch Rate × Ball × Status) / (3×MaxHP)) with shake checks`,
    };
  }

  private calculateGen5To7(inputs: CalculatorInputs): CatchRateResult {
    const {
      pokemon,
      ballType,
      statusCondition,
      currentHp,
      maxHp,
      isCriticalCapture,
    } = inputs;

    if (!pokemon) {
      return { catchRate: 0, probability: 0, shakeChecks: [], formula: '' };
    }

    const ballBonus = this.getBallModifier(ballType, inputs);
    const statusBonus = this.statusModifiers[statusCondition] || 1;

    const a = Math.floor(
      ((3 * maxHp - 2 * currentHp) *
        pokemon.captureRate *
        ballBonus *
        statusBonus) /
        (3 * maxHp)
    );
    const b = Math.floor(65536 / Math.pow(255 / a, 0.1875));

    let probability: number;
    let shakeChecks: number[] = [];

    if (a >= 255) {
      probability = 100;
    } else if (isCriticalCapture) {
      // Critical capture - only one shake check
      const criticalThreshold = Math.floor(b / 6);
      shakeChecks = [Math.floor(Math.random() * 65536)];
      probability = (criticalThreshold / 65536) * 100;
    } else {
      // Normal capture - four shake checks
      shakeChecks = Array(4)
        .fill(0)
        .map(() => Math.floor(Math.random() * 65536));
      probability = Math.pow(b / 65536, 4) * 100;
    }

    return {
      catchRate: a,
      probability,
      shakeChecks,
      formula: `Generation V-VII: (((3×MaxHP - 2×CurrentHP) × Catch Rate × Ball × Status) / (3×MaxHP)) with critical capture`,
    };
  }

  private calculateGen8(inputs: CalculatorInputs): CatchRateResult {
    const {
      pokemon,
      ballType,
      statusCondition,
      currentHp,
      maxHp,
      pokemonLevel,
      isCriticalCapture,
      badgeCount,
    } = inputs;

    if (!pokemon) {
      return { catchRate: 0, probability: 0, shakeChecks: [], formula: '' };
    }

    const ballBonus = this.getBallModifier(ballType, inputs);
    const statusBonus = this.statusModifiers[statusCondition] || 1;

    // Gen 8 introduces level-based bonus and difficulty factor
    const levelBonus = Math.max(1, (30 - pokemonLevel) / 10);

    // Difficulty factor for Max Raids
    let difficultyFactor = 1;
    if (inputs.isMaxRaid) {
      difficultyFactor = 2; // Max Raids are significantly harder
    }

    // Badge penalty for high-level Pokémon
    let badgePenalty = 1;
    if (pokemonLevel > (badgeCount || 0) * 10 + 10) {
      badgePenalty = 0.8; // Penalty for catching Pokémon above badge level
    }

    const a = Math.floor(
      ((3 * maxHp - 2 * currentHp) *
        pokemon.captureRate *
        ballBonus *
        statusBonus *
        levelBonus *
        difficultyFactor *
        badgePenalty) /
        (3 * maxHp)
    );
    const b = Math.floor(65536 / Math.pow(255 / a, 0.1875));

    let probability: number;
    let shakeChecks: number[] = [];

    if (a >= 255) {
      probability = 100;
    } else if (isCriticalCapture) {
      // Gen 8 critical capture has improved rates
      const criticalThreshold = Math.floor(b / 4);
      shakeChecks = [Math.floor(Math.random() * 65536)];
      probability = (criticalThreshold / 65536) * 100;
    } else {
      shakeChecks = Array(4)
        .fill(0)
        .map(() => Math.floor(Math.random() * 65536));
      probability = Math.pow(b / 65536, 4) * 100;
    }

    return {
      catchRate: a,
      probability,
      shakeChecks,
      formula: `Generation VIII: Base formula × Level Bonus × Difficulty × Badge Penalty with improved mechanics`,
    };
  }

  private calculateGen9(inputs: CalculatorInputs): CatchRateResult {
    const {
      pokemon,
      ballType,
      statusCondition,
      currentHp,
      maxHp,
      pokemonLevel,
      isCriticalCapture,
      badgeCount,
    } = inputs;

    if (!pokemon) {
      return { catchRate: 0, probability: 0, shakeChecks: [], formula: '' };
    }

    const ballBonus = this.getBallModifier(ballType, inputs);
    const statusBonus = this.statusModifiers[statusCondition] || 1;

    // Gen 9 level bonus formula (changed from Gen 8)
    const levelBonus = Math.max(1, (36 - 2 * pokemonLevel) / 10);

    // Badge penalty is more severe in Gen 9
    let badgePenalty = 1;
    const requiredBadges = Math.ceil(pokemonLevel / 13); // Rough approximation
    if ((badgeCount || 0) < requiredBadges) {
      const n = requiredBadges - (badgeCount || 0);
      badgePenalty = Math.pow(0.8, n); // Exponential penalty
    }

    // Bonus for static encounters and back strikes
    let encounterBonus = 1;
    if (inputs.isStaticEncounter) {
      encounterBonus *= 1.25; // 25% bonus for static encounters
    }
    if (inputs.isBackStrike) {
      encounterBonus *= 2; // 2x bonus for back strikes
    }

    const a = Math.floor(
      ((3 * maxHp - 2 * currentHp) *
        pokemon.captureRate *
        ballBonus *
        statusBonus *
        levelBonus *
        badgePenalty *
        encounterBonus) /
        (3 * maxHp)
    );
    const b = Math.floor(65536 / Math.pow(255 / a, 0.1875));

    let probability: number;
    let shakeChecks: number[] = [];

    if (a >= 255) {
      probability = 100;
    } else if (isCriticalCapture) {
      // Gen 9 has the best critical capture rates
      const criticalThreshold = Math.floor(b / 3);
      shakeChecks = [Math.floor(Math.random() * 65536)];
      probability = (criticalThreshold / 65536) * 100;
    } else {
      shakeChecks = Array(4)
        .fill(0)
        .map(() => Math.floor(Math.random() * 65536));
      probability = Math.pow(b / 65536, 4) * 100;
    }

    return {
      catchRate: a,
      probability,
      shakeChecks,
      formula: `Generation IX: Base formula × Level Bonus × Badge Penalty × Encounter Bonus with enhanced mechanics`,
    };
  }

  private getBallModifier(ballType: string, inputs: CalculatorInputs): number {
    let modifier = this.ballModifiers[ballType] || 1;
    const pokemon = inputs.pokemon;

    if (!pokemon) return modifier;

    // Special ball logic
    switch (ballType) {
      case 'nestball':
        // Nest Ball: mais efetivo contra Pokémon de nível baixo
        modifier = Math.max(1, (41 - inputs.pokemonLevel) / 10);
        break;

      case 'timerball':
        // Timer Ball: fórmula baseada nos turnos passados
        const turns = inputs.turnsPassed || 1;
        if (inputs.generation >= 5) {
          // Gen 5+: (1 + turnsPassed * 1229/4096), máximo 4x em 10 turnos
          modifier = Math.min(4, 1 + (turns * 1229) / 4096);
        } else {
          // Gen 3-4: (turnsPassed + 10)/10, máximo 4x em 30 turnos
          modifier = Math.min(4, (turns + 10) / 10);
        }
        break;

      case 'quickball':
        // Quick Ball: 5x no primeiro turno, 1x depois
        modifier = inputs.isFirstTurn ? 5 : 1;
        break;

      case 'duskball':
        // Dusk Ball: 3x em cavernas/noite
        modifier = inputs.isDarkGrass ? 3 : 1;
        break;

      case 'netball':
        // Net Ball: 3.5x contra Bug/Water types
        modifier = pokemon.types.some(
          (type) => type === 'bug' || type === 'water'
        )
          ? 3.5
          : 1;
        break;

      case 'diveball':
        // Dive Ball: 3.5x underwater
        modifier = inputs.isUnderwater ? 3.5 : 1;
        break;

      case 'repeatball':
        // Repeat Ball: 3.5x se já foi capturado antes
        modifier = inputs.hasBeenCaughtBefore ? 3.5 : 1;
        break;

      case 'fastball':
        // Fast Ball: 4x contra Pokémon com Speed >= 100
        modifier = pokemon.stats.speed >= 100 ? 4 : 1;
        break;

      case 'levelball':
        // Level Ball: varia baseado na diferença de nível
        const playerLevel = inputs.playerLevel || 50;
        const levelDiff = playerLevel - inputs.pokemonLevel;
        if (levelDiff >= 20) modifier = 8;
        else if (levelDiff >= 10) modifier = 4;
        else if (levelDiff >= 0) modifier = 2;
        else modifier = 1;
        break;

      case 'lureball':
        // Lure Ball: 4x contra Pokémon pescados
        modifier = inputs.isFishing ? 4 : 1;
        break;

      case 'heavyball':
        // Heavy Ball: baseado no peso real do Pokémon
        const weightInKg = pokemon.weight / 10; // Converter hectogramas para kg
        if (weightInKg >= 300) modifier = 4;
        else if (weightInKg >= 200) modifier = 3;
        else if (weightInKg >= 100) modifier = 2;
        else if (weightInKg < 10) modifier = 0.5;
        else modifier = 1;
        break;

      case 'loveball':
        // Love Ball: 8x se for gênero oposto, 1x se mesmo gênero ou genderless
        if (inputs.targetGender === 'genderless') {
          modifier = 1;
        } else {
          modifier = inputs.playerGender !== inputs.targetGender ? 8 : 1;
        }
        break;

      case 'moonball':
        // Moon Ball: 4x contra Pokémon que evoluem com Moon Stone
        const moonStonePokemon = [30, 33, 35, 39, 300, 301, 517, 518];
        modifier = moonStonePokemon.includes(pokemon.id) ? 4 : 1;
        break;

      case 'beastball':
        // Beast Ball: 5x contra Ultra Beasts, 0.1x contra outros
        modifier = pokemon.isUltraBeast ? 5 : 0.1;
        break;

      case 'dreamball':
        // Dream Ball: funciona apenas em Pokémon dormindo
        modifier = inputs.statusCondition === 'sleep' ? 4 : 1;
        break;
    }

    return modifier;
  }
}
