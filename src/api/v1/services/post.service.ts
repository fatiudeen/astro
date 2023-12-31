import { PostInterface } from '@interfaces/Post.Interface';
import PostRepository from '@repositories/Post.repository';
import Service from '@services/service';

class PostService extends Service<PostInterface, PostRepository> {
  protected repository = new PostRepository();
}

export default PostService;
