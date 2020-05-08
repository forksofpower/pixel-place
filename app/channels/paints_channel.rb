class PaintsChannel < ApplicationCable::Channel
  def subscribed
    stream_from "paints_channel"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
