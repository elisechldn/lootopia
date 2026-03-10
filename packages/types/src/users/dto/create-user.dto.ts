export class CreateUserDto {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  profilePicture?: string;
  country: string;
}
