import { IsString, IsArray, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Episode } from '../entities/character.entity';

export class CreateCharacterDto {
  @ApiProperty({ description: 'Character name', example: 'Luke Skywalker' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'Episodes the character appears in', 
    enum: Episode, 
    isArray: true,
    example: ['NEWHOPE', 'EMPIRE', 'JEDI']
  })
  @IsArray()
  @IsEnum(Episode, { each: true })
  episodes: Episode[];

  @ApiProperty({ description: 'Home planet', required: false, example: 'Tatooine' })
  @IsOptional()
  @IsString()
  planet?: string;

  @ApiProperty({ description: 'Character species', required: false, example: 'Human' })
  @IsOptional()
  @IsString()
  species?: string;

  @ApiProperty({ description: 'Character affiliation', required: false, example: 'Rebel Alliance' })
  @IsOptional()
  @IsString()
  affiliation?: string;
} 