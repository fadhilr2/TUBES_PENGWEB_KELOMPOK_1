import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthRequest, Roles } from '../auth/access';
import { CatalogQuery, DeleteAccountDto, PageQuery, ProfileDto, ProviderDto } from '../common/dto';
import { ServicesService } from '../services/services.service';
import { UsersService } from './users.service';

@ApiTags('My account')
@Controller('users/me')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly services: ServicesService,
  ) {}
  @Patch() profile(@Body() body: ProfileDto, @Req() request: AuthRequest) {
    return this.users.profile(request.user.id, body);
  }
  @Roles('pencari') @Post('provider') @HttpCode(200) provider(
    @Body() body: ProviderDto,
    @Req() request: AuthRequest,
  ) {
    return this.users.provider(request.user.id, body);
  }
  @Roles('pencari', 'penyedia') @Delete() @HttpCode(204) remove(
    @Body() body: DeleteAccountDto,
    @Req() request: AuthRequest,
  ) {
    return this.users.remove(request.user.id, request.user.id);
  }
  @Roles('penyedia') @Get('services') servicesList(
    @Query() query: CatalogQuery,
    @Req() request: AuthRequest,
  ) {
    return this.services.list(query, request.user.id);
  }
  @Roles('penyedia') @Get('services/:id') detail(
    @Param('id') id: string,
    @Req() request: AuthRequest,
  ) {
    return this.services.detail(id, request.user.id);
  }
  @Roles('pencari', 'penyedia') @Get('favorites') favorites(
    @Query() query: PageQuery,
    @Req() request: AuthRequest,
  ) {
    return this.services.favorites(request.user.id, query);
  }
  @Roles('pencari', 'penyedia') @Put('favorites/:id') favorite(
    @Param('id') id: string,
    @Req() request: AuthRequest,
  ) {
    return this.services.favorite(request.user.id, id, true);
  }
  @Roles('pencari', 'penyedia') @Delete('favorites/:id') @HttpCode(204) unfavorite(
    @Param('id') id: string,
    @Req() request: AuthRequest,
  ) {
    return this.services.favorite(request.user.id, id, false);
  }
  @Roles('pencari', 'penyedia') @Get('recent') recent(@Req() request: AuthRequest) {
    return this.services.recent(request.user.id);
  }
  @Roles('pencari', 'penyedia') @Post('recent/:id') @HttpCode(200) view(
    @Param('id') id: string,
    @Req() request: AuthRequest,
  ) {
    return this.services.view(request.user.id, id);
  }
}
