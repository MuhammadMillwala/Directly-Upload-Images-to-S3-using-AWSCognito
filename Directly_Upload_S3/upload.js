document.getElementById('uploadButton').addEventListener('click', async function () {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  
  if (!file) {
      alert('Please select a file.');
      return;
  }

  await uploadToS3(file, 'image'); // Assuming it's an image type; you can modify the type as needed.
});

AWS.config.region = ''; // Set the AWS region

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'YOUR_IDENTITY_POOL_ID', // Set your Cognito Identity Pool ID
  RoleArn: 'YOUR_ROLE_ARN', // Set your Role ARN if required
  AccountId: 'YOUR_ACCOUNT_ID' // Set your AWS Account ID
});

AWS.config.credentials.get(function(err) {
  if (err) {
      console.log('Error retrieving Cognito Identity:', err);
  } else {
      console.log('Cognito Identity ID:', AWS.config.credentials.identityId);
  }
});

async function uploadToS3(file, type) {
  try {
      // Handle image-specific logic
      if (type === 'image') {
          const dimensionResult = await new Promise(resolve => {
              checkImageDimensions(file, function(result) {
                  resolve(result);
              });
          });

          if (!dimensionResult) {
              file = await croppedImage(file);
          }
      }

      // Generate random filename
      const randomString = Math.random().toString(36).substring(7);
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const filename = `${randomString}_${timestamp}.${fileExtension}`;

      console.log('Generated filename:', filename);

      // Define the S3 object key and bucket name
      const s3ObjectKey = `instagram/${filename}`;
      const s3BucketName = 'uploads.therecomm.com';

      // Configure the S3 client
      const s3 = new AWS.S3({
          apiVersion: '2006-03-01',
          params: { Bucket: s3BucketName },
      });

      // Define upload parameters
      const uploadParams = {
        Key: s3ObjectKey,
        Body: file,
        IdentityId: cognito_id.params.IdentityId,
    };
      console.log("files1", file);
      console.log('Uploading file:', file);

      // Upload the file to S3
      const uploadResult = await s3.upload(uploadParams).promise();

      const imageUrl = `https://dl5hm3xr9o0pk.cloudfront.net/${s3ObjectKey}`;
      console.log(`Successfully uploaded file to ${imageUrl}`);
      alert('File uploaded successfully');
      return imageUrl;

  } catch (error) {
      console.error('Error uploading file to S3:', error);
      alert('Error uploading file to S3');
  }
}

// Dummy functions for demonstration; replace with actual implementations
function checkImageDimensions(file, callback) {
  // Replace with actual image dimension checking logic
  callback(true);
}

async function croppedImage(file) {
  // Replace with actual image cropping logic
  return file;
}
