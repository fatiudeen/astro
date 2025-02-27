import { faker } from '@faker-js/faker';
import { UserSex } from '@interfaces/User.Interface';

export const invalidEmail = faker.internet.email().toLowerCase();
export const invalidPassword = faker.internet.password(10);
export const invalidUserId = faker.database.mongodbObjectId().toString();

const password = faker.internet.password(10);

export const validUser = {
  email: faker.internet.email().toLowerCase(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  username: faker.internet.userName(),
  dob: faker.date.past().toISOString(),
  location: faker.address.cityName(),
  sex: faker.helpers.arrayElement(Object.values(UserSex)),
  phoneNumber: {
    countryCode: '+234',
    number: faker.phone.number('080########'),
  },
  profile: {
    about: faker.lorem.sentence(),
    league: faker.random.word(),
    frequency: faker.random.word(),
    betPerformance: faker.random.word(),
  },
  password, // at least 10 characters
  confirmPassword: password,
};

export const validUserUpdateData = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
};

export const validUser2 = {
  email: faker.internet.email().toLowerCase(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  username: faker.internet.userName(),
  dob: faker.date.past().toISOString(),
  sex: faker.helpers.arrayElement(Object.values(UserSex)),
  phoneNumber: {
    countryCode: '+234',
    number: faker.phone.number('080########'),
  },
  profile: {
    about: faker.lorem.sentence(),
    league: faker.random.word(),
    frequency: faker.random.word(),
    betPerformance: faker.random.word(),
  },
  password, // at least 10 characters
  confirmPassword: password,
};
