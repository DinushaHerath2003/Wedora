import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ContactMessage,
  ContactMessageStatus,
} from './entities/contact-message.entity';
import {
  CreateContactMessageDto,
  ReplyContactMessageDto,
} from './dto/contact-message.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(ContactMessage)
    private contactRepository: Repository<ContactMessage>,
  ) {}

  async create(dto: CreateContactMessageDto): Promise<ContactMessage> {
    const message = this.contactRepository.create(dto);
    return this.contactRepository.save(message);
  }

  async findAll(): Promise<ContactMessage[]> {
    return this.contactRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<ContactMessage> {
    const message = await this.contactRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('Contact message not found');
    }
    return message;
  }

  async markAsRead(id: number): Promise<ContactMessage> {
    const message = await this.findOne(id);
    if (message.status === ContactMessageStatus.NEW) {
      message.status = ContactMessageStatus.READ;
      return this.contactRepository.save(message);
    }
    return message;
  }

  async reply(
    id: number,
    dto: ReplyContactMessageDto,
  ): Promise<ContactMessage> {
    const message = await this.findOne(id);
    message.adminReply = dto.reply;
    message.status = ContactMessageStatus.REPLIED;
    message.repliedAt = new Date();
    return this.contactRepository.save(message);
  }

  async remove(id: number): Promise<void> {
    const message = await this.findOne(id);
    await this.contactRepository.remove(message);
  }

  async countUnread(): Promise<number> {
    return this.contactRepository.count({
      where: { status: ContactMessageStatus.NEW },
    });
  }
}
