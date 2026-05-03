import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { IncidentsService } from '../application/incidents.service';
import { AiSummaryDto } from './dto/ai-summary.dto';
import { AiSuggestDto } from './dto/ai-suggest.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { QueryIncidentsDto } from './dto/query-incidents.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';

@ApiTags('incidents')
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get global incident statistics' })
  @ApiResponse({ status: 200, description: 'Return counts for various statuses' })
  async getStats() {
    return this.incidentsService.getStats();
  }

  @Post('ai-suggest')
  @ApiOperation({ summary: 'Get AI suggestions for incident fields' })
  @ApiBody({ type: AiSuggestDto })
  @ApiResponse({
    status: 200,
    description: 'Return AI suggested severity and service',
  })
  async aiSuggest(@Body() body: AiSuggestDto) {
    return this.incidentsService.suggest(body.title, body.description);
  }

  @Post(':id/ai-summary')
  @ApiOperation({ summary: 'Generate or retrieve an AI summary for an incident' })
  @ApiBody({ type: AiSummaryDto })
  @ApiResponse({
    status: 200,
    description: 'Return persisted or newly generated AI summary',
  })
  async aiSummary(@Param('id') id: string, @Body() body: AiSummaryDto) {
    return this.incidentsService.summarize(id, body.regenerate ?? false);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new incident' })
  @ApiResponse({ status: 201, description: 'The incident has been successfully created' })
  async create(@Body() createIncidentDto: CreateIncidentDto) {
    return this.incidentsService.create(createIncidentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all incidents with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Return paginated incidents' })
  async findMany(@Query() query: QueryIncidentsDto) {
    return this.incidentsService.findMany(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get incident by ID' })
  @ApiResponse({ status: 200, description: 'Return single incident' })
  async findById(@Param('id') id: string) {
    return this.incidentsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update incident details' })
  @ApiResponse({ status: 200, description: 'The incident has been successfully updated' })
  async update(
    @Param('id') id: string,
    @Body() updateIncidentDto: UpdateIncidentDto,
  ) {
    return this.incidentsService.update(id, updateIncidentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an incident' })
  @ApiResponse({ status: 200, description: 'The incident has been successfully removed' })
  async remove(@Param('id') id: string) {
    return this.incidentsService.remove(id);
  }
}
