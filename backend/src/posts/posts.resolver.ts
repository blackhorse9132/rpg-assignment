import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { PostsService, BLOG_PUBLISHED_EVENT } from './posts.service';
import { Post } from './post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { UsersService } from '../users/users.service';
import { BlogPublishedPayload } from './models/blog-published-payload.model';

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
    private readonly pubSub: PubSub,
  ) {}

  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return this.postsService.getPosts();
  }

  @Query(() => Post, { nullable: true })
  post(@Args('id') id: string): Promise<Post | null> {
    return this.postsService.getPost(id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Post])
  myPosts(@CurrentUser() user: JwtPayload): Promise<Post[]> {
    return this.postsService.getMyPosts(user.sub);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Post)
  async createPost(
    @Args('input') input: CreatePostInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<Post> {
    const author = await this.usersService.findById(user.sub);
    if (!author) {
      throw new Error('Author not found');
    }
    return this.postsService.createPost(input, author);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deletePost(
    @Args('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Boolean> {
    const author = await this.usersService.findById(user.sub);
    if (!author) {
      throw new Error('Author not found');
    }
    return this.postsService.deletePost(id, author);
  }

  @Subscription(() => BlogPublishedPayload, {
    resolve: (payload: { blogPublished: BlogPublishedPayload }) =>
      payload.blogPublished,
  })
  blogPublished() {
    return this.pubSub.asyncIterableIterator(BLOG_PUBLISHED_EVENT);
  }
}
