import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const review = this.reviewRepository.create({
      userId: createReviewDto.userId,
      offeringId: createReviewDto.offeringId,
      vendorId: createReviewDto.vendorId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
    });
    return this.reviewRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return this.reviewRepository.find({ relations: ['user', 'offering', 'vendor'] });
  }

  async findByOffering(offeringId: number): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { offeringId },
      relations: ['user', 'offering', 'vendor'],
    });
  }

  async findByVendor(vendorId: number): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { vendorId },
      relations: ['user', 'offering'],
    });
  }

  async findOne(id: number): Promise<Review | null> {
    return this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'offering', 'vendor'],
    });
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review | null> {
    await this.reviewRepository.update(id, updateReviewDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.reviewRepository.delete(id);
  }
}
