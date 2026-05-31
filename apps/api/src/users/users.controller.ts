import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
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
    private readonly jwtService: JwtService,
    private readonly filesService: FilesService,
    private readonly storageService: StorageService,
  ) {}

  @Get('me')
  getMe(@Headers('authorization') authorization: string) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant ou invalide');
    }
    const token = authorization.slice(7);
    let payload: { sub: number };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
    return this.usersService.findMe(payload.sub);
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: TWO_MB },
    }),
  )
  async uploadAvatar(
    @Headers('authorization') authorization: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant ou invalide');
    }
    let payload: { sub: number };
    try {
      payload = this.jwtService.verify(authorization.slice(7));
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
    const current = await this.usersService.findOne(payload.sub);
    if (current.profilePicture) {
      const oldKey = this.storageService.keyFromPublicUrl(current.profilePicture);
      if (oldKey) await this.storageService.deleteObject(oldKey).catch(() => null);
    }
    const { url } = await this.filesService.upload(payload.sub, 'avatar', file);
    await this.usersService.update(payload.sub, { profilePicture: url });
    return { url };
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.usersService.findAll(
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
