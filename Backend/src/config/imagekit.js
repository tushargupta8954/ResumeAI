import ImageKit from "imagekit";
import dotenv from "dotenv";

dotenv.config();

let imagekitClient = null;

const getImageKitClient = () => {
  if (imagekitClient) {
    return imagekitClient;
  }

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error("ImageKit credentials are not fully configured");
  }

  imagekitClient = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });

  return imagekitClient;
};

export const uploadToImageKit = async (
  fileBuffer,
  fileName,
  folder = "/resume-builder"
) => {
  try {
    const response = await getImageKitClient().upload({
      file: fileBuffer.toString("base64"),
      fileName: `${Date.now()}-${fileName}`,
      folder,
      useUniqueFileName: true,
      tags: ["resume-builder", "profile-image"],
    });
    return response;
  } catch (error) {
    throw new Error(`ImageKit upload failed: ${error.message}`);
  }
};

export const deleteFromImageKit = async (fileId) => {
  try {
    await getImageKitClient().deleteFile(fileId);
    return true;
  } catch (error) {
    throw new Error(`ImageKit delete failed: ${error.message}`);
  }
};

export const getImageKitUrl = (path, transformations = []) => {
  return getImageKitClient().url({
    path,
    transformation: transformations,
  });
};

export default getImageKitClient;
