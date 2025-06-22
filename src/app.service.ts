import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService{
  getHello(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-image: linear-gradient(to right top, #d16ba5, #c777b9, #ba83ca, #aa8fd8, #9a9ae1, #8aa7ec, #79b3f4, #69bff8, #52cffe, #41dfff, #46eefa, #5ffbf1);
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
          }
          h1 {
            font-size: 3rem;
            animation: fadeIn 2s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        </style>
      </head>
      <body>
        <h1>🚀 Welcome to My NestJS Backend by Chi Huong Developer! 🌟</h1>
      </body>
      </html>
    `;
  }
 
}
