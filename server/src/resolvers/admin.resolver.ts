import { Context } from 'src/types/context'
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql'
import { User } from '../entities/user.entity'
import authMiddleware from '../middelwares/auth.middleware'
import { UserResponse, Users } from '../types/response'
import { internalServerError } from '../utils/internalServerError'

@Resolver(_of => User)
export class AdminResolver {
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

	@Query(_return => Users)
	@UseMiddleware(authMiddleware.verifyToken, authMiddleware.isAdmin)
	async getUsers(@Arg('limit') limit: number, @Arg('page') page: number): Promise<Users> {
		try {
			const users = await User.find({
				take: limit,
				skip: (page - 1) * limit
			})

			return {
				users,
				nextPage: users.length > 0 ? page + 1 : page
			}
		} catch (err) {
			throw internalServerError(err)
		}
	}

	@Mutation(_return => UserResponse)
	@UseMiddleware(authMiddleware.verifyToken, authMiddleware.isAdmin)
	async grantAdminPermission(@Arg('userId') userId: string): Promise<UserResponse> {
		try {
			const existingUser = await User.findOneBy({ userId })

			if (!existingUser)
				return {
					code: 400,
					success: false,
					message: `User not found`
				}

			if (existingUser.isAdmin)
				return {
					code: 201,
					success: true,
					message: `User is a admin`
				}

			existingUser.isAdmin = true

			await existingUser.save()

			return {
				code: 200,
				success: true,
				message: `Set user is admin successfully`,
				user: existingUser
			}
		} catch (err) {
			throw internalServerError(err)
		}
	}

	@Mutation(_return => UserResponse)
	@UseMiddleware(authMiddleware.verifyToken, authMiddleware.isAdmin)
	async removeAdminPermission(@Arg('userId') userId: string, @Ctx() context: Context): Promise<UserResponse> {
		const { user } = context

		try {
			const existingUser = await User.findOneBy({ userId })

			if (!existingUser)
				return {
					code: 400,
					success: false,
					message: `User not found`
				}

			if (!existingUser.isAdmin)
				return {
					code: 400,
					success: false,
					message: `User is not admin`
				}

			existingUser.isAdmin = false

			await existingUser.save()

			return {
				code: 200,
				success: true,
				message: `Removered admin permission of ${existingUser.username}, by admin ${user?.username}`,
				user: existingUser
			}
		} catch (err) {
			throw internalServerError(err)
		}
	}

	@Mutation(_return => UserResponse)
	@UseMiddleware(authMiddleware.verifyToken, authMiddleware.isAdmin)
	async banUser(@Arg('userId') userId: string): Promise<UserResponse> {
		try {
			const existingUser = await User.findOneBy({ userId })

			if (!existingUser)
				return {
					code: 400,
					success: false,
					message: `User not found`
				}

			if (existingUser.isBan)
				return {
					code: 201,
					success: false,
					message: `User ${existingUser.username} was baned`
				}

			existingUser.isBan = true

			await existingUser.save()

			return {
				code: 200,
				success: false,
				message: `Ban user ${existingUser.username} successfully`
			}
		} catch (err) {
			throw internalServerError(err)
		}
	}

	@Mutation(_return => UserResponse)
	@UseMiddleware(authMiddleware.verifyToken, authMiddleware.isAdmin)
	async unbanUser(@Arg('userId') userId: string): Promise<UserResponse> {
		try {
			const existingUser = await User.findOneBy({ userId })

			if (!existingUser)
				return {
					code: 400,
					success: false,
					message: `User not found`
				}

			if (!existingUser.isBan)
				return {
					code: 201,
					success: false,
					message: `User ${existingUser.username} is not baned`
				}

			existingUser.isBan = false

			await existingUser.save()

			return {
				code: 200,
				success: false,
				message: `Unban user ${existingUser.username} successfully`
			}
		} catch (err) {
			throw internalServerError(err)
		}
	}
}
