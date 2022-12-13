import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import { json } from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { useServer } from 'graphql-ws/lib/use/ws'
import { createServer } from 'http'
import mongoose from 'mongoose'
import 'reflect-metadata'
import { buildSchema } from 'type-graphql'
import { DataSource } from 'typeorm'
import { WebSocketServer } from 'ws'
import { Comment } from './entities/comment.entity'
import { Post } from './entities/post.entity'
import { Tag } from './entities/tag.entity'
import { User } from './entities/user.entity'
import { Vote } from './entities/vote.entity'
import { UserResolver } from './resolvers/user.resolver'
import { Context } from './types/context'

dotenv.config()

const main = async () => {
	const appDataSource = new DataSource({
		type: 'postgres',
		host: 'localhost',
		port: 5432,
		database: 'jungle-app-db',
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		synchronize: true,
		logging: false,
		entities: [User, Post, Tag, Comment, Vote]
	})

	appDataSource
		.initialize()
		.then(_ => console.log(`Connected to db`))
		.catch(err => console.error(`An error occurred while connect to db: ${err}`))

	mongoose.set('strictQuery', true).connect(process.env.CACHE_URL as string, err => {
		if (err) console.log(`An error occurred while connect to cache: ${err}`)
		else console.log(`Connected to cache`)
	})

	const app = express()

	const httpServer = createServer(app)

	const PORT = process.env.PORT || 4000

	await new Promise<void>(resolve => httpServer.listen({ port: PORT }, resolve))
		.then(_ => console.log(`Http server started on port`))
		.catch(err => console.log(`An error occurred while Http server starting: ${err}`))

	const wsServer = new WebSocketServer({
		server: httpServer,
		path: '/graphql'
	})

	const schema = await buildSchema({
		validate: false,
		resolvers: [UserResolver]
	})

	const serverCleanup = useServer({ schema }, wsServer)

	const apolloServer = new ApolloServer<Context>({
		schema,
		plugins: [
			ApolloServerPluginDrainHttpServer({ httpServer }),
			ApolloServerPluginLandingPageLocalDefault({
				includeCookies: true,
				footer: false
			}),
			{
				async serverWillStart() {
					return {
						async drainServer() {
							await serverCleanup.dispose()
						}
					}
				}
			}
		]
	})

	await apolloServer
		.start()
		.then(_ => console.log(`Apollo server started on port ${PORT}`))
		.then(_ => console.log(`Graphql endpoint: http://localhost:${PORT}/graphql`))
		.catch(err => console.log(`An error occurred while Apollo server starting: ${err}`))

	app.use(
		'/graphql',
		cors<cors.CorsRequest>({
			origin: 'http://localhost:3000',
			credentials: true
		}),
		json(),
		cookieParser(),
		expressMiddleware<Context>(apolloServer, {
			context: async ({ req, res }) => ({ req, res, appDataSource })
		})
	)
}

main().catch(err => console.log(`Initialize server error: ${err}`))
