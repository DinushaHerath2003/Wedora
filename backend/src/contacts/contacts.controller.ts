import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactMessageDto } from './dto/contact-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedRequestUser } from '../common/auth/jwt-payload.type';

type AuthenticatedRequest = Request & {
  user: AuthenticatedRequestUser;
};

@Controller('contact')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@Body() dto: CreateContactMessageDto) {
    return this.contactsService.create(dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMyMessages(@Req() req: AuthenticatedRequest) {
    return this.contactsService.findByEmail(req.user.email);
  }
}
