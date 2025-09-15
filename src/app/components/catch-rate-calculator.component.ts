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
})
export class CatchRateCalculatorComponent implements OnInit {
  calculatorForm: FormGroup;
  Math = Math; // Expose Math object to template
  pokemonList$: Observable<{ name: string; url: string }[]>;
  filteredPokemon$!: Observable<{ name: string; url: string }[]>;
  selectedPokemon: Pokemon | null = null;
  result: CatchRateResult | null = null;
  isLoading = false;
  showSuggestions = false; // Controlar visibilidade das sugestões

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
    { value: 'pokeball', label: 'Poké Ball' },
    { value: 'greatball', label: 'Great Ball' },
    { value: 'ultraball', label: 'Ultra Ball' },
    { value: 'masterball', label: 'Master Ball' },
    { value: 'safariball', label: 'Safari Ball' },
    { value: 'netball', label: 'Net Ball' },
    { value: 'diveball', label: 'Dive Ball' },
    { value: 'nestball', label: 'Nest Ball' },
    { value: 'repeatball', label: 'Repeat Ball' },
    { value: 'timerball', label: 'Timer Ball' },
    { value: 'luxuryball', label: 'Luxury Ball' },
    { value: 'premierball', label: 'Premier Ball' },
    { value: 'duskball', label: 'Dusk Ball' },
    { value: 'healball', label: 'Heal Ball' },
    { value: 'quickball', label: 'Quick Ball' },
    { value: 'cherishball', label: 'Cherish Ball' },
    { value: 'fastball', label: 'Fast Ball' },
    { value: 'levelball', label: 'Level Ball' },
    { value: 'lureball', label: 'Lure Ball' },
    { value: 'heavyball', label: 'Heavy Ball' },
    { value: 'loveball', label: 'Love Ball' },
    { value: 'friendball', label: 'Friend Ball' },
    { value: 'moonball', label: 'Moon Ball' },
    { value: 'sportball', label: 'Sport Ball' },
    { value: 'dreamball', label: 'Dream Ball' },
    { value: 'beastball', label: 'Beast Ball' },
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
      isCriticalCapture: [false],
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
                return []; // Não mostrar nada se menos de 2 caracteres
              }
              return pokemon
                .filter((p) =>
                  p.name.toLowerCase().includes(value.toLowerCase())
                )
                .slice(0, 100); // Aumentar para 100 resultados
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
    this.showSuggestions = false; // Esconder sugestões após seleção
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
    // Delay para permitir clique nas sugestões
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  // Verificar se deve mostrar campos específicos baseado na pokéball
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
      default:
        return false;
    }
  }

  // Verificar se deve mostrar modificadores adicionais baseado na pokéball e geração
  shouldShowAdditionalModifier(modifierName: string): boolean {
    const ballType = this.calculatorForm.get('ballType')?.value;
    const generation = this.calculatorForm.get('generation')?.value;

    switch (modifierName) {
      case 'isCriticalCapture':
        return generation >= 5; // Critical Capture só existe a partir da Gen 5
      case 'isFirstTurn':
        return ballType === 'quickball' || ballType === 'timerball';
      case 'isDarkGrass':
        return ballType === 'duskball';
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
      isCriticalCapture: formValue.isCriticalCapture,
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
}
