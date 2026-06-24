import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { RelationService } from './relation.service';
import { CreateRelationDto } from './dto/create-relation.dto';
import { UpdateRelationDto } from './dto/update-relation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('relations')
@UseGuards(JwtAuthGuard)
export class RelationController {
  constructor(private readonly relationService: RelationService) {}

  @Post()
  create(@Body() createDto: CreateRelationDto) {
    return this.relationService.create(createDto);
  }

  @Get()
  findAll() {
    return this.relationService.findAll();
  }

  @Get(':rId')
  findOne(@Param('rId') id: string) {
    return this.relationService.findOne(id);
  }

  @Put(':rId')
  update(@Param('rId') id: string, @Body() updateDto: UpdateRelationDto) {
    return this.relationService.update(id, updateDto);
  }

  @Delete(':rId')
  remove(@Param('rId') id: string) {
    return this.relationService.remove(id);
  }
}
