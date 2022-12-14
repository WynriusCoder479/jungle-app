import { Arg, Ctx, FieldResolver, Mutation, Query, registerEnumType, Resolver, Root, UseMiddleware } from 'type-graphql'
import { User } from '../entities/user.entity'
import authMiddleware from '../middelwares/auth.middleware'
import { Context } from '../types/context'
import { BanOrUnban } from '../types/enum'
import { UserResponse, Users } from '../types/response'
import { internalServerError } from '../utils/internalServerError'

registerEnumType(BanOrUnban, {
	name: 'BanOrUnbanEnum'
})

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
	async grantOrRemoveAdminPermission(
		@Arg('userId') userId: string,
		@Arg('option') option: 'grant' | 'remove',
		@Ctx() context: Context
	): Promise<UserResponse> {
		const { user } = context

		try {
			const existingUser = await User.findOneBy({ userId })

			if (!existingUser)
				return {
					code: 400,
					success: false,
					message: `User not found`
				}

			if (existingUser.isAdmin && option === 'grant')
				return {
					code: 201,
					success: true,
					message: `User is a admin`
				}

			if (!existingUser.isAdmin && option === 'remove')
				return {
					code: 201,
					success: true,
					message: `User isn't admin`
				}

			existingUser.isAdmin = option === 'grant' ? true : false

			await existingUser.save()

			return {
				code: 200,
				success: true,
				message:
					option === 'grant'
						? `Set user ${existingUser.username} is admin successfully`
						: `Removered admin permission of ${existingUser.username}, by admin ${user?.username}`,
				user: existingUser
			}
		} catch (err) {
			throw internalServerError(err)
		}
	}

	@Mutation(_return => UserResponse)
	@UseMiddleware(authMiddleware.verifyToken, authMiddleware.isAdmin)
	async banOrUnbanUser(@Arg('userId') userId: string, @Arg('option') option: 'Ban' | 'Unban'): Promise<UserResponse> {
		try {
			const existingUser = await User.findOneBy({ userId })

			if (!existingUser)
				return {
					code: 400,
					success: false,
					message: `User not found`
				}

			if (existingUser.isBan && option === 'Ban')
				return {
					code: 201,
					success: false,
					message: `User ${existingUser.username} was baned`
				}

			if (!existingUser.isBan && option === 'Unban')
				return {
					code: 201,
					success: false,
					message: `User ${existingUser.username} isn't ban`
				}

			existingUser.isBan = option === 'Ban' ? true : false

			await existingUser.save()

			return {
				code: 200,
				success: true,
				message: `${option} user ${existingUser.username} successfully`
			}
		} catch (err) {
			throw internalServerError(err)
		}
	}

	@Mutation(_return => UserResponse)
	@UseMiddleware(authMiddleware.verifyToken, authMiddleware.isAdmin)
	async removeUser(@Arg('userId') userId: string, @Ctx() context: Context): Promise<UserResponse> {
		const { user } = context

		try {
			const existingUser = await User.findOneBy({ userId })

			if (!existingUser)
				return {
					code: 400,
					success: false,
					message: `User not found`
				}

			if (existingUser.isAdmin && !user?.isMaster)
				return {
					code: 400,
					success: false,
					message: `Only master can remover admin`
				}

			if (existingUser.isAdmin && user?.isMaster) {
				await existingUser.remove()

				return {
					code: 200,
					success: true,
					message: `User ${existingUser.username} was remove by ${user.isAdmin ? 'admin' : user.isMaster ? 'master' : ''}`
				}
			}

			await existingUser.remove()

			return {
				code: 200,
				success: true,
				message: `User ${existingUser.username} was remove by ${user!.isAdmin ? 'admin' : user!.isMaster ? 'master' : ''}`
			}
		} catch (err) {
			throw internalServerError(err)
		}
	}
}
