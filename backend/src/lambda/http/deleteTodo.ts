import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getUserId } from '../utils';
import { deleteUserTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
const logger = createLogger('CreateTodo');
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const jwtToken = getUserId(event);
	const todoId = event.pathParameters.todoId;
	logger.info(`Delecting todo item with  todoId:${todoId}`);
	await deleteUserTodo(jwtToken, todoId);

	return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		body: JSON.stringify({
			message: `Todo item delete successful!`
		})
	};
};
