import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
});

handler.use(
	cors({
		credentials: true
	})
);
