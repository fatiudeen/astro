(<any>global).expectation = {
  isSignUpData: (data: any) => {
    expect(data).toMatchObject({
      _id: expect.any(String),
      email: expect.any(String),
      role: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  },

  isLoginData: (data: any) => {
    expect(data).toMatchObject({
      user: {
        _id: expect.any(String),
        email: expect.any(String),
        role: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      token: expect.any(String),
    });
  },

  isUser: (data: any) => {
    expect(data).toMatchObject({
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
    });
  },
  isPartialUser: (data: string) => {
    expect(data).toMatchObject({
      _id: expect.any(String),
      firstName: expect.any(String),
      lastName: expect.any(String),
      username: expect.any(String),
      // avatar: {
      //   url: expect.any(String),
      //   type: expect.any(String),
      //   _id: expect.any(String),
      // },
    });
  },
};
