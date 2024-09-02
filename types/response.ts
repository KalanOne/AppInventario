export type { MessageResponse };

interface MessageResponse<T = any> {
  message: string;
  data?: T;
}
