import consumer from "./consumer"

consumer.subscriptions.create("PaintsChannel", {
  connected() {
    // Called when the subscription is ready for use on the server
  },

  disconnected() {
    // Called when the subscription has been terminated by the server
  },

  received(data) {
    // Called when there's incoming data on the websocket for this channel
    let event = new CustomEvent('place-queue-update', {
      detail: data
    });
    window.dispatchEvent(event);
  }
});