"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const request = __importStar(require("supertest"));
const app_module_1 = require("../src/app.module");
describe('WFGTS API (e2e)', () => {
    let app;
    let accessToken;
    let refreshToken;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    describe('Auth Endpoints', () => {
        const testUser = {
            name: 'Integration Test User',
            email: `test-${Date.now()}@example.com`,
            password: 'TestPass123',
        };
        it('POST /api/v1/auth/register - should register user', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(testUser)
                .expect(201)
                .expect((res) => {
                expect(res.body.message).toContain('Registration successful');
                expect(res.body.userId).toBeDefined();
            });
        });
        it('POST /api/v1/auth/register - should reject duplicate email', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(testUser)
                .expect(409);
        });
        it('POST /api/v1/auth/register - should validate password strength', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({ name: 'Weak', email: 'weak@test.com', password: 'short' })
                .expect(400);
        });
        it('POST /api/v1/auth/login - should reject unverified user', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({ email: testUser.email, password: testUser.password })
                .expect(401);
        });
        it('POST /api/v1/auth/forgot-password - should not leak email existence', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/forgot-password')
                .send({ email: 'nonexistent@example.com' })
                .expect(200)
                .expect((res) => {
                expect(res.body.message).toContain('If the email exists');
            });
        });
    });
    describe('Protected Endpoints', () => {
        it('GET /api/v1/users/me - should reject without token', () => {
            return request(app.getHttpServer())
                .get('/api/v1/users/me')
                .expect(401);
        });
        it('GET /api/v1/families - should reject without token', () => {
            return request(app.getHttpServer())
                .get('/api/v1/families')
                .expect(401);
        });
    });
    describe('Validation', () => {
        it('POST /api/v1/auth/register - should reject missing fields', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({})
                .expect(400);
        });
        it('POST /api/v1/auth/register - should reject invalid email', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({ name: 'Test', email: 'not-an-email', password: 'Password1' })
                .expect(400);
        });
    });
});
//# sourceMappingURL=app.e2e-spec.js.map