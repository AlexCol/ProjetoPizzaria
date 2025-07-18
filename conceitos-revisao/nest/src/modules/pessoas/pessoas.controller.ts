import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PessoasService } from './pessoas.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { IsPublic } from 'src/guards/isPublic';

@IsPublic()
@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) { }

  @Post()
  create(@Body() createPessoaDto: CreatePessoaDto) {
    console.log('PessoasController.create chamado com:', createPessoaDto);
    return this.pessoasService.create(createPessoaDto);
  }

  @Get()
  findAll() {
    return this.pessoasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    console.log(typeof id, id);
    return this.pessoasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updatePessoaDto: UpdatePessoaDto) {
    return this.pessoasService.update(id, updatePessoaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.pessoasService.remove(id);
  }
}
