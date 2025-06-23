import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CharactersService } from '../characters.service';
import { Character, Episode } from '../entities/character.entity';

describe('CharactersService', () => {
  let service: CharactersService;
  let repository: Repository<Character>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };

  const mockCharacter: Character = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Luke Skywalker',
    episodes: [Episode.NEWHOPE, Episode.EMPIRE, Episode.JEDI],
    planet: 'Tatooine',
    species: 'Human',
    affiliation: 'Rebel Alliance',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharactersService,
        {
          provide: getRepositoryToken(Character),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CharactersService>(CharactersService);
    repository = module.get<Repository<Character>>(getRepositoryToken(Character));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      name: 'Luke Skywalker',
      episodes: [Episode.NEWHOPE, Episode.EMPIRE, Episode.JEDI],
      planet: 'Tatooine',
      species: 'Human',
      affiliation: 'Rebel Alliance',
    };

    it('should create a character successfully', async () => {
      mockRepository.create.mockReturnValue(mockCharacter);
      mockRepository.save.mockResolvedValue(mockCharacter);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockCharacter);
      expect(result).toEqual(mockCharacter);
    });

    it('should throw ConflictException when character name already exists', async () => {
      const dbError = { code: '23505' };
      mockRepository.create.mockReturnValue(mockCharacter);
      mockRepository.save.mockRejectedValue(dbError);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated characters', async () => {
      const characters = [mockCharacter];
      const total = 1;
      mockRepository.findAndCount.mockResolvedValue([characters, total]);

      const result = await service.findAll(1, 10);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({
        data: characters,
        total,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should calculate pagination correctly', async () => {
      const characters = Array(5).fill(mockCharacter);
      const total = 25;
      mockRepository.findAndCount.mockResolvedValue([characters, total]);

      const result = await service.findAll(2, 5);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        order: { createdAt: 'DESC' },
      });
      expect(result.totalPages).toBe(5);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a character by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockCharacter);

      const result = await service.findOne(mockCharacter.id);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: mockCharacter.id } });
      expect(result).toEqual(mockCharacter);
    });

    it('should throw NotFoundException when character not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByName', () => {
    it('should return a character by name', async () => {
      mockRepository.findOne.mockResolvedValue(mockCharacter);

      const result = await service.findByName(mockCharacter.name);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { name: mockCharacter.name } });
      expect(result).toEqual(mockCharacter);
    });

    it('should throw NotFoundException when character not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findByName('Unknown Character')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = { planet: 'Dagobah' };

    it('should update a character successfully', async () => {
      const updatedCharacter = { ...mockCharacter, ...updateDto };
      mockRepository.findOne.mockResolvedValue(mockCharacter);
      mockRepository.save.mockResolvedValue(updatedCharacter);

      const result = await service.update(mockCharacter.id, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: mockCharacter.id } });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedCharacter);
    });

    it('should throw NotFoundException when character not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when updated name already exists', async () => {
      const dbError = { code: '23505' };
      mockRepository.findOne.mockResolvedValue(mockCharacter);
      mockRepository.save.mockRejectedValue(dbError);

      await expect(service.update(mockCharacter.id, { name: 'Existing Name' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a character successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockCharacter);
      mockRepository.remove.mockResolvedValue(mockCharacter);

      await service.remove(mockCharacter.id);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: mockCharacter.id } });
      expect(repository.remove).toHaveBeenCalledWith(mockCharacter);
    });

    it('should throw NotFoundException when character not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('seed', () => {
    it('should seed characters when database is empty', async () => {
      const seedCharacters = Array(7).fill(mockCharacter);
      mockRepository.count.mockResolvedValue(0);
      mockRepository.create.mockReturnValue(seedCharacters);
      mockRepository.save.mockResolvedValue(seedCharacters);

      const result = await service.seed();

      expect(repository.count).toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(seedCharacters);
      expect(result).toEqual(seedCharacters);
    });

    it('should not seed when characters already exist', async () => {
      mockRepository.count.mockResolvedValue(5);

      const result = await service.seed();

      expect(repository.count).toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
}); 