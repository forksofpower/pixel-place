class BitmapController < ApplicationController
    def show
        # redis = $redis
        # set cache expiration
        expires_in 5.seconds, :public => true
        send_data Place.to_binary # , filename: 'place.bmp'
    end
end