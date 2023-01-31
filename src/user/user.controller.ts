import { Controller, Get, UseGuards, Patch, Body } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guard';
import { GetUserProp } from '../auth/decorator';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(AccessTokenGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUserProp('id') userId: number) {
    return this.userService.getMe(userId);
  }

  @Patch()
  editUser(@GetUserProp('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
