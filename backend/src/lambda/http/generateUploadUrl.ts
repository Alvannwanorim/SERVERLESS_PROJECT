import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import * as uuid from 'uuid';
import { getUserId } from '../utils';
import { createImageAttachmentPresignedUrl, UpdateImageAttachmentUrl } from '../../businessLogic/todos';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const todoId = event.pathParameters.todoId;
	const userId = getUserId(event);
	const attachemntId = uuid.v4();

	const imageUploadUrl = await createImageAttachmentPresignedUrl(attachemntId);
	await UpdateImageAttachmentUrl(userId, todoId, attachemntId);
	return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		body: JSON.stringify({
			imageUploadUrl
		})
	};
});

handler.use(httpErrorHandler()).use(
	cors({
		credentials: true
	})
);
