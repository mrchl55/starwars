import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum Episode {
  NEWHOPE = 'NEWHOPE',
  EMPIRE = 'EMPIRE',
  JEDI = 'JEDI',
  PHANTOM = 'PHANTOM',
  CLONES = 'CLONES',
  SITH = 'SITH',
  AWAKENS = 'AWAKENS',
  LAST_JEDI = 'LAST_JEDI',
  RISE_SKYWALKER = 'RISE_SKYWALKER'
}

@Entity('characters')
export class Character {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Character name' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Episodes the character appears in', enum: Episode, isArray: true })
  @Column('simple-array')
  episodes: Episode[];

  @ApiProperty({ description: 'Home planet', required: false })
  @Column({ nullable: true })
  planet?: string;

  @ApiProperty({ description: 'Character species', required: false })
  @Column({ nullable: true })
  species?: string;

  @ApiProperty({ description: 'Character affiliation', required: false })
  @Column({ nullable: true })
  affiliation?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
} 