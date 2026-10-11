async function checkKey(key) {
  const url = `https://api.themoviedb.org/3/movie/533535?api_key=${key}`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      console.log(`Key ${key} works!`);
      return true;
    } else {
      console.log(`Key ${key} failed: ${res.status}`);
      return false;
    }
  } catch (err) {
    console.log(`Key ${key} error: ${err.message}`);
    return false;
  }
}

async function run() {
  const keys = [
    'fba872a0833a69769a7c8801d56a2fef',
    'db5304b901a57e60fb7cb0449a0352ef',
    '85c9a7516d2cb1369b76db17d74ed976',
    'ce6b2d287114b09efd951667b2d56a2f',
    'd53b4bc66efec0f5f7e68bc6675d05e2',
    '4ecb2d287114b09efd951667b2d56a2f',
    'd32d3d78907890f0980f0890f0980f09',
    'a0a7e60fb7cb0449a0352efdb5304b9',
    '4ecb2d287114b09efd951667b2d56a2f'
  ];
  for (const key of keys) {
    await checkKey(key);
  }
}
run();
