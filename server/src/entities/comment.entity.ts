import { ObjectType, Field } from 'type-graphql'
import { Entity, BaseEntity, PrimaryColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm'
import { Post } from './post.entity'
import { User } from './user.entity'

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
	@PrimaryColumn()
	ownerId: string

	@ManyToOne(_to => User, user => user.userId)
	user!: User

	@PrimaryColumn()
	postId: string

	@ManyToOne(_to => Post, post => post.comments)
	post!: Post

	@Field(_type => String)
	@Column()
	content!: string

	@Field(_type => String)
	@Column()
	imageUrl?: string

	@Field(_type => [Comment])
	@Column('jsonb', { array: true, default: [] })
	replyComments: Comment[]

	@CreateDateColumn({ type: 'timestamp without time zone' })
	createdAt: Date
}
