// Gives the admin a clean address (pastel-salon-admin.pages.dev): every request
// is passed unchanged to the pastel-admin Worker, which has no public address.
export default {
  fetch(request, env) {
    return env.ADMIN.fetch(request);
  },
};
