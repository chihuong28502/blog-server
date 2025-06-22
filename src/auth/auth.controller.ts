import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response.decorator';
import { UserDocument } from '@/user/schemas/user.schema';
import { UsersService } from '@/user/user.service';
import { Body, Controller, Get, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginGoogleDto } from './dto/login-google.dto';
import { LoginResponse } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPassDto } from './dto/resetpass.dto';

@Controller('auth')
export class AuthController {
  // Cấu hình cookie mặc định
  private readonly COOKIE_CONFIG = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  } as const;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService

  ) { }

  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie('refreshToken', token, this.COOKIE_CONFIG);
  }

  @Public()
  @Post('login')
  @ResponseMessage('Đăng nhập thành công')

  async login(
    @Body() { email, password }: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }
    const { accessToken, refreshToken, user: userDetails } =
      await this.authService.login(user);

    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken, user: userDetails };
  }

  @Public()
  @Post('login-google')
  async loginGoogle(
    @Body() loginGoogleDto: LoginGoogleDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const { accessToken, refreshToken, user: userDetails } =
      await this.authService.loginGoogle(loginGoogleDto.token);
    this.setRefreshTokenCookie(res, refreshToken);
    return { accessToken, user: userDetails };
  }
  @Public()
  @Post('register')
  @ResponseMessage('Đăng ký tài khoản thành công')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<UserDocument> {
    return await this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  @ResponseMessage('Làm mới token successfully')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: any
  ): Promise<{ accessToken: string } | null> {
    const token = req.cookies?.refreshToken;
    const tokenNew = await this.authService.refreshToken(token, res);
    if (!tokenNew) {
      return null;
    }
    return tokenNew;
  }


  @Public()
  @Get('verify-account')
  @ResponseMessage('Xác thực tài khoản thành công')
  async activeAccountByEmail(@Query('token') token: string): Promise<{ success: boolean }> {
    const verifiedEmail = await this.authService.verifyToken(token);
    return await this.userService.activateAccount(verifiedEmail.email);
  }

  @Public()
  @Post('forget-password/send-email')
  @ResponseMessage('Đường dẫn đặt lại mật khẩu đã được gửi')
  async sendEmailForgetPassword(
    @Body('email') email: string
  ): Promise<any> {
    return this.authService.sendEmailForgetPassword(email);
  }

  @Public()
  @Post('send-email-verify-account')
  @ResponseMessage('Đường dẫn đặt lại mật khẩu đã được gửi')
  async sendEmailVerifyAccount(
    @Body('email') email: string
  ): Promise<any> {
    return this.authService.sendMailVerifyAccount(email);
  }

  @Public()
  @Post('forget-password/reset-password')
  @ResponseMessage('Đường dẫn đặt lại mật khẩu đã được gửi')
  async resetPasswordByEmail(
    @Body() resetPassDto: ResetPassDto
  ): Promise<any> {
    const verifiedEmail = await this.authService.verifyToken(resetPassDto.token);
    return this.authService.resetPassword(verifiedEmail.email, resetPassDto.password);
  }

  @Post('logout')
  @ResponseMessage('Đăng xuất thành công!')
  async logout(
    @Res({ passthrough: true }) res: any
  ): Promise<any> {
    return await this.authService.logout(res);
  }
}
