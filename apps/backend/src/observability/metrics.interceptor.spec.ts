import { Test, TestingModule } from '@nestjs/testing';
import { MetricsInterceptor } from './metrics.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { getToken } from '@willsoto/nestjs-prometheus';

describe('MetricsInterceptor', () => {
    let interceptor: MetricsInterceptor;
    let histogramMock: any;
    let counterMock: any;

    beforeEach(async () => {
        histogramMock = {
            labels: jest.fn().mockReturnThis(),
            observe: jest.fn(),
        };

        counterMock = {
            labels: jest.fn().mockReturnThis(),
            inc: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MetricsInterceptor,
                {
                    provide: getToken('http_request_duration_seconds'),
                    useValue: histogramMock,
                },
                {
                    provide: getToken('http_requests_total'),
                    useValue: counterMock,
                },
            ],
        }).compile();

        interceptor = module.get<MetricsInterceptor>(MetricsInterceptor);
    });

    it('should be defined', () => {
        expect(interceptor).toBeDefined();
    });

    it('should intercept request, measure duration and increment counter', (done) => {
        // Mock ExecutionContext
        const contextMock = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    method: 'GET',
                    route: { path: '/test' },
                }),
                getResponse: jest.fn().mockReturnValue({
                    statusCode: 200,
                }),
            }),
        } as unknown as ExecutionContext;

        // Mock CallHandler
        const nextMock: CallHandler = {
            handle: jest.fn().mockReturnValue(of('response')),
        };

        // Spy on Date.now to control duration
        const nowSpy = jest.spyOn(Date, 'now');
        nowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(1500); // 500ms diff

        interceptor.intercept(contextMock, nextMock).subscribe({
            next: () => {
                // Assertions
                expect(histogramMock.labels).toHaveBeenCalledWith(
                    'GET',
                    '/test',
                    '200',
                );
                expect(histogramMock.observe).toHaveBeenCalledWith(0.5); // (1500 - 1000) / 1000

                expect(counterMock.labels).toHaveBeenCalledWith('GET', '/test', '200');
                expect(counterMock.inc).toHaveBeenCalled();
                done();
            },
            error: (err) => done(err),
        });
    });

    it('should handle request without route object (fallback to url)', (done) => {
        // Mock ExecutionContext
        const contextMock = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    method: 'POST',
                    url: '/raw-url',
                    // route is undefined
                }),
                getResponse: jest.fn().mockReturnValue({
                    statusCode: 201,
                }),
            }),
        } as unknown as ExecutionContext;

        const nextMock: CallHandler = {
            handle: jest.fn().mockReturnValue(of('response')),
        };

        const nowSpy = jest.spyOn(Date, 'now');
        nowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(1100);

        interceptor.intercept(contextMock, nextMock).subscribe({
            next: () => {
                expect(histogramMock.labels).toHaveBeenCalledWith(
                    'POST',
                    '/raw-url',
                    '201',
                );
                expect(counterMock.labels).toHaveBeenCalledWith('POST', '/raw-url', '201');
                done();
            },
        });
    });
});
