import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';
const AWS = require('aws-sdk');
const AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS);
class TodoAccess {
	constructor(
		private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
		private readonly todosTable = String(process.env.TODOS_TABLE),
		private readonly todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX
	) {}

	async createTodoItem(todoItem: TodoItem) {
		await this.docClient
			.put({
				TableName: this.todosTable,
				Item: todoItem
			})
			.promise();
	}

	async getUserTodoItems(userId: string): Promise<TodoItem[]> {
		const result = await this.docClient
			.query({
				TableName: this.todosTable,
				IndexName: this.todosCreatedAtIndex,
				KeyConditionExpression: 'userId = :userId',
				ExpressionAttributeNames: {
					':userId': userId
				}
			})
			.promise();
		const todosIitems = result.Items;

		return todosIitems as TodoItem[];
	}
	async getUserExistingTodoItem(todoId: string, userId: string): Promise<Boolean> {
		const todoItem = await this.getUserTodoItem(userId, todoId);
		return !!todoItem;
	}

	async getUserTodoItem(userId: string, todoId: string): Promise<TodoItem> {
		const todoResult = await this.docClient
			.get({
				TableName: this.todosTable,
				Key: {
					userId: userId,
					todoId: todoId
				}
			})
			.promise();

		const item = todoResult.Item;
		return item as TodoItem;
	}

	async updateUserTodoItem(userId: string, todoId: string, todoUpdate: TodoUpdate) {
		await this.docClient
			.update({
				TableName: this.todosTable,
				Key: {
					userId: userId,
					todoId: todoId
				},
				UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
				ExpressionAttributeNames: {
					'#name': 'name'
				},
				ExpressionAttributeValues: {
					':name': todoUpdate.name,
					':dueDate': todoUpdate.dueDate,
					':done': todoUpdate.done
				}
			})
			.promise();
	}

	async updateUserTodoImage(userId: string, todoId: string, attachmentUrl: string) {
		await this.docClient
			.update({
				TableName: this.todosTable,
				Key: {
					userId: userId,
					todoId: todoId
				},
				UpdateExpression: 'set attachmentUrl = :attachmentUrl',
				ExpressionAttributeValues: {
					':attachmentUrl': attachmentUrl
				}
			})
			.promise();
	}
	async deleteUserTodoItem(userId: string, todoId: string) {
		await this.docClient
			.delete({
				TableName: this.todosTable,
				Key: {
					userId: userId,
					todoId: todoId
				}
			})
			.promise();
	}
}

export default TodoAccess;
