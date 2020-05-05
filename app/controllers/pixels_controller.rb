class PixelsController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :find_by_coordinates, only: [:show]
    def show
        # kinda hacky but it works for now
        pixel = @pixel.as_json(
            :except => [:updated_at]
        )
        pixel["color"] = @pixel.color

        pixel["paint"] = @pixel.last_paint.as_json(
            :include => {
                :user => {:only => [:username, :id]},
            },
            :except => [:id, :updated_at, :pixel_id, :user_id]
        )

        render json: pixel.to_json
    end

    private
        def find_by_coordinates
            x, y = params[:x], params[:y]
            @pixel = Pixel.find_by(x: x, y: y)
        end
end
