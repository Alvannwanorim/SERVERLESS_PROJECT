import TodoAccess from '../dataLayer/todos-access';
import AttachmentUtils from '../dataLayer/attachment-utils';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import * as uuid from 'uuid';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';
import * as createHttpError from 'http-errors';
import { TodoUpdate } from '../models/TodoUpdate';

const logger = createLogger('todos');
const todoAccess = new TodoAccess();
const todoAttachment = new AttachmentUtils();

export async function getUserTodos(userId: string): Promise<TodoItem[]> {
	logger.info(`Fetching all todo items for user with userId:${userId}`, { userId });
	return await todoAccess.getUserTodoItems(userId);
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
	const todoId = uuid.v4();
	const newItem: TodoItem = {
		userId,
		todoId,
		createdAt: new Date().toISOString(),
		done: false,
		attachmentUrl: null,
		...createTodoRequest
	};
	logger.info(`Createding todo item with  todoId:${todoId} for user with userId:${userId}`, { newItem });
	await todoAccess.createTodoItem(newItem);
	return newItem;
}

export async function updateUserTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest) {
	logger.info(`Updating todo item with  todoId:${todoId} for user with userId:${userId}`, { updateTodoRequest });
	const userTodo = await todoAccess.getUserTodoItem(userId, todoId);

	if (!userTodo) {
		logger.error(`No todo item was found for this user`, { userId });
		throw createHttpError(404, 'User Todo Item not found');
	}

	if (userTodo.userId.toString() !== userId) {
		logger.error(`User is not authorized`, { userId });
		throw createHttpError(403, 'User is not authorized to perorm this acction');
	}
	todoAccess.updateUserTodoItem(userId, todoId, updateTodoRequest as TodoUpdate);
}

export async function deleteUserTodo(userId: string, todoId: string) {
	const userTodo = await todoAccess.getUserTodoItem(userId, todoId);
	if (!userTodo) throw createHttpError(404, 'Todo Item not found');

	if (userTodo.userId.toString() !== userId) {
		logger.error(`User is not authorized`, { userId });
		throw createHttpError(403, 'User is not authorized to perorm this acction');
	}

	todoAccess.deleteUserTodoItem(userId, todoId);
}

export async function UpdateImageAttachmentUrl(userId: string, todoId: string, attachmentId: string) {
	const bucketName = process.env.ATTACHMENT_S3_BUCKET;
	const attachemntUrl = `https://${bucketName}.s3.amazonaws.com/${attachmentId}`;

	const userTodo = await todoAccess.getUserTodoItem(userId, todoId);
	if (!userTodo) throw createHttpError(404, 'User Todo Item not found');

	if (userTodo.userId.toString() !== userId) {
		logger.error(`User is not authorized`, { userId });
		throw createHttpError(403, 'User is not authorized to perorm this acction');
	}
	await todoAccess.updateUserTodoImage(userId, todoId, attachemntUrl);
}

export async function createImageAttachmentPresignedUrl(attachemntId: string) {
	const imageUploadUrl = await todoAttachment.getImageUploadUrl(attachemntId);
	return imageUploadUrl;
}
