const BASE_URL = process.env.CPI_BASE_URL;
const USER = process.env.CPI_USER;
const PASS = process.env.CPI_PASSWORD;

const authHeader =
  "Basic " + Buffer.from(`${USER}:${PASS}`).toString("base64");

async function run() {
  // 1. CSRF Token holen
  const tokenResponse = await fetch(
    `${BASE_URL}/api/v1/IntegrationPackages`,
    {
      method: "GET",
      headers: {
        "Authorization": authHeader,
        "X-CSRF-Token": "Fetch",
        "Accept": "application/json"
      }
    }
  );

  if (!tokenResponse.ok) {
    throw new Error("CSRF-Token konnte nicht geholt werden");
  }

  const csrfToken = tokenResponse.headers.get("x-csrf-token");
  const cookies = tokenResponse.headers.getSetCookie?.() ||
                  tokenResponse.headers.raw?.()["set-cookie"];

  if (!csrfToken || !cookies) {
    throw new Error("CSRF-Token oder Cookies fehlen");
  }

  console.log("CSRF Token erhalten");

  // 2. Payload
  const payload = {
    Id: "FlashPipeDemo_qas",
    Name: "FlashPipeDemo_QAS",
    Description: "Test Transport in one Tenant"
  };

  // 3. POST – Integration Package anlegen
  const postResponse = await fetch(
    `${BASE_URL}/api/v1/IntegrationPackages`,
    {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "X-CSRF-Token": csrfToken,
        "Cookie": cookies.join("; "),
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  if (!postResponse.ok) {
    const errorText = await postResponse.text();
    throw new Error(`POST fehlgeschlagen: ${errorText}`);
  }

  console.log("Integration Package erfolgreich erstellt");
}

run().catch(err => {
  console.error(err.message);
  process.exit(1);
});
