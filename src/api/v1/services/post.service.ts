/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import HttpError from '@helpers/HttpError';
import { IMedia } from '@interfaces/Common.Interface';
import { PostInterface } from '@interfaces/Post.Interface';
import PostRepository from '@repositories/Post.repository';
import Service from '@services/service';
// import UserService from '@services/user.service';
import FollowService from '@services/follow.service';
// import LikeService from '@services/like.service';
// import CommentService from '@services/comment.service';

class PostService extends Service<PostInterface, PostRepository> {
  protected repository = new PostRepository();
  // private readonly _userService = Service.instance(UserService);
  private readonly _followService = Service.instance(FollowService);
  // private readonly _likeService = Service.instance(LikeService);
  // private readonly _commentService = Service.instance(CommentService);

  delete(query: string | Partial<PostInterface>) {
    return this.repository.update(query, { deleted: true });
  }

  share(data: { sharedPost: string; media: IMedia; userId: string }) {
    return new Promise<DocType<PostInterface>>((resolve, reject) => {
      this.findOne(data.sharedPost)
        .then((post) => {
          if (!post) reject(new HttpError('invalid post', 404));
          return this.create(data);
        })
        .then((post) => {
          resolve(post!);
        })
        .catch((error) => reject(error));
    });
  }

  sortUserByInfluence = async (users: string[]) => {
    const influenceMap: Record<string, number> = {};
    for await (const user of users) {
      const [likesCount, commentCount, sharedCount] = await Promise.all([
        this.repository.countUserLikes(user),
        this.repository.countUserComments(user),
        this.repository.countUserSharedPosts(user),
      ]);

      const influence = 1 * likesCount + 1 * commentCount + 1 * sharedCount;
      influenceMap[user] = influence;
    }
    return users.sort((a, b) => influenceMap[b] - influenceMap[a]);
  };

  calculateRelevanceScore = (post: DocType<PostInterface>) => {
    // const [likes, comments, shared] = await Promise.all([
    //   this._likeService().count({ postId: post._id }),
    //   this._commentService().count({ postId: post._id }),
    //   this.count({ sharedPost: post._id }),
    // ]);

    const { likes, comments, shared } = post;
    const timeDecay = Math.exp(-((Date.now() - new Date(post.createdAt).getTime()) / (24 * 60 * 60 * 1000))); // 1-day time decay
    const engagementScore = 1 * likes + 1 * comments + 1 * shared; // Adjust weights as needed
    return timeDecay * engagementScore;
  };

  sortPosts = (posts: DocType<PostInterface>[]) => {
    return posts.sort((a, b) => this.calculateRelevanceScore(b) - this.calculateRelevanceScore(a));
  };

  feeds(userId: string, startIndex: number, limit: number) {
    return new Promise<{ feeds: DocType<PostInterface>[]; count: number }>((resolve, reject) => {
      this._followService()
        .getFollowedUsers(userId)
        .then((users) => {
          return this.sortUserByInfluence(users);
        })
        .then((users) => {
          return Promise.all([
            this.repository.getInfluentialFollowedUsersPosts(userId, users, startIndex, limit),
            this.repository.countPosts(users),
          ]);
        })
        .then(([posts, count]) => {
          const feeds = this.sortPosts(posts);
          resolve({ feeds, count });
        })
        .catch((error) => reject(error));
    });
  }

  findOneWithAllData(query: string | Partial<PostInterface>) {
    return this.repository.findOneWithAllData(query);
  }
}

export default PostService;
