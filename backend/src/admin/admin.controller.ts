import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../common/guards/admin.guard';
import { AdminService } from './admin.service';
import { ContactsService } from '../contacts/contacts.service';
import { AdminUpdateUserDto, AdminUpdateVendorDto } from './dto/admin.dto';
import { ReplyContactMessageDto } from '../contacts/dto/contact-message.dto';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly contactsService: ContactsService,
  ) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Get('users/:id')
  findUser(@Param('id') id: string) {
    return this.adminService.findUser(id);
  }

  @Put('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  removeUser(@Param('id') id: string) {
    return this.adminService.removeUser(id);
  }

  @Get('vendors')
  findAllVendors() {
    return this.adminService.findAllVendors();
  }

  @Get('vendors/:id')
  findVendor(@Param('id') id: string) {
    return this.adminService.findVendor(Number(id));
  }

  @Put('vendors/:id')
  updateVendor(@Param('id') id: string, @Body() dto: AdminUpdateVendorDto) {
    return this.adminService.updateVendor(Number(id), dto);
  }

  @Delete('vendors/:id')
  removeVendor(@Param('id') id: string) {
    return this.adminService.removeVendor(Number(id));
  }

  @Get('messages')
  findAllMessages() {
    return this.contactsService.findAll();
  }

  @Get('messages/:id')
  findMessage(@Param('id') id: string) {
    return this.contactsService.findOne(Number(id));
  }

  @Patch('messages/:id/read')
  markMessageRead(@Param('id') id: string) {
    return this.contactsService.markAsRead(Number(id));
  }

  @Patch('messages/:id/reply')
  replyToMessage(
    @Param('id') id: string,
    @Body() dto: ReplyContactMessageDto,
  ) {
    return this.contactsService.reply(Number(id), dto);
  }

  @Delete('messages/:id')
  removeMessage(@Param('id') id: string) {
    return this.contactsService.remove(Number(id));
  }
}
