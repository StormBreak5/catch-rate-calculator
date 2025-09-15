import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Observable,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith,
  map,
} from 'rxjs';
import {
  trigger,
  style,
  transition,
  animate,
  keyframes,
} from '@angular/animations';
import { PokemonService } from '../services/pokemon.service';
import { CatchRateCalculatorService } from '../services/catch-rate-calculator.service';
import {
  Pokemon,
  CalculatorInputs,
  CatchRateResult,
} from '../models/pokemon.model';

@Component({
  selector: 'app-catch-rate-calculator',
  templateUrl: './catch-rate-calculator.component.html',
  styleUrls: ['./catch-rate-calculator.component.scss'],
  animations: [
    trigger('checkboxAnimation', [
      transition(':enter', [
        animate(
          '0.3s ease-in',
          keyframes([
            style({ transform: 'scale(0)', opacity: 0, offset: 0 }),
            style({ transform: 'scale(1.2)', opacity: 0.8, offset: 0.7 }),
            style({ transform: 'scale(1)', opacity: 1, offset: 1 }),
          ])
        ),
      ]),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate(
          '0.4s ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-in', style({ opacity: 1 })),
      ]),
    ]),
    trigger('progressAnimation', [
      transition('* => *', [animate('1s ease-out')]),
    ]),
  ],
})
export class CatchRateCalculatorComponent implements OnInit {
  calculatorForm: FormGroup;
  Math = Math;
  pokemonList$: Observable<{ name: string; url: string }[]>;
  filteredPokemon$!: Observable<{ name: string; url: string }[]>;
  selectedPokemon: Pokemon | null = null;
  result: CatchRateResult | null = null;
  isLoading = false;
  showSuggestions = false;

  generations = [
    { value: 1, label: 'Generation I (Red/Blue/Yellow)' },
    { value: 2, label: 'Generation II (Gold/Silver/Crystal)' },
    { value: 3, label: 'Generation III (Ruby/Sapphire/Emerald)' },
    { value: 4, label: 'Generation IV (Diamond/Pearl/Platinum)' },
    { value: 5, label: 'Generation V (Black/White)' },
    { value: 6, label: 'Generation VI (X/Y)' },
    { value: 7, label: 'Generation VII (Sun/Moon)' },
    { value: 8, label: 'Generation VIII (Sword/Shield)' },
    { value: 9, label: 'Generation IX (Scarlet/Violet)' },
  ];

  pokeballs = [
    {
      value: 'pokeball',
      label: 'Poké Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
    },
    {
      value: 'greatball',
      label: 'Great Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
    },
    {
      value: 'ultraball',
      label: 'Ultra Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png',
    },
    {
      value: 'masterball',
      label: 'Master Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
    },
    {
      value: 'safariball',
      label: 'Safari Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/safari-ball.png',
    },
    {
      value: 'netball',
      label: 'Net Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/net-ball.png',
    },
    {
      value: 'diveball',
      label: 'Dive Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dive-ball.png',
    },
    {
      value: 'nestball',
      label: 'Nest Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/nest-ball.png',
    },
    {
      value: 'repeatball',
      label: 'Repeat Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/repeat-ball.png',
    },
    {
      value: 'timerball',
      label: 'Timer Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/timer-ball.png',
    },
    {
      value: 'luxuryball',
      label: 'Luxury Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/luxury-ball.png',
    },
    {
      value: 'premierball',
      label: 'Premier Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/premier-ball.png',
    },
    {
      value: 'duskball',
      label: 'Dusk Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dusk-ball.png',
    },
    {
      value: 'healball',
      label: 'Heal Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/heal-ball.png',
    },
    {
      value: 'quickball',
      label: 'Quick Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-ball.png',
    },
    {
      value: 'cherishball',
      label: 'Cherish Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/cherish-ball.png',
    },
    {
      value: 'fastball',
      label: 'Fast Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fast-ball.png',
    },
    {
      value: 'levelball',
      label: 'Level Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/level-ball.png',
    },
    {
      value: 'lureball',
      label: 'Lure Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lure-ball.png',
    },
    {
      value: 'heavyball',
      label: 'Heavy Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/heavy-ball.png',
    },
    {
      value: 'loveball',
      label: 'Love Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/love-ball.png',
    },
    {
      value: 'friendball',
      label: 'Friend Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/friend-ball.png',
    },
    {
      value: 'moonball',
      label: 'Moon Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/moon-ball.png',
    },
    {
      value: 'sportball',
      label: 'Sport Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sport-ball.png',
    },
    {
      value: 'dreamball',
      label: 'Dream Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dream-ball.png',
    },
    {
      value: 'beastball',
      label: 'Beast Ball',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/beast-ball.png',
    },
  ];

