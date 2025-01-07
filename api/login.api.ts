import { http } from "@/api/api";
import { PostApiFunctionParams } from "@/types/api";

export { loginApi };
export type { LoginData, LoginResponse };

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
}

async function loginApi(
  data: PostApiFunctionParams<LoginData>
): Promise<LoginResponse> {
  return await http<LoginResponse>({
    method: "POST",
    path: `auth/login`,
    data: data.data,
  });
}
