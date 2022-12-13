const helper = () => {
	const uppercase = (str: string) =>
		str.split(' ').forEach(ele => ele.charAt(0).toUpperCase().toString() + ele.substring(1).toString())

	return { uppercase }
}

export default helper()
