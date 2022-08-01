import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { getUserId } from '../utils';
import { updateUserTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
const logger = createLogger('CreateTodo');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const userId = getUserId(event);
	const todoId = event.pathParameters.todoId;
	logger.info(`Updating todo item with  todoId:${todoId} for user with userId:${userId}`, { event });
	const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);

	await updateUserTodo(userId, todoId, updatedTodo);

	return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		body: JSON.stringify({
			message: `User Todo Item Updated`
		})
	};
};
