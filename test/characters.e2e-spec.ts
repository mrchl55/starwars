import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Character, Episode } from '../src/characters/entities/character.entity';

describe('Characters (e2e)', () => {
  let app: INestApplication;
  let createdCharacterId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'postgres',
          database: 'starwars_test',
          entities: [Character],
          synchronize: true,
          dropSchema: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/characters (POST)', () => {
    const validCharacter = {
      name: 'Test Jedi',
      episodes: ['NEWHOPE', 'EMPIRE'],
      planet: 'Coruscant',
      species: 'Human',
      affiliation: 'Jedi Order',
    };

    it('should create a character', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send(validCharacter)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(validCharacter.name);
          expect(res.body.episodes).toEqual(validCharacter.episodes);
          expect(res.body.planet).toBe(validCharacter.planet);
          createdCharacterId = res.body.id;
        });
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({ name: '', episodes: [] })
        .expect(400);
    });

    it('should fail with invalid episode', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send({
          name: 'Invalid Character',
          episodes: ['INVALID_EPISODE'],
        })
        .expect(400);
    });

    it('should fail when creating duplicate name', () => {
      return request(app.getHttpServer())
        .post('/characters')
        .send(validCharacter)
        .expect(409);
    });
  });

  describe('/characters (GET)', () => {
    it('should get all characters with pagination', () => {
      return request(app.getHttpServer())
        .get('/characters')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(res.body).toHaveProperty('totalPages');
          expect(res.body).toHaveProperty('hasNext');
          expect(res.body).toHaveProperty('hasPrev');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should get characters with custom pagination', () => {
      return request(app.getHttpServer())
        .get('/characters?page=1&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(5);
        });
    });

    it('should validate pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/characters?page=0&limit=101')
        .expect(400);
    });
  });

  describe('/characters/:id (GET)', () => {
    it('should get character by id', () => {
      return request(app.getHttpServer())
        .get(`/characters/${createdCharacterId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdCharacterId);
          expect(res.body.name).toBe('Test Jedi');
        });
    });

    it('should return 404 for non-existent character', () => {
      return request(app.getHttpServer())
        .get('/characters/123e4567-e89b-12d3-a456-426614174000')
        .expect(404);
    });

    it('should return 400 for invalid UUID', () => {
      return request(app.getHttpServer())
        .get('/characters/invalid-uuid')
        .expect(400);
    });
  });

  describe('/characters/name/:name (GET)', () => {
    it('should get character by name', () => {
      return request(app.getHttpServer())
        .get('/characters/name/Test Jedi')
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Test Jedi');
        });
    });

    it('should return 404 for non-existent character name', () => {
      return request(app.getHttpServer())
        .get('/characters/name/Non Existent Character')
        .expect(404);
    });
  });

  describe('/characters/:id (PATCH)', () => {
    it('should update character', () => {
      const updateData = {
        planet: 'Tatooine',
        affiliation: 'Rebel Alliance',
      };

      return request(app.getHttpServer())
        .patch(`/characters/${createdCharacterId}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.planet).toBe(updateData.planet);
          expect(res.body.affiliation).toBe(updateData.affiliation);
          expect(res.body.name).toBe('Test Jedi');
        });
    });

    it('should return 404 for non-existent character', () => {
      return request(app.getHttpServer())
        .patch('/characters/123e4567-e89b-12d3-a456-426614174000')
        .send({ planet: 'Mars' })
        .expect(404);
    });

    it('should validate update data', () => {
      return request(app.getHttpServer())
        .patch(`/characters/${createdCharacterId}`)
        .send({ episodes: ['INVALID_EPISODE'] })
        .expect(400);
    });
  });

  describe('/characters/seed (POST)', () => {
    it('should seed database with initial characters', () => {
      return request(app.getHttpServer())
        .post('/characters/seed')
        .expect(201)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should not seed when characters already exist', () => {
      return request(app.getHttpServer())
        .post('/characters/seed')
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual([]);
        });
    });
  });

  describe('/characters/:id (DELETE)', () => {
    it('should delete character', () => {
      return request(app.getHttpServer())
        .delete(`/characters/${createdCharacterId}`)
        .expect(200);
    });

    it('should return 404 when trying to delete non-existent character', () => {
      return request(app.getHttpServer())
        .delete(`/characters/${createdCharacterId}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID', () => {
      return request(app.getHttpServer())
        .delete('/characters/invalid-uuid')
        .expect(400);
    });
  });
}); 