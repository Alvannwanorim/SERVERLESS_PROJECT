import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getUserId } from '../utils';
import { getUserTodos } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
const logger = createLogger('CreateTodo');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const jwtToken = getUserId(event);
	const userTodos = await getUserTodos(jwtToken);
	logger.info(`Fetching all todo items for user with userId:${jwtToken}`);
	return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		body: JSON.stringify({
			items: userTodos
		})
	};
};
