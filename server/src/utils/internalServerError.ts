interface internalError {
	code: number
	success: boolean
	message: string
}

export const internalServerError = (err: any): internalError => {
	return {
		code: 500,
		success: false,
		message: `Internal server error: ${err.message}`
	}
}
