import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PubSub } from 'graphql-subscriptions';
import { Post } from './post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { User } from '../users/user.entity';
import { BlogPublishedPayload } from './models/blog-published-payload.model';

export const BLOG_PUBLISHED_EVENT = 'blogPublished';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly pubSub: PubSub,
  ) {}

  getPosts(): Promise<Post[]> {
    return this.postsRepository.find({
      relations: { author: true },
      order: { createdAt: 'DESC' },
    });
  }

  getPost(id: string): Promise<Post | null> {
    return this.postsRepository.findOne({
      where: { id },
      relations: { author: true },
    });
  }

  getMyPosts(authorId: string): Promise<Post[]> {
    return this.postsRepository.find({
      where: { authorId },
      relations: { author: true },
      order: { createdAt: 'DESC' },
    });
  }

  async createPost(input: CreatePostInput, author: User): Promise<Post> {
    const post = this.postsRepository.create({
      title: input.title,
      body: input.body,
      authorId: author.id,
    });
    const savedPost = await this.postsRepository.save(post);
    const hydratedPost = await this.getPost(savedPost.id);
    if (!hydratedPost) {
      return savedPost;
    }

    const payload: BlogPublishedPayload = {
      post: hydratedPost,
      message: `${author.email} published a new blog`,
      createdAt: new Date(),
    };
    await this.pubSub.publish(BLOG_PUBLISHED_EVENT, { blogPublished: payload });
    return hydratedPost;
  }

  async deletePost(id: string, author: User): Promise<boolean> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.author.id !== author.id) {
      throw new Error('You can only delete your own posts');
    }

    await this.postsRepository.remove(post);
    return true;
  }
}
