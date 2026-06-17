import { Body, Controller, Post } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactMessageDto } from './dto/contact-message.dto';

@Controller('contact')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@Body() dto: CreateContactMessageDto) {
    return this.contactsService.create(dto);
  }
}