  statusConditions = [
    { value: 'none', label: 'None' },
    { value: 'sleep', label: 'Sleep' },
    { value: 'freeze', label: 'Freeze' },
    { value: 'paralysis', label: 'Paralysis' },
    { value: 'burn', label: 'Burn' },
    { value: 'poison', label: 'Poison' },
  ];

  constructor(
    private fb: FormBuilder,
    private pokemonService: PokemonService,
    private calculatorService: CatchRateCalculatorService
  ) {
    this.calculatorForm = this.fb.group({
      pokemonName: ['', Validators.required],
      generation: [9, Validators.required],
      ballType: ['pokeball', Validators.required],
      statusCondition: ['none', Validators.required],
      currentHp: [1, [Validators.required, Validators.min(1)]],
      maxHp: [100, [Validators.required, Validators.min(1)]],
      pokemonLevel: [
        50,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      isFirstTurn: [false],
      isDarkGrass: [false],
      badgeCount: [0, [Validators.min(0), Validators.max(8)]],
      // Campos condicionais para pokéballs específicas
      hasBeenCaughtBefore: [false],
      targetGender: ['male'],
      playerGender: ['male'],
      isUnderwater: [false],
      isFishing: [false],
      playerLevel: [50, [Validators.min(1), Validators.max(100)]],
      turnsPassed: [1, [Validators.min(1), Validators.max(30)]],
      // Campos específicos para Gen 8+
      isMaxRaid: [false],
      isStaticEncounter: [false],
      isBackStrike: [false],
    });

    this.pokemonList$ = this.pokemonService.getPokemonList();
  }

  ngOnInit() {
    this.filteredPokemon$ = this.calculatorForm
      .get('pokemonName')!
      .valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) =>
          this.pokemonList$.pipe(
            map((pokemon) => {
              if (!value || value.length < 2) {
                return [];
              }
              return pokemon
                .filter((p) =>
                  p.name.toLowerCase().includes(value.toLowerCase())
                )
                .slice(0, 100);
            })
          )
        )
      );

    this.calculatorForm.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      if (this.selectedPokemon && this.calculatorForm.valid) {
        this.calculateCatchRate();
      }
    });
  }

  onPokemonSelect(pokemonName: string) {
    this.isLoading = true;
    this.showSuggestions = false;
    this.pokemonService.getPokemon(pokemonName).subscribe((pokemon) => {
      this.selectedPokemon = pokemon;
      this.isLoading = false;
      if (pokemon && this.calculatorForm.valid) {
        this.calculateCatchRate();
      }
    });
    console.log(this.selectedPokemon);
  }

  onInputFocus() {
    this.showSuggestions = true;
  }

  onInputBlur() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  shouldShowBallSpecificField(fieldName: string): boolean {
    const ballType = this.calculatorForm.get('ballType')?.value;

    switch (fieldName) {
      case 'hasBeenCaughtBefore':
        return ballType === 'repeatball';
      case 'genderFields':
        return ballType === 'loveball';
      case 'isUnderwater':
        return ballType === 'diveball';
      case 'isFishing':
        return ballType === 'lureball';
      case 'playerLevel':
        return ballType === 'levelball';
      case 'turnsPassed':
        return ballType === 'timerball';
      case 'gen8Fields':
        return this.calculatorForm.get('generation')?.value === 8;
      case 'gen9Fields':
        return this.calculatorForm.get('generation')?.value === 9;
      default:
        return false;
    }
  }

  // Verificar se deve mostrar modificadores adicionais baseado na pokéball e geração
  shouldShowAdditionalModifier(modifierName: string): boolean {
    const ballType = this.calculatorForm.get('ballType')?.value;
    const generation = this.calculatorForm.get('generation')?.value;

    switch (modifierName) {
      case 'isFirstTurn':
        return ballType === 'quickball' || ballType === 'timerball';
      case 'isDarkGrass':
        return ballType === 'duskball';
      case 'badgeCount':
        return generation >= 8;
      default:
        return true;
    }
  }

  calculateCatchRate() {
    if (!this.selectedPokemon) return;

    const formValue = this.calculatorForm.value;
    const inputs: CalculatorInputs = {
      pokemon: this.selectedPokemon,
      generation: formValue.generation,
      ballType: formValue.ballType,
      statusCondition: formValue.statusCondition,
      currentHp: formValue.currentHp,
      maxHp: formValue.maxHp,
      pokemonLevel: formValue.pokemonLevel,
      isFirstTurn: formValue.isFirstTurn,
      isDarkGrass: formValue.isDarkGrass,
      badgeCount: formValue.badgeCount,
      // Campos condicionais
      hasBeenCaughtBefore: formValue.hasBeenCaughtBefore,
      targetGender: formValue.targetGender,
      playerGender: formValue.playerGender,
      isUnderwater: formValue.isUnderwater,
      isFishing: formValue.isFishing,
      playerLevel: formValue.playerLevel,
      turnsPassed: formValue.turnsPassed,
      // Campos Gen 8+
      isMaxRaid: formValue.isMaxRaid,
      isStaticEncounter: formValue.isStaticEncounter,
      isBackStrike: formValue.isBackStrike,
    };

    this.result = this.calculatorService.calculateCatchRate(inputs);
  }

  onHpPercentChange(percent: number) {
    const maxHp = this.calculatorForm.get('maxHp')?.value || 100;
    const currentHp = Math.max(1, Math.floor((maxHp * percent) / 100));
    this.calculatorForm.patchValue({ currentHp });
  }

  isHpPercentActive(percent: number): boolean {
    const maxHp = this.calculatorForm.get('maxHp')?.value || 100;
    const currentHp = this.calculatorForm.get('currentHp')?.value || 1;
    const expectedHp = Math.max(1, Math.floor((maxHp * percent) / 100));
    return currentHp === expectedHp;
  }

  getProbabilityColor(probability: number): string {
    if (probability >= 90) return '#4CAF50';
    if (probability >= 70) return '#8BC34A';
    if (probability >= 50) return '#FFC107';
    if (probability >= 30) return '#FF9800';
    return '#F44336';
  }

  getSelectedBallIcon(): string {
    const selectedBallType = this.calculatorForm.get('ballType')?.value;
    const selectedBall = this.pokeballs.find(
      (ball) => ball.value === selectedBallType
    );
    return selectedBall?.icon || '';
  }

  getSelectedBallLabel(): string {
    const selectedBallType = this.calculatorForm.get('ballType')?.value;
    const selectedBall = this.pokeballs.find(
      (ball) => ball.value === selectedBallType
    );
    return selectedBall?.label || '';
  }

  getProgressCircleStyle(probability: number): any {
    const circumference = 2 * Math.PI * 65;
    const strokeDasharray = circumference;
    const strokeDashoffset =
      circumference - (probability / 100) * circumference;

    return {
      'stroke-dasharray': strokeDasharray,
      'stroke-dashoffset': strokeDashoffset,
      stroke: this.getProbabilityColor(probability),
      transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
    };
  }

  getProgressBackgroundStyle(): any {
    const circumference = 2 * Math.PI * 65;
    return {
      'stroke-dasharray': circumference,
      'stroke-dashoffset': 0,
    };
  }

  displayPokemon(pokemon: any): string {
    return pokemon ? pokemon : '';
  }
}
