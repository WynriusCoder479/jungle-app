import { VoteValue } from '../types/enum'
import { Field, ID, ObjectType, registerEnumType } from 'type-graphql'
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import { Tag } from './tag.entity'
import { User } from './user.entity'
import { Vote } from './vote.entity'
import { Comment } from './comment.entity'

registerEnumType(VoteValue, {
	name: 'VoteType',
	description: 'Vote type enum'
})

@ObjectType()
@Entity()
export class Post extends BaseEntity {
	@Field(_type => ID)
	@PrimaryColumn()
	postId!: string

	@Field(_type => ID)
	@Column()
	ownerId!: string

	@ManyToOne(() => User, user => user.posts)
	user: User

	@Field(_type => String)
	@Column()
	title!: string

	@Field(_type => String)
	@Column()
	description?: string

	@Field(_type => String)
	@Column()
	conten!: string

	@Field(_type => String)
	@Column()
	imageUrl!: string

	@Field(_type => [Tag])
	@Column('jsonb', { array: true, default: [] })
	tags?: Tag[]

	@Field(_type => Vote)
	@OneToMany(_to => Vote, vote => vote.post)
	votes: Vote[]

	@Column({ default: 0 })
	point!: number

	@Field(_type => [Comment])
	@OneToMany(_to => Comment, comment => comment.post)
	comments: Comment[]
}
