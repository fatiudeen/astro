// const googleapisMock: any = jest.createMockFromModule('googleapis');

export default jest.mock('googleapis', () => {
  const googleApisMock = {
    google: {
      // Mock implementation can include any desired behavior
      auth: {
        OAuth2: jest.fn().mockImplementation(() => ({
          generateAuthUrl: jest.fn(() => 'mocked-auth-url'),
          getToken: jest.fn(() => ({ tokens: { access_token: 'mocked-access-token' } })),
        })),
      },

      oauth2: {
        userinfo: {
          v2: {
            me: {
              get: jest.fn().mockResolvedValue({
                data: {
                  email: 'mocked-email@example.com',
                  id: 'mocked-user-id',
                  given_name: 'John',
                  family_name: 'Doe',
                  picture: 'mocked-avatar-url',
                },
              }),
            },
          },
        },
      },
    },
  };
  return googleApisMock;
});
