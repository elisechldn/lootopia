import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateUserDto, UpdateUserDto } from '@repo/types';
import { UsersService } from './users.service';
import { FilesService } from '../storage/files/files.service';
import { StorageService } from '../storage/storage.service';

const TWO_MB = 2 * 1024 * 1024;

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly filesService: FilesService,
    private readonly storageService: StorageService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Request() req: { user: { sub: number } }) {
    return this.usersService.findMe(req.user.sub);
  }

  @Post('me/avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: TWO_MB },
    }),
  )
  async uploadAvatar(
    @Request() req: { user: { sub: number } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.sub;
    const current = await this.usersService.findOne(userId);
    if (current.profilePicture) {
      const oldKey = this.storageService.keyFromPublicUrl(
        current.profilePicture,
      );
      if (oldKey)
        await this.storageService.deleteObject(oldKey).catch(() => null);
    }
    const { url } = await this.filesService.upload(userId, 'avatar', file);
    await this.usersService.update(userId, { profilePicture: url });
    return { url };
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.usersService.findAll(
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Request() req: { user: { sub: number } },
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (req.user.sub !== +id) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que votre propre profil',
      );
    }
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Request() req: { user: { sub: number } }, @Param('id') id: string) {
    if (req.user.sub !== +id) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que votre propre compte',
      );
    }
    return this.usersService.remove(+id);
  }
}
