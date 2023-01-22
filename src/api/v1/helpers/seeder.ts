import { SEEDER_EMAIL, SEEDER_PASSWORD } from '@config';
import { UserInterface } from '@interfaces/User.Interface';
import authService from '@services/auth.service';

export default async () => {
  const defaultEmail = <string>SEEDER_EMAIL;
  const defaultPassword = <string>SEEDER_PASSWORD;

  try {
    const admin = await authService
      .findOne({
        email: defaultEmail,
      })
      .select('+password');

    if (!admin) {
      await authService.create(<UserInterface>{
        email: defaultEmail,
        password: defaultPassword,
        role: 'admin',
      });
    } else {
      admin.password = defaultPassword;
      await admin.save();
    }
  } catch (error: any) {
    throw new Error(error);
  }
};
