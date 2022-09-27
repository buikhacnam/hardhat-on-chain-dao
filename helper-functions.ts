import { run } from 'hardhat'

const verify = async (contractAddress: string, args: any[], contract?: string) => {
	console.log('Verifying contract...')
	try {
		if (contract) {
			await run('verify:verify', {
				address: contractAddress,
				constructorArguments: args,
        contract: contract,
			})
		} else {
			await run('verify:verify', {
				address: contractAddress,
				constructorArguments: args,
			})
		}
	} catch (e:any) {
		if (e.message.toLowerCase().includes('already verified')) {
			console.log('Already verified!')
		} else {
			console.log(e)
		}
	}
}

export default verify
