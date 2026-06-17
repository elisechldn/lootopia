import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'L\'adresse email est requise').email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

const registerBaseSchema = z.object({
  firstname: z.string().min(1, 'Le prénom est requis'),
  lastname: z.string().min(1, 'Le nom est requis'),
  email: z.string().min(1, 'L\'adresse email est requise').email('Adresse email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
});

const passwordsMatch = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword;

const passwordsMismatchMessage = {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'] as [string],
};

export const registerPlayerSchema = registerBaseSchema.refine(
  passwordsMatch,
  passwordsMismatchMessage,
);

export type RegisterPlayerFormData = z.infer<typeof registerBaseSchema> & {
  confirmPassword: string;
};

export const registerPartnerSchema = registerBaseSchema
  .extend({
    username: z
      .string()
      .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
    country: z.string().default('FR'),
    terms: z.boolean().refine((v) => v, {
      message: 'Vous devez accepter les conditions générales',
    }),
  })
  .refine(passwordsMatch, passwordsMismatchMessage);

export type RegisterPartnerFormData = z.infer<
  ReturnType<typeof registerBaseSchema.extend>
> & {
  username: string;
  country: string;
  terms: boolean;
  confirmPassword: string;
};
