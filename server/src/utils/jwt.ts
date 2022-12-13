import { Response } from 'express'
import { Secret, sign } from 'jsonwebtoken'
import { TokenModel } from '../models/token.model'
import { User } from '../entities/user.entity'

const JWT = () => {
	const createAccessToken = async (user: User) => {
		const { userId, username, isAdmin } = user

		const token = sign(
			{
				userId,
				username,
				isAdmin
			},
			process.env.ACCESS_TOKEN_SECRET as Secret,
			{
				expiresIn: '1h'
			}
		)

		await TokenModel.findOneAndDelete({ userId })

		if (token)
			new TokenModel({
				userId,
				token
			}).save()

		return token
	}

	const sendRefreshToken = (user: User, res: Response) => {
		const { userId, username, isAdmin, tokenVersion } = user

		res.cookie(
			process.env.JWT_COOKIE_NAME as string,
			sign(
				{
					userId,
					username,
					isAdmin,
					tokenVersion
				},
				process.env.REFRESH_TOKEN_SECRET as Secret
			),
			{
				httpOnly: true,
				secure: true,
				sameSite: 'lax'
			}
		)
	}

	return { createAccessToken, sendRefreshToken }
}

export default JWT()
