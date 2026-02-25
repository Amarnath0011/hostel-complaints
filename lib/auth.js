export function handleAuthError(error) {
  if (["TokenExpiredError", "JsonWebTokenError"].includes(error.name)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ error: "Server Error" }, { status: 500 });
}