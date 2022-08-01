import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as uuid from 'uuid';
import { getUserId } from '../utils';
import { createImageAttachmentPresignedUrl, UpdateImageAttachmentUrl } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
const logger = createLogger('CreateTodo');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const todoId = event.pathParameters.todoId;
	const jwtToken = getUserId(event);
	const attachemntId = uuid.v4();
	logger.info(`Generating image upload url for todo item with  todoId:${todoId}`);

	const imageUploadUrl = await createImageAttachmentPresignedUrl(attachemntId);
	await UpdateImageAttachmentUrl(jwtToken, todoId, attachemntId);
	return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		body: JSON.stringify({
			imageUploadUrl
		})
	};
};
