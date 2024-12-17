import { PASSWORD_REGEX } from '../../helpers/contants';
import { z } from 'zod';

export const zodPasswordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(PASSWORD_REGEX, 'Password does not meet complexity requirements');

export const RegisterUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: zodPasswordValidation,
});

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
}

export type RegisterUserBody = z.infer<typeof RegisterUserBodySchema>;
