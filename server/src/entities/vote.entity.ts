import { VoteValue } from '../types/enum'
import { Field, ID, ObjectType } from 'type-graphql'
import { Entity, BaseEntity, PrimaryColumn, OneToMany, Column, CreateDateColumn } from 'typeorm'
import { Post } from './post.entity'
import { User } from './user.entity'

@ObjectType()
@Entity()
export class Vote extends BaseEntity {
	@Field(_type => ID)
	@PrimaryColumn()
	ownerId: string

	@OneToMany(_to => User, user => user.userId)
	user!: User

	@PrimaryColumn()
	postID: string

	@OneToMany(_to => Post, post => post.votes)
	post!: Post

	@Field(_type => VoteValue)
	@Column({ type: 'enum', enum: VoteValue })
	value!: VoteValue

	@CreateDateColumn({ type: 'timestamp without time zone' })
	createdAt: Date
}
