import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { Post } from './post.entity';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), UsersModule],
  providers: [
    PostsResolver,
    PostsService,
    {
      provide: PubSub,
      useValue: new PubSub(),
    },
  ],
})
export class PostsModule {}
