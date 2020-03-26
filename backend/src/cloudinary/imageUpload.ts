import cloudinary from "cloudinary";
import { ReadStream } from "fs";

export const uploadSingleImage = async (readStream: ReadStream) => {
  return await new Promise((resolve, reject) => {
    readStream.pipe(
      cloudinary.v2.uploader.upload_stream((error, result) => {
        if (error) {
          reject(error);
        }

        resolve(result);
      })
    );
  });
};
