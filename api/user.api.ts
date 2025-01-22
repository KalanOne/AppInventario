import { UserResponse, UserUpdate } from '@/types/usuario';
import { http } from './api';
import { UpdateApiFunctionParams } from '@/types/api';

export { getUser, updateUser };

async function getUser(): Promise<UserResponse> {
  return await http<UserResponse>({
    method: 'GET',
    path: `users/user`,
  });
}

async function updateUser(
  data: UpdateApiFunctionParams<UserUpdate>
): Promise<UserResponse> {
  return await http<UserResponse>({
    method: 'PATCH',
    path: `users/user/${data.id}`,
    data: data.data,
  });
}
