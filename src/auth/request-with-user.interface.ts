//// filepath: c:\Users\matyk\EVO-APP\SERVER\Evo-BACKEND\src\auth\request-with-user.interface.ts
import { Request } from 'express';

export interface JWTUserData {
  userId: number;
  username: string;
  // Přidejte další vlastnosti dle potřeby
}

export interface RequestWithUser extends Request {
  user: {
    sub: number;
    username: string;
  };
}
