import cloudinary from "cloudinary";
import path from "path";

export const deleteSingleImage = async (uri: string) => {
  let public_id = await getPublicIdFromUri(uri);
  await cloudinary.v2.uploader.destroy(public_id);
};

function getPublicIdFromUri(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const splittedString = uri.split("/");
    const fileId = splittedString[splittedString.length - 1];
    if (!fileId) {
      reject("Cannot parse uri");
    }
    resolve(path.parse(fileId).name);
  });
}
