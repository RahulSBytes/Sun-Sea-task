const leaveRequests = [];

export default function handler(req, res) {
  try { 
    if (req.method === "POST") {
      return handlePost(req, res);
    }

    if (req.method === "GET") {
      return handleGet(req, res);
    }

    // 3. Handle unsupported HTTP methods
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  } catch (error) {
    console.error("Unhandled server error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

function handlePost(req, res) {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "Invalid or missing request body." });
  }

  const { employeeId, startDate, endDate, reason } = body;

  // Validate employeeId
  if (!employeeId) {
    return res.status(400).json({ error: "employeeId is required." });
  }

  // Validate presence of dates
  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Both startDate and endDate are required." });
  }

  // Validate date parsing
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    return res.status(400).json({ error: "startDate is not a valid date." });
  }

  if (isNaN(end.getTime())) {
    return res.status(400).json({ error: "endDate is not a valid date." });
  }

  // Validate date range (endDate before startDate is invalid; same-day is fine)
  if (end < start) {
    return res.status(400).json({ error: "endDate cannot be before startDate." });
  }

  const request = {
    id: leaveRequests.length + 1,
    employeeId,
    startDate,
    endDate,
    reason: typeof reason === "string" ? reason : "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  leaveRequests.push(request);
  return res.status(201).json(request);
}

function handleGet(req, res) {
  let status = req.query?.status;

  // Query params can sometimes arrive as an array (e.g. ?status=a&status=b)
  if (Array.isArray(status)) {
    status = status[0];
  }

  if (!status) {
    return res.status(200).json(leaveRequests);
  }

  const filtered = leaveRequests.filter(
    (item) => item.status.toLowerCase() === String(status).toLowerCase()
  );

  return res.status(200).json(filtered);
}