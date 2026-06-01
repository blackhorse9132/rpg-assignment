import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MaxLength } from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @Field()
  @IsNotEmpty()
  @MaxLength(5000)
  body: string;
}
