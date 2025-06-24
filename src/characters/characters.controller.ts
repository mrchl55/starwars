import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import { Character } from './entities/character.entity';

@ApiTags('characters')
@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new character' })
  @ApiResponse({ status: 201, description: 'Character created successfully', type: Character })
  @ApiResponse({ status: 409, description: 'Character with this name already exists' })
  create(@Body() createCharacterDto: CreateCharacterDto): Promise<Character> {
    return this.charactersService.create(createCharacterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all characters with pagination' })
  @ApiResponse({ status: 200, description: 'Characters retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResponseDto<Character>> {
    return this.charactersService.findAll(paginationDto.page, paginationDto.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get character by ID' })
  @ApiResponse({ status: 200, description: 'Character found', type: Character })
  @ApiResponse({ status: 404, description: 'Character not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Character> {
    return this.charactersService.findOne(id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get character by name' })
  @ApiResponse({ status: 200, description: 'Character found', type: Character })
  @ApiResponse({ status: 404, description: 'Character not found' })
  findByName(@Param('name') name: string): Promise<Character> {
    return this.charactersService.findByName(name);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update character by ID' })
  @ApiResponse({ status: 200, description: 'Character updated successfully', type: Character })
  @ApiResponse({ status: 404, description: 'Character not found' })
  @ApiResponse({ status: 409, description: 'Character with this name already exists' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCharacterDto: UpdateCharacterDto): Promise<Character> {
    return this.charactersService.update(id, updateCharacterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete character by ID' })
  @ApiResponse({ status: 200, description: 'Character deleted successfully' })
  @ApiResponse({ status: 404, description: 'Character not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.charactersService.remove(id);
  }


} 