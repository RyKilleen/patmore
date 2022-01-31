self.addEventListener("fetch", (event) => {
  let url = new URL(event.request.url);
  let method = event.request.method;

  // any non GET request is ignored
  if (method.toLowerCase() !== "get") return;

  // check if request is made by chrome extensions or web page
  // if request is made for web page url must contains http.
  if (!(event.request.url.indexOf("http") === 0)) return; // skip the request. if request is not made with http protocol

  // If the request is for the favicons, fonts, or the built files (which are hashed in the name)
  if (
    url.pathname.startsWith("/favicons/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/build/")
  ) {
    event.respondWith(
      // we will open the assets cache
      caches.open("assets").then(async (cache) => {
        // if the request is cached we will use the cache
        let cacheResponse = await cache.match(event.request);
        if (cacheResponse) return cacheResponse;

        // if it's not cached we will run the fetch, cache it and return it
        // this way the next time this asset it's needed it will load from the cache
        let fetchResponse = await fetch(event.request);
        cache.put(event.request, fetchResponse.clone());

        return fetchResponse;
      })
    );
  }

  return;
});
