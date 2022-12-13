import { getModelForClass, Prop } from '@typegoose/typegoose'
import { IMessagePayload } from 'src/types/utils'

export class SingleConversation {
	@Prop({ required: true })
	userOfConversation!: string[]

	@Prop()
	messages: IMessagePayload[]
}

export const SingleConversationModel = getModelForClass(SingleConversation, {
	schemaOptions: {
		collection: 'SingleConversation'
	}
})

export class TeamConversation {
	@Prop({ required: true })
	teamId!: string

	@Prop()
	messages: IMessagePayload[]
}

export const TeamConversationModel = getModelForClass(TeamConversation, {
	schemaOptions: {
		collection: 'TeamConversation'
	}
})
