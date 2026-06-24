import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/models';
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@ApiTags('Persons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('families/:id/persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get()
  @ApiOperation({ summary: 'List all persons in family' })
  async list(@Param('id') familyId: string, @Query('search') search: string) {
    return this.personService.list(familyId, search);
  }

  @Post()
  @ApiOperation({ summary: 'Create new person profile' })
  async create(@Param('id') familyId: string, @Body() dto: CreatePersonDto) {
    return this.personService.create(familyId, dto);
  }

  @Get(':personId')
  @ApiOperation({ summary: 'Get person details and balance' })
  async getOne(@Param('id') familyId: string, @Param('personId') personId: string) {
    return this.personService.getOneWithBalance(familyId, personId);
  }

  @Put(':personId')
  @ApiOperation({ summary: 'Update person profile' })
  async update(@Param('personId') personId: string, @Body() dto: UpdatePersonDto) {
    return this.personService.update(personId, dto);
  }

  @Delete(':personId')
  @ApiOperation({ summary: 'Soft-delete person' })
  async delete(@Param('personId') personId: string) {
    return this.personService.softDelete(personId);
  }

  @Get(':personId/transactions')
  @ApiOperation({ summary: "Get person's transaction history" })
  async getTransactions(@Param('personId') personId: string) {
    return this.personService.getTransactions(personId);
  }
}
