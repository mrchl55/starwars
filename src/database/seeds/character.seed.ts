import { DataSource } from 'typeorm';
import { Character, Episode } from '../../characters/entities/character.entity';

export async function seedCharacters(dataSource: DataSource): Promise<void> {
  const characterRepository = dataSource.getRepository(Character);
  
  const existingCount = await characterRepository.count();
  if (existingCount > 0) {
    console.log('Characters already exist, skipping seed');
    return;
  }

  const seedData = [
    { name: 'Luke Skywalker', episodes: [Episode.NEWHOPE, Episode.EMPIRE, Episode.JEDI], planet: 'Tatooine', species: 'Human', affiliation: 'Rebel Alliance' },
    { name: 'Darth Vader', episodes: [Episode.NEWHOPE, Episode.EMPIRE, Episode.JEDI], planet: 'Tatooine', species: 'Human', affiliation: 'Galactic Empire' },
    { name: 'Han Solo', episodes: [Episode.NEWHOPE, Episode.EMPIRE, Episode.JEDI], planet: 'Corellia', species: 'Human', affiliation: 'Rebel Alliance' },
    { name: 'Leia Organa', episodes: [Episode.NEWHOPE, Episode.EMPIRE, Episode.JEDI], planet: 'Alderaan', species: 'Human', affiliation: 'Rebel Alliance' },
    { name: 'Wilhuff Tarkin', episodes: [Episode.NEWHOPE], planet: 'Eriadu', species: 'Human', affiliation: 'Galactic Empire' },
    { name: 'C-3PO', episodes: [Episode.NEWHOPE, Episode.EMPIRE, Episode.JEDI], planet: 'Tatooine', species: 'Droid', affiliation: 'Rebel Alliance' },
    { name: 'R2-D2', episodes: [Episode.NEWHOPE, Episode.EMPIRE, Episode.JEDI], planet: 'Naboo', species: 'Droid', affiliation: 'Rebel Alliance' },
  ];

  const characters = characterRepository.create(seedData);
  await characterRepository.save(characters);
  
  console.log(`Seeded ${characters.length} characters successfully`);
} 