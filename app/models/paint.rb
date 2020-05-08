class Paint < ApplicationRecord
  belongs_to :user
  belongs_to :pixel

  after_create :broadcast

  private
    def broadcast
      pixel = self.pixel
      message = { 
        x: pixel.x,
        y: pixel.y,
        c: self.color.to_i
      }
      ActionCable.server.broadcast('paints_channel', message: message );
    end
end
