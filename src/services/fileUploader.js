import { API } from "./server";

export const FileUploader = {
  async uploadFile(path, file) {
    const data = await API.getSignedUploadUrl(path);

    const buffer = await file.arrayBuffer();
    let byteArray = new Int8Array(buffer);

    await API.uploadBySignedUrl(data.url, byteArray, file.type);
  },
};
