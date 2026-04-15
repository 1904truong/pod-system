import axios from "axios";

const baseURL = "http://localhost:5000/api";
const email = "demo+collections@local.test";
const password = "Password123!";

async function getToken() {
  try {
    const reg = await axios.post(baseURL + "/auth/register", {
      email,
      password,
      name: "Demo",
    });
    return reg.data.token;
  } catch (e) {
    const msg = e?.response?.data?.message;
    if (msg !== "User already exists") throw e;
  }
  const login = await axios.post(baseURL + "/auth/login", { email, password });
  return login.data.token;
}

async function main() {
  const token = await getToken();
  const client = axios.create({
    baseURL,
    headers: { Authorization: "Bearer " + token },
  });

  let store;
  try {
    store = (
      await client.post("/stores", {
        name: "Demo Store",
        url: "demo-store",
        platform: "CUSTOM",
      })
    ).data;
  } catch {
    const stores = (await client.get("/stores")).data;
    store = stores[0];
  }

  const storeId = store.id;

  const top = (
    await client.post("/stores/" + storeId + "/collections", {
      name: "christmas",
      slug: "christmas",
    })
  ).data;

  const sub = (
    await client.post("/stores/" + storeId + "/collections", {
      name: "Christmas Mugs",
      slug: "christmas-mugs",
      parentId: top.id,
    })
  ).data;

  const cols = (await client.get("/stores/" + storeId + "/collections")).data;
  const pub = (await client.post("/stores/" + storeId + "/collections/publish")).data;

  console.log(
    JSON.stringify(
      {
        storeId,
        topId: top.id,
        subId: sub.id,
        collections: cols.length,
        publishedAt: pub.collectionsPublishedAt,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e?.response?.data || e);
  process.exit(1);
});
