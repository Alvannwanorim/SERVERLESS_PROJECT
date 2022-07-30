import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { getUserId } from '../utils';
import { deleteUserTodo } from '../../businessLogic/todos';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	// TODO: Remove a TODO item by id
	const userId = getUserId(event);
	const todoId = event.pathParameters.todoId;

	await deleteUserTodo(userId, todoId);

	return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		body: JSON.stringify({
			message: `Todo item delete successful!`
		})
	};
});

handler.use(httpErrorHandler()).use(
	cors({
		credentials: true
	})
);
