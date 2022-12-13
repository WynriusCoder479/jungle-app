import { Request, Response } from 'express'
import { User } from '../entities/user.entity'
import { DataSource } from 'typeorm'

export type Context = {
	req: Request
	res: Response
	userId?: string
	user?: User
	appDataSource: DataSource
}
