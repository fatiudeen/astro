export default {
  isSignUpData: {
    _id: expect.any(String),
    email: expect.any(String),
    role: expect.any(String),
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  },

  isLoginData: {
    user: {
      phoneNumber: {
        countryCode: expect.any(String),
        number: expect.any(String),
      },
      profile: {
        about: expect.any(String),
        league: expect.any(String),
        frequency: expect.any(String),
        betPerformance: expect.any(String),
      },
      _id: expect.any(String),
      email: expect.any(String),
      role: expect.any(String),
      firstName: expect.any(String),
      lastName: expect.any(String),
      username: expect.any(String),
      dob: expect.any(String),
      sex: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      __v: expect.any(Number),
      followers: expect.any(Number),
      following: expect.any(Number),
    },
    token: expect.any(String),
  },

  isUser: (data: any) => {
    expect(data).toEqual(
      expect.objectContaining({
        phoneNumber: {
          countryCode: expect.any(String),
          number: expect.any(Number),
        },
        profile: {
          about: expect.any(String),
          league: expect.any(String),
          frequency: expect.any(String),
          betPerformance: expect.any(String),
        },
        _id: expect.any(String),
        email: expect.any(String),
        role: expect.any(String),
        firstName: expect.any(String),
        lastName: expect.any(String),
        username: expect.any(String),
        dob: expect.any(Number),
        sex: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        __v: expect.any(Number),
        followers: expect.any(Number),
        following: expect.any(Number),
      }),
    );
  },
  isPartialUser: (data: string) => {
    expect(data).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        firstName: expect.any(String),
        lastName: expect.any(String),
        username: expect.any(String),
        avatar: {
          url: expect.any(String),
          type: expect.any(String),
          _id: expect.any(String),
        },
      }),
    );
  },
  isFollow: (data: string) => {
    expect(data).toEqual(
      expect.objectContaining({
        userId: expect.any(String),
        followed: expect.any(String),
        _id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        __v: expect.any(Number),
      }),
    );
  },

  createPost: (data: string) => {
    expect(data).toEqual(
      expect.objectContaining({
        userId: expect.any(String),
        // media: [
        //   {
        //     url: expect.any(String),
        //     type: expect.any(String),
        //     _id: expect.any(String),
        //   },
        // ],
        // sharedPost:  expect.any(String),
        content: expect.any(String),
        _id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        __v: expect.any(Number),
      }),
    );
  },

  isPost: (data: string) => {
    expect(data).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        media: [
          {
            url: expect.any(String),
            type: expect.any(String),
            _id: expect.any(String),
          },
        ],
        content: expect.any(String),
        bookmarks: expect.any(Number),
        liked: expect.any(Boolean),
        user: {
          _id: expect.any(String),
          username: expect.any(String),
          avatar: {
            url: expect.any(String),
            type: expect.any(String),
            _id: expect.any(String),
          },
          firstName: expect.any(String),
          lastName: expect.any(String),
        },
        likes: expect.any(Number),
        shared: expect.any(Number),
      }),
    );
  },

  isBookmarkedPost: (data: string) => {
    expect(data).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        userId: expect.any(String),
        postId: {
          _id: expect.any(String),
          media: [
            {
              url: expect.any(String),
              type: expect.any(String),
              _id: expect.any(String),
            },
          ],
          hideComment: expect.any(Boolean),
          content: expect.any(String),
          deleted: expect.any(Boolean),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          liked: expect.any(Boolean),
          user: {
            _id: expect.any(String),
            username: expect.any(String),
            avatar: {
              url: expect.any(String),
              type: expect.any(String),
              _id: expect.any(String),
            },
            firstName: expect.any(String),
            lastName: expect.any(String),
          },
          likes: expect.any(Number),
          comments: expect.any(Number),
          bookmarks: expect.any(Number),
          shared: expect.any(Number),
        },
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        __v: expect.any(Number),
      }),
    );
  },

  isBookmark: (data: string) => {
    expect(data).toEqual(
      expect.objectContaining({
        userId: expect.any(String),
        postId: expect.any(String),
        _id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        __v: expect.any(Number),
      }),
    );
  },

  toggleLikePost: (data: string) => {
    expect(data).toEqual(
      expect.objectContaining({
        userId: expect.any(String),
        postId: expect.any(String),
        _id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        __v: expect.any(Number),
      }),
    );
  },

  isUserFromLikes: (data: string) => {
    expect(data).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        userId: {
          _id: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
          username: expect.any(String),
          avatar: {
            url: expect.any(String),
            type: expect.any(String),
            _id: expect.any(String),
          },
        },
        postId: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        __v: expect.any(Number),
      }),
    );
  },

  toggleLikeComment: (data: string) => {
    expect(data).toEqual(
      expect.objectContaining({
        userId: expect.any(String),
        commentId: expect.any(String),
        _id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        __v: expect.any(Number),
      }),
    );
  },

  isComment: (data: string) => {
    expect(data).toEqual(
      expect.objectContaining({
        userId: expect.any(String),
        postId: expect.any(String),
        text: expect.any(String),
        _id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        __v: expect.any(Number),
      }),
    );
  },

  isReply: (data: string) => {
    expect(data).toEqual(
      expect.objectContaining({
        userId: expect.any(String),
        parentId: expect.any(String),
        text: expect.any(String),
        _id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        __v: expect.any(Number),
      }),
    );
  },

  isFullComment: (data: string) => {
    expect(data).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        postId: expect.any(String),
        text: expect.any(String),
        liked: expect.any(Boolean),
        user: {
          _id: expect.any(String),
          username: expect.any(String),
          avatar: {
            url: expect.any(String),
            type: expect.any(String),
            _id: expect.any(String),
          },
          firstName: expect.any(String),
          lastName: expect.any(String),
        },
        likes: expect.any(Number),
        replies: expect.any(Number),
      }),
    );
  },

  isFullReply: (data: string) => {
    expect(data).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        parentId: expect.any(String),
        text: expect.any(String),
        liked: expect.any(Boolean),
        user: {
          _id: expect.any(String),
          username: expect.any(String),
          avatar: {
            url: expect.any(String),
            type: expect.any(String),
            _id: expect.any(String),
          },
          firstName: expect.any(String),
          lastName: expect.any(String),
        },
        likes: expect.any(Number),
        replies: expect.any(Number),
      }),
    );
  },

  isThread: (data: string) => {
    expect(data).toEqual(
      expect.objectContaining({
        post: {
          _id: expect.any(String),
          content: expect.any(String),
          sharedPost: {
            _id: expect.any(String),
            media: [
              {
                url: expect.any(String),
                type: expect.any(String),
                _id: expect.any(String),
              },
            ],
            content: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            bookmarks: expect.any(Number),
            user: {
              _id: expect.any(String),
              username: expect.any(String),
              avatar: {
                url: expect.any(String),
                type: expect.any(String),
                _id: expect.any(String),
              },
              firstName: expect.any(String),
              lastName: expect.any(String),
            },
            likes: expect.any(Number),
            comments: expect.any(Number),
            shared: expect.any(Number),
          },
          media: expect.any(Array),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          user: {
            _id: expect.any(String),
            username: expect.any(String),
            avatar: {
              url: expect.any(String),
              type: expect.any(String),
              _id: expect.any(String),
            },
            firstName: expect.any(String),
            lastName: expect.any(String),
          },
          likes: expect.any(Number),
          comments: expect.any(Number),
          bookmarks: expect.any(Number),
          shared: expect.any(Number),
        },
        comments: [
          {
            _id: expect.any(String),
            postId: expect.any(String),
            text: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            user: {
              _id: expect.any(String),
              username: expect.any(String),
              avatar: {
                url: expect.any(String),
                type: expect.any(String),
                _id: expect.any(String),
              },
              firstName: expect.any(String),
              lastName: expect.any(String),
            },
            likes: expect.any(Number),
            replies: expect.any(Number),
          },
          {
            _id: expect.any(String),
            text: expect.any(String),
            parentId: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            user: {
              _id: expect.any(String),
              username: expect.any(String),
              avatar: {
                url: expect.any(String),
                type: expect.any(String),
                _id: expect.any(String),
              },
              firstName: expect.any(String),
              lastName: expect.any(String),
            },
            likes: expect.any(Number),
            replies: expect.any(Number),
          },
        ],
      }),
    );
  },
  isConversation: (data: string[]) => {
    expect(data).toEqual([
      expect.objectContaining({
        _id: expect.any(String),
        recipients: expect.arrayContaining([expect.any(String), expect.any(String)]),
        lastMessage: expect.any(String),
        alias: expect.any(String),
        aliasAvatar: expect.any(String),
        unreadMessages: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        __v: expect.any(Number),
      }),
    ]);
  },

  isCreateMessage: (data: string) => {
    expect(data).toEqual(
      expect.objectContaining({
        message: {
          conversationId: expect.any(String),
          to: expect.any(String),
          from: expect.any(String),
          message: expect.any(String),
          seen: expect.arrayContaining([expect.any(String)]),
          _id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          __v: expect.any(Number),
        },
        convo: {
          recipients: expect.arrayContaining([expect.any(String), expect.any(String)]),
          lastMessage: expect.any(String),
          alias: expect.any(String),
          aliasAvatar: expect.any(String),
          unreadMessages: expect.any(Number),
          _id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          __v: expect.any(Number),
        },
      }),
    );
  },

  isMessages: (data: string[]) => {
    expect(data).toEqual([
      expect.objectContaining({
        _id: expect.any(String),
        conversationId: expect.any(String),
        to: {
          _id: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
          username: expect.any(String),
          avatar: {
            url: expect.any(String),
            type: expect.any(String),
            _id: expect.any(String),
          },
        },
        from: {
          _id: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
          username: expect.any(String),
          avatar: {
            url: expect.any(String),
            type: expect.any(String),
            _id: expect.any(String),
          },
        },
        message: expect.any(String),
        seen: expect.arrayContaining([expect.any(String)]),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        __v: expect.any(Number),
      }),
    ]);
  },
};

// finish mock, reusavbel q,,, api
