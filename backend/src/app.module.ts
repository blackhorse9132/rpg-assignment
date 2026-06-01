import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { HelloWorldResolver } from './hello-world/hello-world.resolver';
import { HelloWorldService } from './hello-world/hello-world.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Post } from './posts/post.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH ?? './data/app.sqlite',
      entities: [User, Post],
      synchronize: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      subscriptions: {
        'graphql-ws': true,
      },
      context: (context: unknown) => {
        if (
          typeof context === 'object' &&
          context !== null &&
          'req' in context &&
          typeof (context as { req?: unknown }).req === 'object'
        ) {
          return { req: (context as { req: Record<string, unknown> }).req };
        }

        const connectionParams =
          typeof context === 'object' &&
          context !== null &&
          'connectionParams' in context
            ? (context as { connectionParams?: Record<string, unknown> })
                .connectionParams
            : undefined;

        return {
          req: {
            headers: connectionParams ?? {},
          },
        };
      },
    }),
    UsersModule,
    AuthModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService, HelloWorldResolver, HelloWorldService],
})
export class AppModule {}
