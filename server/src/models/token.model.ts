import { Prop, getModelForClass } from '@typegoose/typegoose'

export class Token {
	@Prop({ required: true })
	userId!: string

	@Prop({ required: true })
	token!: string

	@Prop({ default: Date.now(), expires: 60 * 60 })
	TTL: Date
}

export const TokenModel = getModelForClass(Token, {
	schemaOptions: {
		collection: 'Token'
	}
})
