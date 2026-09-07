export type Session = {
  user: {
    id: string;
    email: string;
    name: string;
    status: string;
    role: {
      id: string;
      name: string;
    };
  };
};
