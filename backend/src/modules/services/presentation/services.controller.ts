import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ServicesService } from '../application/services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { QueryServicesDto } from './dto/query-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get registered services' })
  @ApiResponse({ status: 200, description: 'Return registered services' })
  findMany(@Query() query: QueryServicesDto) {
    return this.servicesService.findMany(query.includeInactive);
  }

  @Post()
  @ApiOperation({ summary: 'Create a registered service' })
  @ApiResponse({ status: 201, description: 'The service has been created' })
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiResponse({ status: 200, description: 'Return single service' })
  findById(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a registered service' })
  @ApiResponse({ status: 200, description: 'The service has been updated' })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a registered service' })
  @ApiResponse({ status: 200, description: 'The service has been deactivated' })
  deactivate(@Param('id') id: string) {
    return this.servicesService.deactivate(id);
  }
}
