import request from 'superagent'

import config from './config'


type RequestBody = {
    id?: string,
    model?: string,
    name?: string
    price?: number|string,
    year?: number|string
}

function parseArgvToRequest(argv: Array<string>): RequestBody {
    const body: RequestBody = {}
    for (const arg of argv.slice(2)) {
        const [name, val] = arg.split('=')
        if (name && val) {
            body[name as keyof RequestBody] = val
        }
    }
    return body
}


async function createCar(argv: Array<string>): Promise<any> {
    if (argv.length > 3) {
        const payload = parseArgvToRequest(argv)
        return request.post(`http://${config.api.host}:${config.api.port}/api/car`).send(payload)
    }

    throw new Error('Script create required more fields like "model: string"')
}

async function updateCar(argv: Array<string>): Promise<any> {
    if (argv.length > 3) {
        const payload = parseArgvToRequest(argv)
        if (payload.id) {
            return request.put(`http://${config.api.host}:${config.api.port}/api/car/${payload.id}`).send(payload)
        }
        throw new Error('id is required')
    }

    throw new Error('Script update required more fields like "model: string"')
}

async function deleteCar(argv: Array<string>): Promise<any> {
    if (argv.length > 3) {
        const payload = parseArgvToRequest(argv)
        if (payload.id) {
            return request.delete(`http://${config.api.host}:${config.api.port}/api/car/${payload.id}`)
        }
        throw new Error('id is required')
    }

    throw new Error('Script delete required field id')
}

async function getCarById(argv: Array<string>): Promise<any> {
    if (argv.length > 3) {
        const payload = parseArgvToRequest(argv)
        if (payload.id) {
            return request.get(`http://${config.api.host}:${config.api.port}/api/car/${payload.id}`)
        }
        throw new Error('id is required')
    }

    throw new Error('Script getCarById required field id')
}

async function getCars(argv: Array<string>): Promise<any> {
    let query = {}
    if (argv.length > 3) {
        query = parseArgvToRequest(argv)
    }
    return request.get(`http://${config.api.host}:${config.api.port}/api/car`).query(query)
}

function help() {
    console.log(`
        Execute scripts:
            npm run exec -- help
            npm run exec -- create brand=string name=string year=number price=number
            npm run exec -- update id=string brand=string name=string year=number price=number
            npm run exec -- delete id=string
            npm run exec -- getById id=string
            npm run exec -- get limit?=number skip?=number sortField?=string sort?=1(ASC)|-1(DESC) brand? ...
    `)
}


async function execute(argv: Array<string>): Promise<any> {
    if (argv.length > 2) {
        const scriptName = argv[2]
        switch (scriptName) {
            case 'help':
                return Promise.resolve().then(help)
            case 'create':
                return createCar(argv);
            case 'update':
                return updateCar(argv)
            case 'delete':
                return deleteCar(argv)
            case 'getById':
                return getCarById(argv)
            case 'get':
                return getCars(argv)
            default:
                throw new Error('Invalid script name, use "npm run exec" for show current scripts')
        } 
    }

    return Promise.resolve().then(help)
}

execute(process.argv)
    .then(response => {
        if (response && response.body) {
            console.log(`Api response:\n`)
            console.dir(response.body)
        }
        process.exit(0)
    })
    .catch(error => {
        console.log(`Error - message: ${error.message}, response: ${error.response && error.response.text || null}`)
        process.exit(error.code || 1)
    })