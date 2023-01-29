import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserProp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();

    if (data) {
      return request.user[`${data}`];
    } else {
      return request.user;
    }
  },
);
