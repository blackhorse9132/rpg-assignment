import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from '../post.entity';

@ObjectType()
export class BlogPublishedPayload {
  @Field(() => Post)
  post: Post;

  @Field()
  message: string;

  @Field()
  createdAt: Date;
}
