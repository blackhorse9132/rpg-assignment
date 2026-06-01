import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthPayload } from './models/auth-payload.model';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/user.entity';
import type { JwtPayload } from './jwt.strategy';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    return this.authService.register(input.email, input.password);
  }

  @Mutation(() => AuthPayload)
  login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input.email, input.password);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { nullable: true })
  me(@CurrentUser() user: JwtPayload): Promise<User | null> {
    return this.authService.me(user.sub);
  }
}
