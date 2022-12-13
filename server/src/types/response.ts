import { User } from '../entities/user.entity'
import { Field, InterfaceType, ObjectType } from 'type-graphql'

@InterfaceType()
abstract class IResponse {
	@Field(_type => String)
	code!: number

	@Field(_type => Boolean)
	success!: boolean

	@Field(_type => String, { nullable: true })
	message?: string
}

@ObjectType()
class BaseResponse {
	@Field(_type => String)
	code!: number

	@Field(_type => Boolean)
	success!: boolean

	@Field(_type => String, { nullable: true })
	message?: string
}

@ObjectType()
class FieldError {
	@Field()
	field: string

	@Field()
	message: string
}

@ObjectType({ implements: IResponse })
class UserResponse implements IResponse {
	code!: number
	success!: boolean
	message?: string

	@Field(_type => [FieldError], { nullable: true })
	errors?: FieldError[]

	@Field(_type => User, { nullable: true })
	user?: User

	@Field(_type => String, { nullable: true })
	accessToken?: Promise<string>
}

export { IResponse, UserResponse, FieldError, BaseResponse }
