import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import 'source-map-support/register';
import { verify } from 'jsonwebtoken';
import { createLogger } from '../../utils/logger';
import Axios from 'axios';
import { JwtPayload } from '../../auth/JwtPayload';

const logger = createLogger('auth');
const jwksUrl = `${process.env.AUTH_0_JWK_URL}`;
let cachedCert: string;
export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
	logger.info('Authorizing a user', event.authorizationToken);
	try {
		const jwtToken = await verifyToken(event.authorizationToken);
		logger.info('User was authorized', jwtToken);

		return {
			principalId: jwtToken.sub,
			policyDocument: {
				Version: '2012-10-17',
				Statement: [
					{
						Action: 'execute-api:Invoke',
						Effect: 'Allow',
						Resource: '*'
					}
				]
			}
		};
	} catch (e) {
		logger.error('User not authorized', { error: e.message });

		return {
			principalId: 'user',
			policyDocument: {
				Version: '2012-10-17',
				Statement: [
					{
						Action: 'execute-api:Invoke',
						Effect: 'Deny',
						Resource: '*'
					}
				]
			}
		};
	}
};

async function verifyToken(authHeader: string): Promise<JwtPayload> {
	const token = getToken(authHeader);
	const cert = await getAuthCert();
	const jwt = verify(token, cert, { algorithms: [ 'RS256' ] }) as JwtPayload;

	return jwt;
}

function getToken(authHeader: string): string {
	if (!authHeader) throw new Error('No authentication header');

	if (!authHeader.toLowerCase().startsWith('bearer ')) throw new Error('Invalid authentication header');

	const split = authHeader.split(' ');
	const token = split[1];

	return token;
}

async function getAuthCert(): Promise<string> {
	if (cachedCert) return cachedCert;

	logger.info(`Fetching certificate from ${jwksUrl}`);

	const { data } = await Axios.get(jwksUrl);
	const keys = data.keys;

	if (!keys || !keys.length) throw new Error('No JWKS keys found!');

	const signingKeys = keys.filter(
		(key) =>
			key.use === 'sig' &&
			key.kty === 'RSA' &&
			key.alg === 'RS256' &&
			key.n &&
			key.e &&
			key.kid &&
			(key.x5c && key.x5c.length)
	);

	if (!signingKeys.length) throw new Error('No JWKS signing keys found!');

	const key = signingKeys[0];
	const publicKey = key.x5c[0];

	cachedCert = createAuthCert(publicKey);

	logger.info('Valid certificate found', cachedCert);

	return cachedCert;
}
function createAuthCert(cert: string): string {
	cert = cert.match(/.{1,64}/g).join('\n');
	cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
	return cert;
}
