import "express-serve-static-core";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: "OWNER" | "VET" | "ADMIN";
      email: string;
    }
    interface Request {
      user?: User;
    }
  }
}

export {};
