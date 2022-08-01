import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';

/**
 * Create user todo item
 */
const logger = createLogger('CreateTodo');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	logger.info('Creating user todo item: ', { event });
	const newTodo: CreateTodoRequest = JSON.parse(event.body);

	const userId = getUserId(event);
	const newUserTodoItem = await createTodo(userId, newTodo);

	return {
		statusCode: 201,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Credentials': true
		},
		body: JSON.stringify({
			item: newUserTodoItem
		})
	};
};
