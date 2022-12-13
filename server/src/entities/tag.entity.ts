import { Field, ID, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@ObjectType()
@Entity()
export class Tag extends BaseEntity {
	@Field(_type => ID)
	@PrimaryGeneratedColumn()
	tagId: number

	@Field(_type => String)
	@Column({ unique: true })
	tagName: string

	@CreateDateColumn()
	createdAt: Date
}
