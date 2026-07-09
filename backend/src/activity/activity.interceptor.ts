import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UAParser } from 'ua-parser-js';
import * as crypto from 'crypto';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        if (request) {
            // Generate request-correlation ID
            request.correlationId =
                request.headers['x-correlation-id'] ||
                request.headers['x-request-id'] ||
                crypto.randomUUID();

            // Extract client IP address
            const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
            request.clientIp = Array.isArray(ip)
                ? ip[0]
                : (ip as string)?.split(',')[0].trim();

            // Extract and parse User-Agent
            const userAgent = request.headers['user-agent'] || '';
            request.clientUserAgent = userAgent;

            const parser = new UAParser(userAgent);
            const result = parser.getResult();

            request.clientBrowser = result.browser.name || 'Unknown';
            request.clientOS = result.os.name || 'Unknown';
            request.clientDevice = result.device.type || 'desktop';
        }
        return next.handle();
    }
}
