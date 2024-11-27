export class HttpError {
  status: number;
  message: string;

  constructor(status: number, message: string) {
    this.status = status;
    this.message = message;
  }
}
export async function fetchWrapper<T>(
  path: string,
  method: string,
  token?: string,
  data?: { [key: string]: any },
  headers?: { [key: string]: string }
): Promise<T> {
  const params: { [key: string]: any } = {};
  if (headers === undefined) {
    headers = {};
  }
  if (token !== undefined) {
    // headers["Authorization"] = "Bearer " + token;
  }
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    // headers["Content-Type"] = "application/json";
    // headers["Accept"] = "application/json";
  }
  // if (method !== "GET") {
  params["mode"] = "cors";
  // }

  params["headers"] = headers;
  params["method"] = method;
  if (data !== undefined) {
    params["body"] = JSON.stringify(data);
  }
  return await fetch(import.meta.env.VITE_BACKEND_URL + path, params)
    .then((response) => {
      if (response.status > 299) {
        throw new HttpError(response.status, response.statusText);
      }
      if (response.status === 204) {
        return null;
      }
      return response.json();
    })
    .catch((error) => {
      throw error;
    });
}
