import { JwtPayload } from 'jsonwebtoken'

export type UserAuthPayload = JwtPayload & {
	userId: string
	username: string
	isAdmin: boolean
	tokenVersion?: number
}
