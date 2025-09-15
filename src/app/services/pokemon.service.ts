import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
import { Pokemon, PokemonSpecies } from '../models/pokemon.model';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  getPokemonList(
    limit: number = 2000
  ): Observable<{ name: string; url: string }[]> {
    return this.http.get<any>(`${this.baseUrl}/pokemon?limit=${limit}`).pipe(
      map((response) => response.results),
      catchError(() => of([]))
    );
  }

  getPokemon(nameOrId: string | number): Observable<Pokemon | null> {
    const pokemonRequest = this.http.get<any>(
      `${this.baseUrl}/pokemon/${nameOrId}`
    );
    const speciesRequest = this.http.get<PokemonSpecies>(
      `${this.baseUrl}/pokemon-species/${nameOrId}`
    );

    return forkJoin([pokemonRequest, speciesRequest]).pipe(
      map(([pokemon, species]) => {
        const types = pokemon.types.map((t: any) => t.type.name);
        const ultraBeasts = [
          'nihilego',
          'buzzwole',
          'pheromosa',
          'xurkitree',
          'celesteela',
          'kartana',
          'guzzlord',
          'necrozma',
          'poipole',
          'naganadel',
          'stakataka',
          'blacephalon',
        ];

        const stats = {
          hp: pokemon.stats[0].base_stat,
          attack: pokemon.stats[1].base_stat,
          defense: pokemon.stats[2].base_stat,
          specialAttack: pokemon.stats[3].base_stat,
          specialDefense: pokemon.stats[4].base_stat,
          speed: pokemon.stats[5].base_stat,
        };

        return {
          id: pokemon.id,
          name: pokemon.name,
          captureRate: species.capture_rate,
          types: types,
          isUltraBeast: ultraBeasts.includes(pokemon.name.toLowerCase()),
          weight: pokemon.weight,
          stats: stats,
          sprites: pokemon.sprites,
        };
      }),
      catchError(() => of(null))
    );
  }
}
