import { Field, InputType } from 'type-graphql'
import { Gender } from './enum'

@InputType()
class RegisterInput {
	@Field(_type => String)
	username!: string

	@Field(_type => String)
	email!: string

	@Field(_type => String)
	password!: string

	@Field(_type => String)
	firstname!: string

	@Field(_type => String)
	lastname!: string

	@Field(_type => Date)
	birthday!: Date

	@Field(_type => Gender)
	gender!: Gender
}

@InputType()
class LoginInput {
	@Field(_type => String)
	usernameOrEmail!: string

	@Field(_type => String)
	password!: string
}

export { RegisterInput, LoginInput }
