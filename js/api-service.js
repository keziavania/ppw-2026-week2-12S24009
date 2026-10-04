const ApiService = (() => {
  const BASE_PATH = './data';
  const ORDER_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts';
  const SIMULATED_LATENCY_MS = 600;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function getJSON(fileName) {
    try {
      const response = await fetch(`${BASE_PATH}/${fileName}`);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }
      await wait(SIMULATED_LATENCY_MS);
      return await response.json();
    } catch (err) {
      console.error(`[API Network Error] ${fileName}:`, err);
      throw err;
    }
  }

  return {
    getProjects: () => getJSON('projects.json'),
    getServices: () => getJSON('services.json'),
    getProfile: () => getJSON('profile.json'),

    async submitServiceOrder(payload) {
      try {
        const response = await fetch(ORDER_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
      } catch (err) {
        console.error('[API Submit Error]:', err);
        throw err;
      }
    },
  };
})();