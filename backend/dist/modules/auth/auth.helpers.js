"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.toPublicUser = toPublicUser;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
function generateAccessToken(userId, role) {
    return jsonwebtoken_1.default.sign({ role }, env_1.env.JWT_SECRET, {
        subject: userId,
        expiresIn: env_1.env.JWT_EXPIRES_IN,
        //issuer: env.JWT_ISSUER,
        //audience: env.JWT_AUDIENCE,
    });
}
function toPublicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
//export function ensureUserCanLogin(status: UserStatus) {
//  if (status === UserStatus.BLOCKED) {
//    throw new AppError('User is blocked', 403, //'USER_BLOCKED');
//  }
//
//  if (status === UserStatus.INACTIVE) {
//    throw new AppError('User is inactive', 403, //'USER_INACTIVE');
//  }
//}
