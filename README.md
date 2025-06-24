# Star Wars API

A RESTful API for managing Star Wars characters built with NestJS, TypeScript, and PostgreSQL.

## Features

- Full CRUD operations for Star Wars characters
- Pagination support
- Input validation
- Swagger API documentation
- Database seeding
- error handling

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Database setup**:
   - Install PostgreSQL
   - Create database: `starwars`
   - Set environment variables:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_USERNAME=postgres
     DB_PASSWORD=postgres
     DB_DATABASE=starwars
     ```

3. **Run the application**:
   ```bash
   npm run start:dev
   ```

4. **Seed the database** (optional):
   ```bash
   curl -X POST http://localhost:3000/characters/seed
   ```

## API Endpoints

- `GET /characters` - Get all characters (with pagination)
- `GET /characters/:id` - Get character by ID
- `GET /characters/name/:name` - Get character by name
- `POST /characters` - Create new character
- `PATCH /characters/:id` - Update character
- `DELETE /characters/:id` - Delete character
- `POST /characters/seed` - Seed database

## API Documentation

Visit `http://localhost:3000/api` for interactive Swagger documentation.

