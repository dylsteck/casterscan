export class NotFoundError extends Error {
  constructor(
    public resource: string,
    public id: string
  ) {
    super(`${resource} not found: ${id}`);
    this.name = "NotFoundError";
  }
}

export class UpstreamError extends Error {
  constructor(
    public source: string,
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "UpstreamError";
  }
}
