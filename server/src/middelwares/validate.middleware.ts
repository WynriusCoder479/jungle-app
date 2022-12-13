import { validate } from 'email-validator'
import { MiddlewareFn, NextFn } from 'type-graphql'
import { User } from '../entities/user.entity'
import { LoginInput, RegisterInput } from '../types/input'
import { FieldError, UserResponse } from '../types/response'
import { internalServerError } from '../utils/internalServerError'
import argon2 from 'argon2'
import { Context } from '../types/context'

const validateMiddleware = () => {
	const validateRegisterInput: MiddlewareFn = async ({ args }, next: NextFn): Promise<UserResponse | NextFn> => {
		const passwordPartern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

		const registerInput = args.registerInput as RegisterInput

		if (Object.values(registerInput).every(data => data !== '' || data !== undefined || data !== null) === false) {
			return {
				code: 400,
				success: false,
				message: 'missing data',
				errors: (
					Object.entries(registerInput).map<FieldError | undefined>(data =>
						data[1] === '' || data[1] === undefined || data === null
							? {
									field: `${data[0]}`,
									message: `${data[0]} is required`
							  }
							: undefined
					) as FieldError[]
				).filter(data => data !== undefined)
			}
		}

		const { username, email, password } = registerInput

		if (username.length <= 4 || validate(username))
			return {
				code: 400,
				success: false,
				message: 'invalid username',
				errors: [
					{
						field: 'username',
						message: 'Username must be 4 or greater, and not include "@" character'
					}
				]
			}

		if (!validate(email))
			return {
				code: 400,
				success: false,
				message: 'invalid email',
				errors: [
					{
						field: 'email',
						message: 'Email format is incorret'
					}
				]
			}

		if (!passwordPartern.test(password))
			return {
				code: 400,
				success: false,
				message: 'invalid password',
				errors: [
					{
						field: 'password',
						message: `Password must be 8 or greater, include at least 1 capital leter, 1 number digit, and 1 special character like (@ $ ! % * ? &)`
					}
				]
			}

		return next()
	}

	const duplicatedUser: MiddlewareFn = async ({ args }, next: NextFn): Promise<UserResponse | NextFn> => {
		const { username, email } = args.registerInput as RegisterInput

		try {
			const existingUser = await User.findOne({ where: [{ username }, { email }] })

			if (existingUser)
				return {
					code: 400,
					success: false,
					message: `duplicated user`,
					errors:
						username === existingUser.username && email === existingUser.email
							? [
									{
										field: 'username',
										message: 'Username is already taken by another user'
									},
									{
										field: 'email',
										message: 'Email is already taken by another user'
									}
							  ]
							: username === existingUser.username
							? [
									{
										field: 'username',
										message: 'Username is already taken by another user'
									}
							  ]
							: [
									{
										field: 'email',
										message: 'Email is already taken by another user'
									}
							  ]
				}

			return next()
		} catch (err) {
			throw internalServerError(err)
		}
	}

	const validateLoginInput: MiddlewareFn = async ({ args }, next: NextFn): Promise<UserResponse | NextFn> => {
		const loginInput = args.loginInput as LoginInput

		if (Object.values(loginInput).every(data => data !== '') === false)
			return {
				code: 400,
				success: false,
				message: `missing data`,
				errors: (
					Object.entries(loginInput).map<FieldError | undefined>(data =>
						data[1] === '' ? { field: `${data[0]}`, message: `${data[0]} is missing` } : undefined
					) as FieldError[]
				).filter(data => data !== undefined)
			}

		return next()
	}

	const checkLogin: MiddlewareFn<Context> = async ({ args, context }, next: NextFn): Promise<UserResponse | NextFn> => {
		const { usernameOrEmail, password } = args.loginInput as LoginInput

		try {
			const existingUser = await User.findOneBy(
				validate(usernameOrEmail) ? { email: usernameOrEmail } : { username: usernameOrEmail }
			)

			if (!existingUser)
				return {
					code: 400,
					success: false,
					message: `User not found`
				}

			const verifyPassword = await argon2.verify(existingUser.password, password)

			if (!verifyPassword)
				return {
					code: 400,
					success: false,
					message: `wrong password`,
					errors: [
						{
							field: 'password',
							message: 'Password is incorrect'
						}
					]
				}
			context.user = existingUser

			return next()
		} catch (err) {
			throw internalServerError(err)
		}
	}

	return { validateRegisterInput, duplicatedUser, checkLogin, validateLoginInput }
}

export default validateMiddleware()
