import { Session } from './Session';

export type AuthResponse = {
  userSessionPayload: Session;
  sessionToken: string;
};
