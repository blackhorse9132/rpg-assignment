import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { JwtPayload } from '../jwt.strategy';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload | undefined => {
    const gqlContext = GqlExecutionContext.create(context).getContext<{
      req?: { user?: JwtPayload };
    }>();
    return gqlContext.req?.user;
  },
);
