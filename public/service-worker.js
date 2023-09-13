self.addEventListener("push", (event) => {
  const body = event.data?.text() ?? "";
  event.waitUntil(
    self.registration.showNotification("Teste", {
      body: body,
    })
  );
});
