export class PostResponseDto {
  _id: string;

  name: string;

  description?: string;

  content?: string;

  images?: string[];

  category: {
    _id: string;
    name: string;
    description?: string;
  };

  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  createdAt: Date;

  updatedAt: Date;
} 