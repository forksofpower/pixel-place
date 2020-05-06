class BitmapController < ApplicationController
    def show
        redis = Redis.new
        # set cache expiration
        expires_in 5.seconds, :public => true
        send_data Place.to_binary # , filename: 'place.bmp'
    end
end
