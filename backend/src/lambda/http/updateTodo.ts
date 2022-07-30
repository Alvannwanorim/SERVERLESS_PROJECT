import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { getUserId } from '../utils';
import { updateUserTodo } from '../../businessLogic/todos';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const userId = getUserId(event);
	const todoId = event.pathParameters.todoId;
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
});

handler.use(httpErrorHandler()).use(
	cors({
		credentials: true
	})
);
