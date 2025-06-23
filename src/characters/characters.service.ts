import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character, Episode } from './entities/character.entity';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
  ) {}

  async create(createCharacterDto: CreateCharacterDto): Promise<Character> {
    try {
      const character = this.charactersRepository.create(createCharacterDto);
      return await this.charactersRepository.save(character);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Character with this name already exists');
      }
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResponseDto<Character>> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await this.charactersRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findOne(id: string): Promise<Character> {
    const character = await this.charactersRepository.findOne({ where: { id } });
    if (!character) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }
    return character;
  }

  async findByName(name: string): Promise<Character> {
    const character = await this.charactersRepository.findOne({ where: { name } });
    if (!character) {
      throw new NotFoundException(`Character with name ${name} not found`);
    }
    return character;
  }

  async update(id: string, updateCharacterDto: UpdateCharacterDto): Promise<Character> {
    const character = await this.findOne(id);
    
    try {
      Object.assign(character, updateCharacterDto);
      return await this.charactersRepository.save(character);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Character with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const character = await this.findOne(id);
    await this.charactersRepository.remove(character);
  }

  async seed(): Promise<Character[]> {
    const existingCount = await this.charactersRepository.count();
    if (existingCount > 0) {
      return [];
    }

    const seedData = [
      { name: 'Luke Skywalker', episodes: ['NEWHOPE', 'EMPIRE', 'JEDI'] as Episode[], planet: 'Tatooine', species: 'Human', affiliation: 'Rebel Alliance' },
      { name: 'Darth Vader', episodes: ['NEWHOPE', 'EMPIRE', 'JEDI'] as Episode[], planet: 'Tatooine', species: 'Human', affiliation: 'Galactic Empire' },
      { name: 'Han Solo', episodes: ['NEWHOPE', 'EMPIRE', 'JEDI'] as Episode[], planet: 'Corellia', species: 'Human', affiliation: 'Rebel Alliance' },
      { name: 'Leia Organa', episodes: ['NEWHOPE', 'EMPIRE', 'JEDI'] as Episode[], planet: 'Alderaan', species: 'Human', affiliation: 'Rebel Alliance' },
      { name: 'Wilhuff Tarkin', episodes: ['NEWHOPE'] as Episode[], planet: 'Eriadu', species: 'Human', affiliation: 'Galactic Empire' },
      { name: 'C-3PO', episodes: ['NEWHOPE', 'EMPIRE', 'JEDI'] as Episode[], planet: 'Tatooine', species: 'Droid', affiliation: 'Rebel Alliance' },
      { name: 'R2-D2', episodes: ['NEWHOPE', 'EMPIRE', 'JEDI'] as Episode[], planet: 'Naboo', species: 'Droid', affiliation: 'Rebel Alliance' },
    ];

    const characters = this.charactersRepository.create(seedData);
    return await this.charactersRepository.save(characters);
  }
} 