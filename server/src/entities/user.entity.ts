import { IsEmail } from 'class-validator'
import { Gender, Rank } from '../types/enum'
import { Field, ID, ObjectType, registerEnumType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn } from 'typeorm'
import { Post } from './post.entity'

registerEnumType(Gender, {
	name: 'Gender',
	description: 'Gender enum'
})

registerEnumType(Rank, {
	name: 'Rank',
	description: 'Rank enum'
})

@ObjectType()
@Entity()
export class User extends BaseEntity {
	@Field(_type => ID)
	@PrimaryColumn()
	userId!: string

	@Field(_type => String)
	@Column({ unique: true })
	username!: string

	@Field(_type => String)
	@Column({ unique: true })
	@IsEmail()
	email!: string

	@Column()
	password!: string

	@Column()
	firstname!: string

	@Column()
	lastname!: string

	@Field(_type => String)
	fullname: string

	@Column('date')
	birthday!: Date

	@Field(_type => Number)
	age: number

	@Field(_type => Gender)
	@Column('enum', { enum: Gender })
	gender: Gender

	@Field(_type => String)
	@Column({ default: 'I am a new user' })
	about: string

	@Field(_type => Rank)
	@Column('enum', { enum: Rank, default: Rank.NON })
	rank: Rank

	@Field(_type => Boolean)
	@Column('boolean', { default: false })
	isAdmin: Boolean

	@Field(_type => Boolean)
	@Column('boolean', { default: false })
	isBan: Boolean

	@Field(_type => String)
	@Column()
	avatarUrl: string

	@Column({ default: 0 })
	tokenVersion: number

	@Field(_type => [Post])
	@OneToMany(() => Post, post => post.user)
	posts: Post[]

	@Field(_type => [User])
	@Column('jsonb', { array: true, default: [] })
	followers: User[]

	@Field(_type => [User])
	@Column('jsonb', { array: true, default: [] })
	followings: User[]

	@CreateDateColumn({ type: 'timestamp without time zone' })
	createdAt: Date
}
