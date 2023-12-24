import { PostInterface } from '@interfaces/Post.Interface';
import Post from '@models/Post';
import Repository from '@repositories/repository';

export default class PostRepository extends Repository<PostInterface> {
  protected model = Post;
}
