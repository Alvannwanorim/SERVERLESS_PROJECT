import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS);
class AttachmentUtils {
	constructor(
		private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
		private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
		private readonly urlExpirationTime = String(process.env.SIGNED_URL_EXPIRATION)
	) {}

	async getImageUploadUrl(attachemntId: string): Promise<string> {
		const imageUrl = this.s3.getSignedUrl('putObject', {
			Bucket: this.bucketName,
			Key: attachemntId,
			Expires: parseInt(this.urlExpirationTime)
		});

		return imageUrl;
	}
}

export default AttachmentUtils;
