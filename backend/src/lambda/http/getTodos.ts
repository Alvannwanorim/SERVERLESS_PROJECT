import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { getUserId } from '../utils';
import { getUserTodos } from '../../businessLogic/todos';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const userId = getUserId(event);
	const userTodos = await getUserTodos(userId);
	return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		body: JSON.stringify({
			items: userTodos
		})
	};
});
handler.use(
	cors({
		credentials: true
	})
);
