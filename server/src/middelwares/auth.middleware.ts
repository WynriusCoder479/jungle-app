import { decode, Secret, verify } from 'jsonwebtoken'
import { Context } from '../types/context'
import { UserAuthPayload } from '../types/userAuthPayload'
import { internalServerError } from '../utils/internalServerError'
import { MiddlewareFn, NextFn } from 'type-graphql'
import { User } from '../entities/user.entity'
import jwt from '../utils/jwt'
import { TokenModel } from '../models/token.model'

const AuthMiddleware = () => {
	const verifyToken: MiddlewareFn<Context> = async ({ context }, next: NextFn) => {
		const { req, res } = context

		const accessToken = req.header('Authorization')?.split(' ')[1]

		try {
			const decodeToken = decode(accessToken as string) as UserAuthPayload

			if (Date.now() >= (decodeToken.exp as number) * 1000) {
				const refreshToken = req.cookies[process.env.JWT_COOKIE_NAME as string]

				if (!refreshToken) return `Not authenticated to perform GraphQL operations`

				const token = await TokenModel.findOne({ token: refreshToken })

				if (!token) return `Invalid token`

				const verifyRefreshToken = verify(refreshToken as string, process.env.REFRESH_TOKEN_SECRET as Secret) as UserAuthPayload

				const existingUser = await User.findOneBy({ userId: verifyRefreshToken.userId })

				if (!existingUser) return `User not found, token is invalid`

				jwt.sendRefreshToken(existingUser, res)

				context.userId = existingUser.userId

				return next()
			} else {
				const verifyAccessToken = verify(accessToken as string, process.env.ACCESS_TOKEN_SECRET as Secret) as UserAuthPayload

				const token = await TokenModel.findOne({ token: accessToken })

				if (!token) return `Invalid token`

				const existingUser = await User.findOneBy({ userId: verifyAccessToken.userId })

				if (!existingUser) return `User not found, token is invalid`

				context.userId = existingUser.userId

				return next()
			}
		} catch (err) {
			throw internalServerError(err)
		}
	}

	return { verifyToken }
}

export default AuthMiddleware()
