import argon2 from 'argon2'
import { User } from '../entities/user.entity'
import validateMiddleware from '../middelwares/validate.middleware'
import { Context } from '../types/context'
import { LoginInput, RegisterInput } from '../types/input'
import { UserResponse } from '../types/response'
import { internalServerError } from '../utils/internalServerError'
import jwt from '../utils/jwt'
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql'
import { uid } from 'uid'
import authMiddleware from '../middelwares/auth.middleware'

@Resolver(_of => User)
export class UserResolver {
	@Query(_return => String)
	@UseMiddleware(authMiddleware.verifyToken)
	dummy(): string {
		return 'hello dummy'
	}

	@FieldResolver(_return => Number)
	age(@Root() user: User): number {
		const nowDate = new Date()
		const birthday = new Date(user.birthday)

		if (nowDate.getMonth() + 1 - (birthday.getMonth() + 1) < 0)
			return (user.age = nowDate.getFullYear() - birthday.getFullYear() - 1)
		else return (user.age = nowDate.getFullYear() - birthday.getFullYear())
	}

	@FieldResolver(_return => String)
	fullname(@Root() user: User) {
		return (user.fullname = user.firstname + ' ' + user.lastname)
	}

	@Mutation(_return => UserResponse)
	@UseMiddleware(validateMiddleware.validateRegisterInput, validateMiddleware.duplicatedUser)
	async register(@Arg('registerInput') registerInput: RegisterInput, @Ctx() context: Context): Promise<UserResponse> {
		const { username, email, password, firstname, lastname, birthday, gender } = registerInput

		try {
			const hashedPassword = await argon2.hash(password)

			const newUser = User.create({
				userId: uid(16),
				username,
				email,
				password: hashedPassword,
				firstname,
				lastname,
				birthday,
				gender,
				avatarUrl:
					gender === 'male'
						? 'https://res.cloudinary.com/dqnolve2q/image/upload/v1670640830/avatar/male-default_dq58cl.png'
						: 'https://res.cloudinary.com/dqnolve2q/image/upload/v1670640830/avatar/female-default_dg38qk.png'
			})

			await newUser.save()

			jwt.sendRefreshToken(newUser, context.res)

			return {
				code: 200,
				success: false,
				message: `User registration successfully`,
				accessToken: jwt.createAccessToken(newUser),
				user: newUser
			}
		} catch (err) {
			throw internalServerError(err)
		}
	}

	@Mutation(_return => UserResponse)
	@UseMiddleware(validateMiddleware.validateLoginInput, validateMiddleware.checkLogin)
	async login(@Arg('loginInput') _loginInput: LoginInput, @Ctx() { res, user }: Context): Promise<UserResponse> {
		try {
			if (user?.isBan)
				return {
					code: 400,
					success: false,
					message: `User has been banned`
				}

			jwt.sendRefreshToken(user as User, res)

			return {
				code: 200,
				success: true,
				message: `User loged in successfully`,
				user,
				accessToken: jwt.createAccessToken(user as User)
			}
		} catch (err) {
			throw internalServerError(err)
		}
	}

	@Mutation(_return => UserResponse)
	@UseMiddleware(authMiddleware.verifyToken)
	async logout(@Ctx() context: Context): Promise<UserResponse> {
		const { user } = context

		try {
			const existingUser = await User.findOneBy({ userId: user?.userId })

			if (!existingUser)
				return {
					code: 400,
					success: false,
					message: `user not found`
				}

			existingUser.tokenVersion += 1

			await existingUser.save()

			return {
				code: 200,
				success: true,
				message: `User loged out successfully`
			}
		} catch (err) {
			throw internalServerError(err)
		}
	}
}
