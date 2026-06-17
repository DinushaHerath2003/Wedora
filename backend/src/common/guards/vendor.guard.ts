import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '../constants';
import { AuthenticatedRequestUser } from '../auth/jwt-payload.type';

type RequestWithUser = {
  user?: AuthenticatedRequestUser;
};

@Injectable()
export class VendorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (request.user?.role !== UserRole.VENDOR) {
      throw new ForbiddenException('Vendor access required');
    }

    return true;
  }
}
