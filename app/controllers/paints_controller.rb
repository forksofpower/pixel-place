class PaintsController < ApplicationController
    skip_before_action :verify_authenticity_token

    def create
        # check if user is trying to paint within cooldown period
        now = DateTime.now.utc
        last_paint = Paint.where(user: User.find(1)).last

        if last_paint && ( now.to_i - last_paint.created_at.to_i >= 5)
            color = paint_params[:color]
            x, y = params[:x], params[:y]
            @paint = Paint.create({
                color: color,
                user: User.find(1),
                pixel: Pixel.where(x: x, y: y).first_or_initialize
            })
            # set new color in bitmap
            Place.set_pixel_color(x: x.to_i, y: y.to_i, color: color.to_i)

            render json: @paint.to_json(
                :include => {
                    :user => {:only => [:username]},
                    :pixel => {:only => [:x, :y]}
                }, 
                :except => [:updated_at]
            )
        else
            render json: { errors: ["Wait your turn!"] }
        end
    end

    private
        def paint_params
            params.require(:paint).permit(:x, :y, :color)
        end
end
