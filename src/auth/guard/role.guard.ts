import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserWithRole } from 'src/user/user.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const role = this.reflector.get<string[]>('role', context.getClass());
    if (!role) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: UserWithRole = request.user;

    return user.role.some((userRole) => role.includes(userRole.name));
  }
}
